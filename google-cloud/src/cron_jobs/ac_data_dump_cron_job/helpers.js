exports.sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

exports.bulkload = async (tableName, data2D, conn) => {
  // Check that data2D is a 2D array of objects.
  if (data2D.length === 0 || Object.keys(data2D[0]).length === 0) return false
  // Bulkload into tableName, replacing on duplicate keys.
  // REPLACE works exactly like INSERT, except that if an old row in the table has the same value as a new row for a PRIMARY KEY or a UNIQUE index, the old row is deleted before the new row is inserted.
  var cmd = 'REPLACE INTO ' + tableName + ' ('
  cmd +=
    Object.keys(data2D[0])
      .map((k) => '`' + k + '`')
      .join(', ') + ') VALUES '
  // Set up the query to be parameterized.
  const params = {} //[];
  for (var i = 0; i < data2D.length; i++) {
    // Append the correct number of parameter placeholders to the query.
    cmd +=
      '(' +
      Object.values(data2D[i])
        // .map((v) => "?")
        .map((v, idx) => ':param_' + i + '_' + idx)
        .join(', ') +
      '), '
    // Push the values on to the params object.
    // if (data2D[i].subject !== undefined) console.log("Inserting subject line: " + data2D[i].subject);
    // params.push(
    //   ...Object.values(data2D[i]).map((v) => {
    //     if (typeof v === "string") return v;
    //     else return JSON.stringify(v);
    //   })
    // );
    Object.values(data2D[i]).forEach((v, idx) => {
      var val = ''
      if (typeof v === 'string') val = v
      else val = JSON.stringify(v)
      params['param_' + i + '_' + idx] = val
    })
  }
  // console.log("Updating table: " + tableName);
  cmd = cmd.substr(0, cmd.length - 2) + ';'
  // console.log(cmd);
  await conn.query({ sql: cmd, params: params })
  console.log('Table updated:', tableName)
  // conn.query(cmd, params, function (error, results) {
  //   if (error) {
  //     console.log(error);
  //     throw error;
  //   }
  //   console.log("Table updated: " + tableName);
  // });
  // console.log(cmd + "\n\n\n");
}

// ----------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------- //
// ----------------------------------------------------------------------------------------------------- //
// ------- FORMATS DATA FOR TABLE (to prevent activeCampaign API changes from breaking this job) ------- //
const assignKeys = (d, keys) => {
  var newObj = {}
  var dKeys = Object.keys(d)
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i]
    var value = ''
    if (dKeys.find((dk) => dk === key) !== undefined) value = d[key]
    newObj[key] = value
  }
  return newObj
}
exports.formatDataForTable = (data, tableName) => {
  var tableColumns = []
  switch (tableName) {
    case '`sendoptimizer`.`ac_campaignmessages`':
      tableColumns = [
        'id',
        'messageid',
        'campaignid',
        'percentage',
        'sourcesize',
        'send_amt',
        'total_amt',
        'opens',
        'uniqueopens',
        'linkclicks',
        'uniquelinkclicks',
        'subscriberclicks',
        'forwards',
        'uniqueforwards',
        'hardbounces',
        'softbounces',
        'unsubscribes',
        'unsubreasons',
        'updates',
        'socialshares',
        'replies',
        'uniquereplies',
        'spamcheck_score',
        'spamcheck_max',
        'initial_split_percentage',
        'screenshot',
        'subject',
        'message',
        'links',
        'campaign',
      ]
      break
    case '`sendoptimizer`.`ac_campaigns`':
      tableColumns = [
        'id',
        'type',
        'userid',
        'segmentid',
        'bounceid',
        'realcid',
        'sendid',
        'threadid',
        'seriesid',
        'formid',
        'basetemplateid',
        'basemessageid',
        'addressid',
        'source',
        'name',
        'cdate',
        'mdate',
        'sdate',
        'ldate',
        'send_amt',
        'total_amt',
        'opens',
        'uniqueopens',
        'linkclicks',
        'uniquelinkclicks',
        'subscriberclicks',
        'forwards',
        'uniqueforwards',
        'hardbounces',
        'softbounces',
        'unsubscribes',
        'unsubreasons',
        'updates',
        'socialshares',
        'replies',
        'uniquereplies',
        'status',
        'public',
        'mail_transfer',
        'mail_send',
        'mail_cleanup',
        'mailer_log_file',
        'tracklinks',
        'tracklinksanalytics',
        'trackreads',
        'trackreadsanalytics',
        'analytics_campaign_name',
        'tweet',
        'facebook',
        'survey',
        'embed_images',
        'htmlunsub',
        'textunsub',
        'htmlunsubdata',
        'textunsubdata',
        'recurring',
        'willrecur',
        'split_type',
        'split_content',
        'split_offset',
        'split_offset_type',
        'split_winner_messageid',
        'split_winner_awaiting',
        'responder_offset',
        'responder_type',
        'responder_existing',
        'reminder_field',
        'reminder_format',
        'reminder_type',
        'reminder_offset',
        'reminder_offset_type',
        'reminder_offset_sign',
        'reminder_last_cron_run',
        'activerss_interval',
        'activerss_url',
        'activerss_items',
        'ip4',
        'laststep',
        'managetext',
        'schedule',
        'scheduleddate',
        'waitpreview',
        'deletestamp',
        'replysys',
        'created_timestamp',
        'updated_timestamp',
        'created_by',
        'updated_by',
        'ip',
        // 'series_send_lock_time', <- this column was added by Active Campaign, and was breaking this job.
        'segmentname',
        'has_predictive_content',
        'screenshot',
        'campaignMessages',
        'links',
        'user',
        'automation',
      ]
      break
    case '`sendoptimizer`.`ac_links`':
      tableColumns = [
        'id',
        'campaignid',
        'messageid',
        'link',
        'name',
        'ref',
        'tracked',
        'created_timestamp',
        'updated_timestamp',
        'created_by',
        'updated_by',
        'uniquelinkclicks',
        'linkclicks',
        'links',
        'campaign',
        'message',
      ]
      break
    case '`sendoptimizer`.`ac_messages`':
      tableColumns = [
        'id',
        'userid',
        'ed_instanceid',
        'ed_version',
        'cdate',
        'mdate',
        'name',
        'fromname',
        'fromemail',
        'reply2',
        'priority',
        'charset',
        'encoding',
        'format',
        'subject',
        'preheader_text',
        'text',
        'html',
        'htmlfetch',
        'textfetch',
        'hidden',
        'preview_mime',
        'preview_data',
        'has_predictive_content',
        'links',
        'user',
      ]
      break
    default:
      console.log('Invalid table name', tableName, data)
      return
  }
  for (var i = 0; i < data.length; i++)
    data[i] = assignKeys(data[i], tableColumns)
}
