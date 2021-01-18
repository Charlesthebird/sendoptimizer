SELECT
	cm.`subject`,
	sum(cm.opens) as opens,
	sum(cm.uniqueopens) as uniqueopens,
	sum(cm.linkclicks) as linkclicks,
	sum(cm.uniquelinkclicks) as uniquelinkclicks,
    sum(cm.send_amt) as send_amt,
    max(m.`text`) as email_text
FROM sendoptimizer.ac_campaigns c
	JOIN sendoptimizer.ac_campaignmessages cm ON cm.campaignid=c.id
    JOIN sendoptimizer.ac_messages m ON cm.messageid=m.id
GROUP BY cm.`subject`
ORDER BY sum(cm.opens)/sum(cm.send_amt) DESC;