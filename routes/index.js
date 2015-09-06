var express = require('express');
var verify = require('../routes/verify');
var session = require('client-sessions');

var router = express.Router();

var title = "PennyPool";

/* GET home page. */
router.get('/', function(req, res, next) {
	if ( req.session.username !== 'undefined' ) {
		res.render('dashboard', {title: title, user_name: req.session.firstname});
	} else {
		res.render('index', {title: title, signedin: false});
	}
});

router.get('/dashboard', function(req,res,next) {
	res.render('dashboard', {title: title, user_name: req.session.firstname});
});

router.get('/register', function(req,res,next) {
	res.render('regLog', {title: title, type: 'reg', message: ''});
});

router.get('/login', function(req,res,next) {
	res.render('regLog', {title: title, type: 'login', message: ''});
});

router.get('/verify', function(req,res,next) {
	code = req.query.code;
	verify.checkCode(req, res, code);
});

router.get('/db2', function(req,res,next) {
	res.render('dashboard', { title : title, groups: [], user_name: req.session.firstname});
});

router.get('/lb', function(req,res,next) {
	res.render('liveBid', { title: title, group: {}});
});

module.exports = router;
