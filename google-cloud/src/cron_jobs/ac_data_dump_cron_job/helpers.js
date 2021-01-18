exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

exports.bulkload = async (tableName, data2D, conn) => {
  // Check that data2D is a 2D array of objects.
  if (data2D.length === 0 || Object.keys(data2D[0]).length === 0) return false;
  // Bulkload into tableName, replacing on duplicate keys.
  // REPLACE works exactly like INSERT, except that if an old row in the table has the same value as a new row for a PRIMARY KEY or a UNIQUE index, the old row is deleted before the new row is inserted.
  var cmd = "REPLACE INTO " + tableName + " (";
  cmd +=
    Object.keys(data2D[0])
      .map((k) => "`" + k + "`")
      .join(", ") + ") VALUES ";
  // Set up the query to be parameterized.
  const params = {}; //[];
  for (var i = 0; i < data2D.length; i++) {
    // Append the correct number of parameter placeholders to the query.
    cmd +=
      "(" +
      Object.values(data2D[i])
        // .map((v) => "?")
        .map((v, idx) => ":param_" + i + "_" + idx)
        .join(", ") +
      "), ";
    // Push the values on to the params object.
    // if (data2D[i].subject !== undefined) console.log("Inserting subject line: " + data2D[i].subject);
    // params.push(
    //   ...Object.values(data2D[i]).map((v) => {
    //     if (typeof v === "string") return v;
    //     else return JSON.stringify(v);
    //   })
    // );
    Object.values(data2D[i]).forEach((v, idx) => {
      var val = "";
      if (typeof v === "string") val = v;
      else val = JSON.stringify(v);
      params["param_" + i + "_" + idx] = val;
    });
  }
  // console.log("Updating table: " + tableName);
  cmd = cmd.substr(0, cmd.length - 2) + ";";
  // console.log(cmd);
  await conn.query({ sql: cmd, params: params });
  console.log("Table updated:", tableName);
  // conn.query(cmd, params, function (error, results) {
  //   if (error) {
  //     console.log(error);
  //     throw error;
  //   }
  //   console.log("Table updated: " + tableName);
  // });
  // console.log(cmd + "\n\n\n");
};
