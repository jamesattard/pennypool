var mysql = require('mysql');
var twilio = require('twilio');
var session = require('client-sessions');
var config = require('./../configuration/config');
var title = 'PennyPool';
var util = require('util');

//Connection data
var connection_data = {
host     : config.db_host,
user     : config.db_user,
password : config.db_password,
database : config.db_database
};

function register(req, res, firstname, lastname, username, email, phone, password, bankAccount, routingNumber, bankName) {
	var connection_pool = mysql.createPool(connection_data);
	connection_pool.getConnection(function(err, connection) {
		if (err) {
			console.error('[register.js] : Error connecting to database : ' + err.stack);
			res.render('error.ejs', {message: 'Unable to connect to database at this time'});
			return;
		}
		connection.query("select * from CUSTOMER where username='" + username + "'", function(err, rows, fields) {
			if (!err) {
				if (rows.length == 0) {
					var code = random(10000,100000);
					send_sms(code, phone);
					var row = {accountId:bankAccount, bankName:bankName, routingNumber:routingNumber};
					connection.query('insert into bankDetails set ?', row, function(err, rows, fields) {
						if (!err) {
			
						}
						else {
							console.error('[register.js] : Error querying login table : ' + err.stack);
							res.render('error.ejs', {message: 'Unable to query database at this time'});
							return;
						}
					});
					var row = {userName:username, firstName:firstname, lastName:lastname, emailId:email, password:password, accountId:bankAccount, phoneNo:phone, verificationCode:code, isVerified:0};
					connection.query('insert into CUSTOMER set ?', row, function(err, rows, fields) {
						if (!err) {
							req.session.username = username;
							req.session.firstname = firstname;
							res.render('mobileVerification', {title: 'PennyPool', message: 'welcome'});
							return;
						}
						else {
							console.error('[register.js] : Error querying login table : ' + err.stack);
							res.render('error.ejs', {message: 'Unable to query database at this time'});
							return;
						}
					});
				}
				else {
					res.render('regLog', {title: title, type: 'reg', message: 'username already exists'});
					return;
				}
			}
			else {
				console.log(err);
				res.render('error.ejs', {message: 'something went wrong'});
				return;
			}
		});
		connection.release();
	});
}

function random(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

function send_sms(code, phone) {
 	var client = new twilio.RestClient(config.twilio_sid, config.twilio_token);
 	client.sendMessage({
    	to:'+1'+phone,
    	from:config.twilio_phone,
    	body:'Verification Code for PennyPool: ' + code + '. Please enter this in the website to verify your account'
	}, function(error, message) {
    if (!error) {
    	
    } 
    else {
        console.log('[register.js] : Twilio Error' + util.inspect(error, false, null));
    }
	});
}

exports.register = function(req, res){
	register(req, res, req.body.fname, req.body.lname, req.body.uname, req.body.email, req.body.phoneNo, req.body.pword, req.body.bankNo, req.body.routingNo, req.body.bankName);
};