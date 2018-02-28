global.env = process.env.NODE_ENV || 'development';
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();

logger.token('ktime', () => new Date().toLocaleString());
logger.token('ip', req => req.headers['x-forwarded-for']);

if (global.env !== 'test') {
  app.use(logger(
    ':ip > :remote-user [:ktime] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    { skip: (req, res) => req.headers['user-agent'] === 'ELB-HealthChecker/2.0' },
  ));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Load models
require('./models');

// initializing passport with passport-jwt strategy
const auth = require('./controller/jwtAuth')();
app.use(auth.initialize());

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
  // multer 모듈에서 파일 사이즈 오류 던진 경우.
  // parameter 로 받아온 변수에 assign 하면 에러 뜸 (no-param-reassign)
  if (err.code === 'LIMIT_FILE_SIZE') {
    console.log('catch LIMIT FILE ERROR in app.js', err);
    err.status = 400;
  }

  res.status(err.status || 500);
  res.json({ msg: err.message, data: null });
  if (global.env === 'development' && err.status !== 404) {
    console.log(err);
  }
});

module.exports = app;
