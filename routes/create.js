var express = require('express');
var router = express.Router();

var title = "PennyPool";

var session = require('client-sessions');
var mysql = require('mysql');
var config = require('./../configuration/config');
var util = require('util');

var connection_data = {
	host     : config.db_host,
	user     : config.db_user,
	password : config.db_password,
	database : config.db_database
};

router.get('/', function(req, res, next) {
  res.render('create', { title: title });
});

router.post('/', function(req,res) {
	create(req, res, req.body.freq, req.body.memberCount, req.body.premium, req.body.members);
});

function create(req, res, freq, memberCount, premiumVal, members) {
	console.log(members);
	var connection_pool = mysql.createPool(connection_data);
	connection_pool.getConnection(function(err, connection) {
		if (err) {
			console.error('[create.js] : Error connecting to database : ' + err.stack);
			res.render('error.ejs', {message: 'Unable to connect to database at this time'});
			return;
		}
		connection.query("SELECT MAX(`groupId`) AS maxGroupId FROM `CustomerGroup`", function(err, rows, fields) {
			if (err) {
				console.error('[create.js] : Error getting maxGroupId : ' + err.stack);
				return;
			} else {
				var groupId = parseInt(rows[0].maxGroupId, 10) + 1;
				var duration;
				if (freq == 'monthly') 
					duration = 31;
				else
					duration = 7;

				var row = {groupId: groupId, duration: duration, noOfCustomers: memberCount, subscriptionAmount: premiumVal};
				connection.query("INSERT INTO `CustomerGroup` SET ?", row, function(err, rows, fields) {
					if (err) {
						console.error('[create.js] : Error inserting group info : ' + err.stack);
						res.render('error', 'Unable to insert group info');
						return;
					} else {
						for (var i = 0; i < members.length; i++) {
							memberUsername = members[i];
							var row = {userName: memberUsername, groupId: groupId, status: "pending"};
							connection.query("INSERT INTO `customerBelongsToGroup` SET ?", row, function(err,rows,fields) {
								if (err) {
									console.error('[create.js] : Error inserting member : ' + err.stack);
									res.render('error', 'Unable to insert member');
									return;
								} else {
									res.render('index', {title: title});
								}
							});
						}
					}
				});
			}
		});
		connection.release();
	});
};

module.exports = router;
