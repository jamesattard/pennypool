var express = require('express');
var router = express.Router();

var title = "PennyPool";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: title });
});

router.get('/register', function(req,res,next) {
	res.render('reg_log', {title: title, type: 'reg'});
});

router.get('/login', function(req,res,next) {
	res.render('reg_log', {title: title, type: 'login'});
});

module.exports = router;
