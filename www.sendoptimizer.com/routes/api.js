// ----------- IMPORTS ----------- //
var express = require("express");
var app = express.Router();
var axios = require("axios");
const { MySQL } = require("mysql-promisify");
const fs = require("fs");

// ----------- API ROUTES (/api/...) ----------- //
// ----------- API ROUTES (/api/...) ----------- //
// ----------- API ROUTES (/api/...) ----------- //
app.get("/search", async (req, res) => {
  var { searchText, order, limit, offset, prevTotal } = req.query;
  if (!searchText) searchText = "%";
  else {
    searchText = searchText
      .trim()
      .toLowerCase()
      .replace(/%/g, "%%")
      .replace(/\s+/g, "%");
    searchText = `%${searchText}%`;
  }
  const isValidOrder =
    order &&
    Object.keys(order).length > 0 &&
    /^[[a-z|A-Z]+$/.test(Object.keys(order)[0]);
  let escapedOrderType = "sdate";
  let escapedOrderDir = "DESC";
  if (isValidOrder) {
    escapedOrderType = Object.keys(order)[0]
      .split("")
      .filter((c) => /[a-z]|[A-Z]|_/.test(c))
      .join("");
    if (order[escapedOrderType] === "ASC") escapedOrderDir = "ASC";
  }
  prevTotal = Number.parseInt(prevTotal);
  if (!prevTotal || isNaN(prevTotal)) prevTotal = null;
  limit = Number.parseInt(limit);
  if (!limit || isNaN(limit)) limit = 10;
  offset = Number.parseInt(offset);
  if (!offset || isNaN(offset)) offset = 0;
  // throw new Error("Incorrect parameters supplied.");
  let connection;
  try {
    // --- ENV VARIABLES --- //
    const {
      DB_HOST,
      DB_USERNAME,
      DB_PASSWORD,
      DB_NAME,
      CLOUD_SQL_CONNECTION_NAME,
      DB_SOCKET_PATH,
    } = process.env;
    const isProd = process.env.NODE_ENV === "production";
    const dbSocketPath = DB_SOCKET_PATH || "/cloudsql";
    // --- MYSQL CONNECTION --- //
    connection = new MySQL({
      host: DB_HOST,
      user: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_NAME,
      charset: "utf8mb4",
      timeout: 60000,
      // Production Mode
      ...(isProd && {
        socketPath: `${dbSocketPath}/${CLOUD_SQL_CONNECTION_NAME}`,
      }),
    });
    const acTables = `
      sendoptimizer.ac_messages m
      JOIN sendoptimizer.ac_campaignmessages cm
      ON cm.messageid=m.id
      JOIN sendoptimizer.ac_campaigns c
      ON cm.campaignid=c.id`;
    let whereCondition = `
      c.sdate <> 'null' AND
      (
        LOWER(m.\`text\`) LIKE :searchText OR
        LOWER(cm.\`subject\`) LIKE :searchText OR
        LOWER(c.\`name\`) LIKE :searchText
      )`;
    // --- FIRST QUERY (get number of results) --- //
    let metaResults;
    if (prevTotal === null) {
      metaResults = (
        await connection.query({
          sql: `
        SELECT COUNT(1) AS total
        FROM (
          SELECT c.id FROM ${acTables}
          WHERE ${whereCondition}
          GROUP BY c.id
        ) tmp;`,
          params: { searchText },
        })
      ).results;
      if (!metaResults || metaResults.length === 0) {
        connection.end();
        res.send({
          campaigns: [],
          campaignMessages: [],
          meta: { total: 0 },
        });
        return;
      }
    } else {
      metaResults = [{ total: prevTotal }];
    }
    // --- SECOND QUERY (get campaigns that match) --- //
    let orderByClause;
    switch (escapedOrderType) {
      case "opens":
      case "uniqueopens":
      case "linkclicks":
      case "uniquelinkclicks":
        // const aggFn = escapedOrderDir === "ASC" ? "MIN" : "MAX";
        const aggFn = "MAX";
        orderByClause = `${aggFn}(CAST(cm.${escapedOrderType} AS SIGNED))`;
        break;
      case "send_amt":
        orderByClause = `CAST(c.${escapedOrderType} AS SIGNED)`;
        break;
      case "sdate":
      default:
        orderByClause = `c.${escapedOrderType}`;
        break;
    }
    orderByClause += ` ${escapedOrderDir}`;
    const { results: cResults } = await connection.query({
      sql: `
        SELECT 
          c.id,
          c.\`name\`,
          c.sdate,
          c.screenshot,
          MAX(m.\`text\`) AS message_text
        FROM ${acTables}
        WHERE ${whereCondition}
        GROUP BY c.id
        ORDER BY ${orderByClause}
        LIMIT :limit
        OFFSET :offset;`,
      params: { searchText, limit, offset },
    });
    // --- THIRD QUERY (get the rest of the campaigns' info) --- //
    const params = {};
    cResults.forEach((r, idx) => (params["id_" + idx] = r.id));
    const idPlaceholders = cResults.map((r, idx) => ":id_" + idx);
    whereCondition = "FALSE";
    if (idPlaceholders.length > 0)
      whereCondition = "cm.campaignid IN (" + idPlaceholders.join(", ") + ")";
    const { results: cmResults } = await connection.query({
      sql: `
        SELECT 
          cm.id,
          cm.campaignid,
          cm.\`subject\`,
          cm.opens,
	        cm.uniqueopens,
	        cm.linkclicks,
          cm.uniquelinkclicks,
          cm.send_amt,
          cm.softbounces,
          cm.hardbounces
        FROM ${acTables}
        WHERE ${whereCondition}
        GROUP BY cm.id;`,
      params,
    });
    connection.end();
    console.log(metaResults);
    const myRes = {
      campaigns: cResults,
      campaignMessages: cmResults,
      meta: metaResults[0],
    };
    // console.log(req.query);
    // console.log(myRes);
    res.send(myRes);
    console.log("\n------ Complete! ------");
    console.log("NUM ROWS", cResults.length);

    // console.log("TEXT", searchText);
    // res.send({ searchText });
  } catch (err) {
    // Try to close the connection if it was opened.
    if (connection) {
      try {
        connection.end();
      } catch {}
    }
    console.log(err);
    res.send({ error: err.toString() });
  }
});

app.get("/campaigns", async (req, res) => {
  // console.log(req.query);
  try {
    const base = "https://" + req.query.acName + ".api-us1.com/api/3/";
    const options = "&limit=" + req.query.limit + "&offset=" + req.query.offset;
    var myRes = await axios.get(
      // !This is how you sideload (include all) the below data into one call:
      // base + "campaigns?include=campaignMessages,links",
      // !This is the ordered and filtered version
      // base + "campaigns?orders[sdate]=ASC&filters[type]=split",
      // !This is the combined version
      base +
        "campaigns?include=campaignMessages,links&orders[sdate]=DESC&filters[type]=split" +
        options,
      // "campaigns?include=campaignMessages,links,campaignMessages.message&orders[sdate]=ASC&filters[type]=split",
      // ----------- LINKS (for each campaign result) -------------- //
      // -- No data
      // base + "campaigns/4/aggregateRevenues",
      // -- No data
      // base + "campaigns/4/automation",
      // -- Shows the lists of emails this was sent to (assuming it shows more than 1 list if it was sent to >1 lists)
      // base + "campaigns/4/campaignLists",
      // -- Basically the same as the campaign-list endpioint, just for this campaign.
      // base + "campaigns/4/campaignMessage",
      // !-------- campaignMessages has the subject line for each split test!!! ---- //
      // base + "campaigns/4/campaignMessages",
      // !----- summation of all metrics for split with "message" y are stored where "message"=0
      // !----- /campaign/x/links has the # of clicks for each link in each split with "message" y in campaign x!!! -- //
      // base + "campaigns/4/links",
      // -- No data
      // base + "campaigns/4/segment",
      // -- User account info for the user who sent or created it.
      // base + "campaigns/4/user",
      {
        headers: {
          "Api-Token": req.query.acToken,
        },
      }
    );
    // console.log(myRes.data);
    res.send(myRes.data);
  } catch (err) {
    console.log(err);
    res.send({ error: err.toString() });
  }
});

// ----------- EXPORT ----------- //
module.exports = app;
