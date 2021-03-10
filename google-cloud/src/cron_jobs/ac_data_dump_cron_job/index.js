var axios = require('axios')
var { MySQL } = require('mysql-promisify')
var { bulkload, sleep, formatDataForTable } = require('./helpers')

/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
exports.main = (event, context) => {
  // --- ENV VARIABLES --- //
  const {
    DB_HOST,
    DB_USERNAME,
    DB_PASSWORD,
    DB_NAME,
    AC_ACCOUNT,
    AC_API_TOKEN,
    CLOUD_SQL_CONNECTION_NAME,
    DB_SOCKET_PATH,
  } = process.env
  const dbSocketPath = DB_SOCKET_PATH || '/cloudsql'
  const isProd = process.env.NODE_ENV === 'production'

  // --- CLOUD SQL CONNECTION --- //
  var connection = new MySQL({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    charset: 'utf8mb4',
    timeout: 60000,
    // Production Mode
    ...(isProd && {
      socketPath: `${dbSocketPath}/${CLOUD_SQL_CONNECTION_NAME}`,
    }),
  })

  const base = 'https://' + AC_ACCOUNT + '.api-us1.com/api/3/'
  const pageSize = 10

  async function doDataDump(timeframeHoursToUpdate = -1) {
    // Do initial data check (to get totalRows and numPages).
    const initialRes = await axios.get(
      base +
        'campaigns?orders[sdate]=DESC&filters[type]=split&limit=1&offset=0',
      { headers: { 'Api-Token': AC_API_TOKEN } },
    )
    var totalRows = Number.parseInt(initialRes.data.meta.total)
    var numPages = Math.ceil(totalRows / pageSize)
    console.log(
      '---- META ----',
      '\nNumber of rows: ' + totalRows,
      '\nPage size: ' + pageSize,
      '\nNumber of pages: ' + numPages,
    )
    // For each page:
    for (let i = 0; i < numPages; i++) {
      var pageOffset = pageSize * i
      // Do Active Campaign API request.
      const options = '&limit=' + pageSize + '&offset=' + pageOffset
      var pageRes = await axios.get(
        base +
          'campaigns?include=campaignMessages,campaignMessages.message,links&orders[sdate]=DESC&filters[type]=split' +
          options,
        { headers: { 'Api-Token': AC_API_TOKEN } },
      )
      console.log('\nGot page ' + i + ' / ' + numPages, pageRes.data)
      var dataToDump = JSON.parse(JSON.stringify(pageRes.data))
      delete dataToDump.meta
      // Check if we need to update all of these campaigns, or if we should stop after this page.
      var shouldStopAfterThisPage = false
      if (timeframeHoursToUpdate !== -1) {
        // Check each campaign to only update the ones within the timeframeHoursToUpdate.
        var now = new Date()
        for (let j = 0; j < pageRes.data.campaigns.length; j++) {
          var c = pageRes.data.campaigns[j]
          var sdate = new Date(c.sdate)
          var hoursSinceSend = (now - sdate) / (60 * 60 * 1000)
          // If this is outside of the campaign timeframe to update.
          if (hoursSinceSend > timeframeHoursToUpdate) {
            // Stop making page requests after this page is put into the database.
            shouldStopAfterThisPage = true
            // Remove associated data for this campaign, campaignMessages, messages, and links.
            dataToDump.campaigns = dataToDump.campaigns.filter(
              (c2) => c2.id !== c.id,
            )
            dataToDump.campaignMessages = dataToDump.campaignMessages.filter(
              (cm) => {
                if (cm.campaignid === c.id) {
                  // If this campaignMessage is to be removed.
                  // Remove the associated message.
                  dataToDump.messages = dataToDump.messages.filter(
                    (m) => m.id !== cm.messageid,
                  )
                  // Filter this campaignMessage out of the results.
                  return false
                } else return true
              },
            )
            dataToDump.links = dataToDump.links.filter(
              (l) => l.campaignid !== c.id,
            )
          }
        }
      }
      // Bulkload into the correct tables.
      // For each key, k (campaignMessages, messages, links, campaigns, meta):
      var dataToDumpKeys = Object.keys(dataToDump)
      for (let dk = 0; dk < dataToDumpKeys.length; dk++) {
        var k = dataToDumpKeys[dk]
        // Bulkload (insert and update) the 2D array of of results for k into the associated database table.
        var tableName = '`' + DB_NAME + '`.`ac_' + k.toLowerCase() + '`'
        var data2D = dataToDump[k]
        formatDataForTable(data2D, tableName)
        // Wait for the bulkload to finish.
        await bulkload(tableName, data2D, connection)
      }
      if (shouldStopAfterThisPage) break
      // Wait between requests to prevent ActiveCampaign from capping/throttling us.
      else await sleep(1000)
    }
    console.log('\n------ Complete! ------')
    connection.end()
  }

  /*
  async function testConnection() {
    var tableName = "`" + DB_NAME + "`.`test_table`";
    await bulkload(
      tableName,
      [
        { some_value: Math.floor(Math.random() * 100000) },
        { some_value: Math.floor(Math.random() * 100000) },
      ],
      connection
    );
    console.log("\n------ Complete! ------");
    connection.end();
  }
  testConnection();
  */

  // Parameter is the number of hours before now to check and update.
  // Leaving it out will do the data dump for the entire database (which takes a long time)!!!
  doDataDump(48)
  // doDataDump()
}

if (process.env.NODE_ENV === 'development') exports.main()
