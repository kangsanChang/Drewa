const passport = require('passport');
const passportJWT = require('passport-jwt');
const models = require('../models');
const config = require('../config/config.json');
const { ExtractJwt, Strategy } = passportJWT;

const params = {
  secretOrKey: config.auth.SECRET_KEY,
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};
module.exports = function () {
  const strategy = new Strategy(params, (payload, done) => {
    // TODO write authentications to find users from a database
    const result = models.userInfoTb.findOne({ where: { userEmail: payload.userEmail } });
    if (result) {
      return done(null, payload);
    } else {
      return done(new Error('No user matched with jwt payload'));
    }
  });
  passport.use(strategy);
  return {
    initialize() {
      return passport.initialize();
    },
    authenticate() {
      return passport.authenticate('jwt', { session: false });
    },
  };
};
