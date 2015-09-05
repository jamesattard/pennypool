var express = require('express');
var router = express.Router();

var title = "PennyPool";

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('create', { title: title });
});

module.exports = router;
