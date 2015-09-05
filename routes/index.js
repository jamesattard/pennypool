var express = require('express');
var router = express.Router();

var title = "PennyPool";

/* GET home page. */
router.get('/', function(req, res, next) {
	// if (signed in) 
	// redirect(dashboard)
  	// else
  	res.render('index', { title: title, signedin: false });
});

router.get('/dashboard', function(req,res,next) {
	res.render('dashboard', {title: title});
});

router.get('/register', function(req,res,next) {
	res.render('regLog', {title: title, type: 'reg', message: ''});
});

router.get('/login', function(req,res,next) {
	res.render('regLog', {title: title, type: 'login', message: ''});
});

router.get('/verify', function(req,res,next) {
	code = req.query.code;
	verify.checkCode(code);
	res.send('success');
});

module.exports = router;
