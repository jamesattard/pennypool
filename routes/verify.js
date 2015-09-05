var express = require('express');
var mysql = require('mysql');
var config = require('./../configuration/config');
var session = require('client-sessions');

var connection_data = {
	host     : config.db_host,
	user     : config.db_user,
	password : config.db_password,
	database : config.db_database
};

function verify(req,res,code) {
	var username = req.session.username;
	var connection_pool = mysql.createPool(connection_data);
	connection_pool.getConnection(function(err, connection) {
		if (err) {
			console.error('[verify.js] : cannot connect to db : ' + err.stack);
			res.render('error', {message: "Cannot connect to table"});
			return;
		} else {
			connection.query("select * from CUSTOMER where userName='" + username + "'", function(err, rows, fields) {
				if (err) {
					console.error('[verify.js] : error selecting user information  : ' + err.stack);
					res.render('error', {message:"Can't select users info"});
					return;
				} else {
					user_code = rows[0].verificationCode;
					console.log('Code is '+code + ' and db code is '+user_code);
					if (code == user_code) {
						connection.query("update CUSTOMER set isVerified = 1 where verificationCode = '" + code + "' and userName = '" + username + "'", function(err, rows, fields) {
							if (err) {
								console.error('[verify.js] : error update user verification : ' + err.stack);
								res.render('error', {message: 'Can\'t update user verification'});
								return;
							} else {
								res.render('dashboard', {title: 'PennyPool', welcomemessage: 'welcome'});
							}
						});
					} else {
						res.render('mobileVerification', {title: 'PennyPool', message: 'wrong code'});
					}
				}
			});
			connection.release();
		}
	});
}

exports.checkCode = function(req, res, code) {
	verify(req, res, code);
}
