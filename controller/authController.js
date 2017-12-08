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
    const { userEmail, userPassword } = req.body;
    if (!userEmail || !userPassword) {
      const err = new Error('There is an empty field');
      err.status = 400;
      throw err;
    }
    const userInfoData = await models.userInfoTb.findOne({ where: { userEmail } });
    if (!userInfoData) { return res.status(400).end('userEmail not exist'); }

    const isPasswordMatch = await bcrypt.compare(userPassword, userInfoData.userPassword);
    if (!isPasswordMatch) { return res.status(400).end('password not matching'); }

    const { userIdx, userType } = userInfoData;
    if (userType === 'applicant') {
      const { applicantIdx } = await models.applicantInfoTb.findOne({ where: { userIdx } });
      const token = await createToken(applicantIdx, userEmail, userType);
      res.r({ token, applicantIdx });
    } else if (userType === 'interviewer') {
      const { interviewerIdx } = await models.interviewerTb.findOne({ where: { userIdx } });
      const token = await createToken(interviewerIdx, userEmail, userType);
      res.r({ token, interviewerIdx });
    }
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
