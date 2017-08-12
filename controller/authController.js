const JWTStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const config = require('../config/config.json');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const models = require('../models');

module.exports.jwtPassport = () => {
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
    // Matching decoded token
    const result = models.userInfoTb.findOne({ where: { userEmail: jwtPayload.userEmail } });
    if (!result) {
      return done(new Error('No user matched with jwt payload'));
    }
    return done(null, jwtPayload);
  }));
};

const createToken = async (userIdx, userEmail, userName, userType) => {
  const payloads = {
    userIdx,
    userEmail,
    userName,
    userType,
  };
  const token = await jwt.sign(payloads, config.auth.SECRET_KEY,
    { expiresIn: config.auth.EXPIRES });
  return token;
};

module.exports.comparePassword = async (userEmail, userPassword) => {
  /*
   * 비밀번호 비교해서 토큰 발급까지 함.
   * 중간에 에러나면 에러를 던진다.
   */
  try {
    const result = await models.userInfoTb.findOne({ where: { userEmail } });
    if (!result) {
      throw new Error('Email not exist');
    }
    // Password Matching
    const isMatch = await bcrypt.compare(userPassword, result.userPassword);
    if (!isMatch) {
      throw new Error('Password Not match');
    }
    return createToken(result.userEmail, result.userName, result.userType);
  } catch (err) {
    throw err;
  }
};

module.exports.authenticate = passport.authenticate('jwt', { session: false });
