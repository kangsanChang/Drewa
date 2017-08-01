const express = require('express');
const path = require('path');
// const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
// app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// initializing passport with passport-jwt strategy
app.use(passport.initialize());
require('./controller/authController').jwtPassport();

app.use((req, res, next) => {
  res.r = (data) => {
    res.json({
      msg: 'success',
      data,
    });
  };
  next();
});

app.use('/api', require('./routes/index')(express.Router()));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({ msg: err.message, data: null });
  console.log(err);
});

module.exports = app;
