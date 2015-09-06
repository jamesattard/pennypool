var express = require('express');
var verify = require('../routes/verify');
var session = require('client-sessions');

var router = express.Router();

var title = "PennyPool";

/* GET home page. */
router.get('/', function(req, res, next) {
	if ( JSON.stringify(req.session) === '{}' || req.session.firstname == null ) {
		res.render('index', {title: title, signedin: false});
	} else {
		res.render('dashboard', { title: title, user_name: req.session.firstname });
	}
});

router.get('/dashboard', function(req,res,next) {
	res.render('dashboard', { title: title, user_name: req.session.firstname });
});

router.get('/logout', function(req,res,next) {
	delete req.session.username; delete req.session.firstname;
	res.redirect('/');
});

router.get('/register', function(req,res,next) {
	if ( JSON.stringify(req.session) !== '{}' )
		res.redirect('/');
	else
		res.render('regLog', {title: title, type: 'reg', message: ''});
});

router.get('/login', function(req,res,next) {
	if ( JSON.stringify(req.session) !== '{}' )
		res.redirect('/');
	else
		res.render('regLog', {title: title, type: 'login', message: ''});
});

router.get('/verify', function(req,res,next) {
	code = req.query.code;
	verify.checkCode(req, res, code);
});

router.get('/learn-more', function(req,res,next){
	res.render('learnMore');
});

router.get('/db2', function(req,res,next) {
	res.render('dashboard', { title : title, user_name: req.session.firstname, groups: 
		[{
			"groupId": 1001 ,
			"memberCount": 4,
			"premium": 100 ,
			"freq": "monthly",
			"isMember": false,
			"status": [
				{
					"name":"kaushik" ,
					"member": true
				},
				{
					"name": "shashank",
					"member": true
				},
				{
					"name": "parul",
					"member": true
				},
			]
		},
		{
			"groupId": 1002,
			"memberCount": 7,
			"premium": 150,
			"freq": "monthly",
			"isMember": true,
			"info": {
				"iterations": [
					{
						"iteration":1,
						"winner":"Aakriti",
						"amount":700
					},
					{
						"iteration":2,
						"winner": "shashank",
						"amount": 880
					}
				],
				"pendingWinners":["kaushik","parul","anudeep","saga","shipra"]
			}
		}]
	});
});

router.get('/lb', function(req,res,next) {
	res.render('liveBid', { title: title, group: {
		"groupId":1001,
		"iteration":1,
		"currentLeaderName": "Kaushik",
		"currentLeaderAmount": 360,
		"bidHistory": [
			{
				"username":"Keshav",
				"amount": 366,
				"timestamp": "2015-09-05 10:20:55" 
			},
			{
				"username":"Shashank",
				"amount":370,
				"timestamp":"2015-09-05 10:15:30"
			},
			{
				"username":"Parul",
				"amount":375,
				"timestamp":"2015-09-05 10:00:00"
			}
		]
	}});
});

module.exports = router;
