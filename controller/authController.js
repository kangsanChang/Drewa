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

const createToken = async (userIdx, userEmail, userType) => {
  const payloads = {
    userIdx,
    userEmail,
    userType,
  };
  const token = await jwt.sign(payloads, config.auth.SECRET_KEY,
    { expiresIn: config.auth.EXPIRES });
  return token;
};

module.exports.createToken = createToken;

// Todo : 토큰과 applicantIdx(DB의 userIdx)를 합쳐서 만든 data를 리턴. 이름을 applicantIdx로 통일하면 좋겠다
const comparePassword = async (userEmail, userPassword) => {
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
    const token = await createToken(result.userIdx, result.userEmail, result.userType);
    const data = {
      token,
      applicantIdx: result.userIdx,
    };
    return data;
  } catch (err) {
    throw err;
  }
};

module.exports.onlyApplicant = async (req, res, next) => {
  try {
    let err = null;
    // userType 이 'applicant' 인 요청만 유효함
    // 본인의 applications 에 대해서만 유효함
    if (req.user.userType !== 'applicant' ||
      req.user.userIdx !== Number(req.params.applicantId)) {
      err = new Error('Permission denied');
      err.status = 403;
      throw err;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports.onlyInterviewer = async (req, res, next) => {
  try {
    let err = null;
    // userType 이 'interviewer' 인 요청만 유효함
    // 본인의 applications 에 대해서만 유효함
    if (req.user.userType !== 'interviewer') {
      err = new Error('Permission denied');
      err.status = 403;
      throw err;
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports.postLogin = async (req, res, next) => {
  try {
    if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
      throw Error('Property exception');
    }
    const data = await comparePassword(req.body.userEmail, req.body.userPassword);
    res.r(data);
  } catch (err) {
    next(err);
  }
};

const verifyDeadline = async () => {
  try {
    const result = await models.recruitmentInfo.find()
                               .sort('-createdAt')
                               .limit(1)
                               .exec();
    const now = new Date().toLocaleString();
    const time = new Date(result[0].deadline).toLocaleString();
    return now > time;
  } catch (err) {
    throw err;
  }
};

module.exports.verifyDeadline = verifyDeadline;

module.exports.checkTime = async (req, res, next) => {
  try {
    if (await verifyDeadline()) {
      const err = new Error('모집 기간이 지났습니다!');
      err.status = 400;
      throw err;
    }
    next();
  } catch (err) {
    next(err);
  }
};


module.exports.checkSubmit = async (req, res, next) => {
  try {
    const result = await models.applicantInfoTb.findOne({
      include: [
        {
          model: models.applicationTb,
          // attributes: ['applicantIdx', 'isSubmit'],
        }],
      where: {
        userIdx: req.user.userIdx,
      },
    });
    if (result.applicationTb.isSubmit) {
      const err = new Error('이미 제출하셨습니다!');
      err.status = 400;
      throw err;
    }
    req.applicantIdx = result.applicationTb.applicantIdx;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports.authenticate = passport.authenticate('jwt', { session: false });