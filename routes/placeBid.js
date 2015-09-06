var mysql = require('mysql');
var twilio = require('twilio');
var session = require('client-sessions');
var config = require('./../configuration/config');
var config = require('./../configuration/config');

var title = 'PennyPool';

//Connection data
var connection_data = {
host     : config.db_host,
user     : config.db_user,
password : config.db_password,
database : config.db_database
};

function placeBid(req, res, username, bidId, amount) {
	var currentTime = new Date().getTime();
	var connection_pool = mysql.createPool(connection_data);
	connection_pool.getConnection(function(err, connection) {
		if (err) {
			console.error('[placeBid.js] : Error connecting to database : ' + err.stack);
			res.render('error.ejs', {message: 'unable to connect to database at this time'});
			return;
		}
		connection.query("select * from bidInfo where bidId = " + bidId, function(err, rows, fields) {
			if (!err) {
				if (rows.length == 0) {
					console.error('[liveBid.js] : Bid not found in database : ' + err.stack);
					res.render('error.ejs', {message: 'unable to connect to database at this time'});
					return;
				}
				if (rows[0].bidAmount <= amount) {
					res.render('liveBid.ejs', {title: title, message: 'invalid amount'});
					return;
				}
				connection.query("update bidInfo set bidAmount = " + amount + ", winner = '" + username + "' where bidId = " + bidId, function(err, rows, fields) {
					if (!err) {
						var row = {bidId: bidId, userName: username, currentTime: currentTime, bidValue: amount};
						connection.query('insert into transactionInfo set ?', row, function(err, rows, fields) {
							if (!err) {
								connection.query("select phoneNo from CUSTOMER C1 inner join customerBelongsToGroup C2 on C1.username = C2.username and C2.groupId = " + groupId, function(err, rows, field) {
									if (!err) {
										var phoneNumbers = [];
										for(int i=0; i<rows.length; i++) {
											phoneNumbers.push(rows[i].phoneNo);
										}
										sendMessages(phoneNumbers, amount, username);
										connection.query("select * from bidInfo where bidId = " + bidId, function(err, rows, fields) {
											if (!err) {
												if (rows.length == 0) {
													console.error('[liveBid.js] : Bid not found in database : ' + err.stack);
													res.render('error.ejs', {message: 'unable to connect to database at this time'});
													return;
												}
												var groupId = rows[0].groupId;
												var iteration = rows[0].iteration;
												var endTime = rows[0].endTime;
												var currentWinnerName = rows[0].winner;
												var currentWinnerAmount = rows[0].bidAmount;
												connection.query("select * from transactionInfo where bidId = " + bidId + " order by currentTime", function(err, rows, fields) {
													if (!err) {
														var bidHistory = [];
														for (var i=0; i<rows.length; i++) {
															var bidHistoryRecord = {};
															bidHistoryRecord.username = rows[i].userName;
															bidHistoryRecord.amount = rows[i].bidValue;
															bidHistoryRecord.timestamp = rows[i].currentTime;
															bidHistory.push(bidHistoryRecord);
														}
														res.render('liveBid.ejs', {title: title, groupId: groupId, iteration: iteration, currentWinnerName: currentWinnerName, currentWinnerAmount: currentWinnerAmount, endTime: endTime, bidHistory: bidHistory});
														return;
													}
													else {
														console.error('[liveBid.js] : Error querying transactionInfo table : ' + err.stack);
														res.render('error.ejs', {message: 'Unable to query database at this time'});
														return;
													}
												});
											}
											else {
												console.error('[liveBid.js] : Error querying bidInfo table : ' + err.stack);
												res.render('error.ejs', {message: 'Unable to query database at this time'});
												return;
											}
										});
									}
									else {
										console.error('[liveBid.js] : Bid not found in database : ' + err.stack);
										res.render('error.ejs', {message: 'unable to connect to database at this time'});
										return;
									}
								});
							}
							else {
								console.error('[liveBid.js] : Error querying bidInfo table : ' + err.stack);
								res.render('error.ejs', {message: 'Unable to query database at this time'});
								return;
							}
						});
					}
					else {
						console.error('[liveBid.js] : Error querying bidInfo table : ' + err.stack);
						res.render('error.ejs', {message: 'Unable to query database at this time'});
						return;
					}
				});

			}
			else {
				console.error('[liveBid.js] : Error querying bidInfo table : ' + err.stack);
				res.render('error.ejs', {message: 'Unable to query database at this time'});
				return;
			}
		});
		connection.release();
	});
}

function sendMessages(phoneNumbers, amount, username) {
	for(int i=0; i<phoneNumbers.length; i++) {
		send_sms(phoneNumbers[i], amount, username);
	}
}

function send_sms(phone, amount, username) {
 	var client = new twilio.RestClient(config.twilio_sid, config.twilio_token);
 	client.sendMessage({
    	to:'+1'+phone,
    	from:config.twilio_phone,
    	body:'New bid placed! ' + username + ' placed a bid at ' + amount + '. Please log on and place a bid if youre interested.';
	}, function(error, message) {
    if (!error) {
    	
    } 
    else {
        console.log('[register.js] : Twilio Error' + util.inspect(error, false, null));
    }
	});
}

exports.placeBid = function(req, res){
	placeBid(req, res, req.session.username, req.body.bidId, req.body.amount);
};