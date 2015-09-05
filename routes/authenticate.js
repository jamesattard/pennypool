var mysql = require('mysql');
var session = require('client-sessions');
var config = require('./../configuration/config');
var config = require('./../configuration/config');

//Connection data
var connection_data = {
host     : config.db_host,
user     : config.db_user,
password : config.db_password,
database : config.db_database
};

//Function to authenticate the username and password provided by the user
function authenticate(req, res, username, password) {
	var connection_pool = mysql.createPool(connection_data);
	connection_pool.getConnection(function(err, connection) {
		if (err) {
			console.error('[authentication.js] : Error connecting to database : ' + err.stack);
			res.render('errorPage.ejs', {message: 'unable to connect to database at this time'});
			return;
		}
		connection.query("select * from Customer where userName='" + username + "'", function(err, rows, fields) {
			if (!err) {
				if (rows.length == 0) {
					res.render('reg_log', {title: title, type: 'login', message: 'username does not exist'});
					return;
				}
				var password_from_db = rows[0].password;
				var isVerified = rows[0].isVerified;
				var firstname = rows[0].firstName;
				if (password == password_from_db) {
					req.session.username = userName;
					req.session.firstname = firstname;
					if (isVerified == 0) {
						console.log('SUCCESS: Redirecting to homepage');
						res.render('dashboard', {title: title});
						return;
					}
					else {
						res.render('mobileVerification', {message: 'verification pending'});
						return;
					}
				}
				else {
					res.render('reg_log', {title: title, type: 'login', message: 'wrong password'});
					return;
				}
			}
			else {
				console.error('[authentication.js] : Error querying Customers table : ' + err.stack);
				res.render('errorPage.ejs', {message: 'Unable to query database at this time'});
				return;
			}
		});
		connection.release();
	});
}

exports.authenticate = function(req, res){
	authenticate(req, res, req.body.uname, req.body.pword); //Variables for email and password field from UI
};