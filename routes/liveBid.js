var mysql = require('mysql');
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

function getBidInfo(req, res, username, firstname, bidId) {
	var connection_pool = mysql.createPool(connection_data);
	connection_pool.getConnection(function(err, connection) {
		if (err) {
			console.error('[liveBid.js] : Error connecting to database : ' + err.stack);
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
		connection.release();
	});
}

exports.getBidInfo = function(req, res){
	getBidInfo(req, res, req.session.username, req.session.firstname, req.body.bidId); //Variables for email and password field from UI
};