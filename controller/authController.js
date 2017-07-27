const JWTStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/config.json');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const models = require('../models');

const jwtPassport = () => {
  const opts = {
    /*
     * extractJwt.fromAuthHeader -> Header name is 'Authorization', values are like 'JWT TOKEN'
     * extractJwt.fromHeader('NAME') -> Header name is 'NAME', values are like 'TOKEN'
     */
    // jwtFromRequest: extractJwt.fromAuthHeader(),
    jwtFromRequest: extractJwt.fromHeader('token'),
    secretOrKey: config.auth.SECRET_KEY,
  };
  passport.use(new JWTStrategy(opts, (jwtPayload, done) => {
    // TODO: 분석된 토큰 매칭하는 로직 만들기
    // Matching decoded token
    if (jwtPayload) {
      return done(null, jwtPayload);
    }
    return done(new Error('No user matched with jwt payload'));
  }));
};

const comparePassword = async (userEmail, userPassword) => {
  try {
    // TODO: findByEmail 함수 완성할것
    // const result = await Users.findByEmail(userEmail);
    const condition = {
      where: {
        userEmail,
      },
    };
    const result = await models.userInfoTb.find(condition);
    if (!result) {
      throw new Error('Email not exist');
    }
    // Password Matching
    // TODO: 모델링 완성되면 userPassword 설정할것
    const isMatch = await bcrypt.compare(userPassword, result.userPassword);
    if (!isMatch) {
      throw new Error('Password Not match');
    }
  } catch (err) {
    throw err;
  }
};

const createToken = async (userEmail, userName, userType) => {
  const payloads = {
    userEmail,
    userName,
    userType,
  };
  const token = await jwt.sign(payloads, config.auth.SECRET_KEY,
    { expiresIn: config.auth.EXPIRES });
  return token;
};

const authenticate = passport.authenticate('jwt', { session: false });

module.exports.jwtPassport = jwtPassport;
module.exports.comparePassword = comparePassword;
module.exports.createToken = createToken;
module.exports.authenticate = authenticate;