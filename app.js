var express = require('express');
var path = require('path');
var redis = require('redis');
var logger = require('morgan');
var CookieParser = require('cookie-parser');
var SECRET = 'hellonihao';
var cookieParser = CookieParser(SECRET);
var bodyParser = require('body-parser');
var session = require('express-session');
var connectRedis = require('connect-redis');
var RedisStore = connectRedis(session);
var rClient = redis.createClient();
var sessionStore = new RedisStore({client: rClient});

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(session({
  store: sessionStore,
  secret: SECRET,
  resave: true,
  saveUninitialized: true
}))
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));

// setup routes
var routes = require('./routes/index');
app.use('/', routes);

app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.sessionStore = sessionStore;
app.cookieParser = cookieParser;

module.exports = app;
