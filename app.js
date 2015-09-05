var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('client-sessions');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var create = require('./routes/create');
var authenticatefile = require('./routes/authenticate');
var register = require('./routes/register');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  cookieName: 'session',
  secret: 'pennypool',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

var authenticate = function (req, res, next) {
  var isAuthenticated = true;
  if (req.session.name == undefined) {
    isAuthenticated = false;
  }
  if (isAuthenticated) {
    next();
  }
  else {
    res.redirect('/');
  }
}

app.use('/', routes);
app.use('/create', create);

app.post('/register', function(req,res,next) {
  register.register(req, res);  
});
app.post('/login', function(req,res,next) {
  authenticatefile.authenticate(req, res);
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
