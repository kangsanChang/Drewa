const config = require('../config/config.json');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const models = require('../models');

const createToken = async (index, userEmail, userType) => {
  const payloads = { userEmail, userType };
  if (userType === 'applicant') {
    payloads.applicantIdx = index;
  } else if (userType === 'interviewer') {
    payloads.interviewerIdx = index;
  }
  const token = await jwt.sign(payloads, config.auth.SECRET_KEY,
    { expiresIn: config.auth.EXPIRES });
  return token;
};

module.exports.createToken = createToken;

// TODO : boolean으로 주는건 어떄
const comparePassword = async (userEmail, userPassword) => {
  // 비밀번호 비교 후 token 발급
  try {
    const result = await models.userInfoTb.findOne({ where: { userEmail } });
    if (!result) {
      const err = new Error('Email not exist');
      err.status = 400;
      throw err;
    }
    // Password Matching
    const isMatch = await bcrypt.compare(userPassword, result.userPassword);
    if (!isMatch) {
      const err = new Error('Password not match');
      err.status = 400;
      throw err;
    }
    const { userIdx } = result;
    // response 를 index 와 함꼐 줌
    if (result.userType === 'applicant') {
      const { applicantIdx } = await models.applicantInfoTb.findOne({ where: { userIdx } });
      const token = await createToken(applicantIdx, result.userEmail, result.userType);
      return { token, applicantIdx };
    } else if (result.userType === 'interviewer') {
      const { interviewerIdx } = await models.interviewersTb.findOne({ where: { userIdx } });
      const token = await createToken(interviewerIdx, result.userEmail, result.userType);
      return { token, interviewerIdx };
    }
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
      req.user.applicantIdx !== Number(req.params.applicantIdx)) {
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
    // userType 이 'interviewer' 인 요청만 유효함
    // 본인의 applications 에 대해서만 유효함
    if (req.user.userType !== 'interviewer') {
      const err = new Error('Permission denied');
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
    if (!req.body.userEmail || !req.body.userPassword) {
      const err = new Error('There is an empty field');
      err.status = 400;
      throw err;
    }
    const data = await comparePassword(req.body.userEmail, req.body.userPassword);
    res.r(data);
  } catch (err) {
    next(err);
  }
};

const verifyDeadline = async () => {
  try {
    const result = await models.recruitmentInfo.findOne()
      .sort('-createdAt')
      .exec();
    const now = new Date().toLocaleString();
    const time = new Date(result.deadline).toLocaleString();
    return now > time; // 시간이 남았으면 true 만료되었으면 false
  } catch (err) {
    throw err;
  }
};

module.exports.verifyDeadline = verifyDeadline;

module.exports.checkTime = async (req, res, next) => {
  try {
    if (await !verifyDeadline()) {
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
    const { isSubmit } = await models.applicantStatusTb.findOne({
      where: { applicantIdx: req.user.applicantIdx },
    });
    if (isSubmit) {
      const err = new Error('이미 제출하셨습니다!');
      err.status = 400;
      throw err;
    }
    next();
  } catch (err) {
    next(err);
  }
};
