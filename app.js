const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
global.env = process.env.NODE_ENV || 'development';

const app = express();

logger.token('ktime', () => {
  return new Date().toLocaleString();
});
logger.token('ip', (req) => {
  return req.headers['x-forwarded-for'];
});
app.use(logger(
  ':ip > :remote-user [:ktime] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
  { skip: (req, res) => { return req.headers['user-agent'] === 'ELB-HealthChecker/2.0'; } }));
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
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ msg: err.message, data: null });
  if (global.env === 'development' && err.status !== 404) {
    console.log(err);
  }
});

module.exports = app;
