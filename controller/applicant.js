const models = require('../models');
const auth = require('./authController');
const bcrypt = require('bcrypt');
const config = require('./../config/config.json');
const request = require('request');

const verifyRecaptcha = (recaptchaToken) => {
  const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${config.grecaptcha}&response=${recaptchaToken}`;
  return new Promise((resolve) => {
    request(verificationUrl, (err, res, body) => {
      if (err) {
        const error = new Error('Failed to verify reCAPTCHA');
        error.status = 400;
        throw (error);
      }
      resolve(body);
    });
  });
};

module.exports.applicantSignUp = async (req, res, next) => {
  // Transaction 준비
  const t = await models.sequelize.transaction();
  try {
    // email, password 빈칸 검사
    if (!req.body.userEmail || !req.body.userPassword) {
      const err = new Error('There is an empty field');
      err.status = 400;
      throw err;
    }
    const { userEmail, userPassword, recaptchaToken } = req.body;

    // Verification reCAPTCHA
    const verified = await verifyRecaptcha(recaptchaToken);
    // string -> object
    const v = JSON.parse(verified);

    if (!v.success) {
      // reCAPTCHA token 인증이 false 인 경우
      // reload 되지 않은 reCAPTCHA widget 을 이용하거나, 올바르지 않은 key 로 접근하는 경우
      const err = new Error('reCAPTCHA Failed');
      err.status = 400;
      throw err;
    }

    // Email Validation
    const check = await models.userInfoTb.find({ where: { userEmail } });
    if (check !== null) {
      const err = new Error('User Already Exists');
      err.status = 400;
      throw err;
    }

    const sInfo = await models.recruitmentInfo.findOne()
      .sort('-createdAt')
      .select('season')
      .exec();
    const { season: userSeason } = sInfo;
    let newData = {
      userPassword: await bcrypt.hash(userPassword, 10),
      userType: 'applicant',
      userSeason,
      userEmail,
    };
    const result = await models.userInfoTb.create(newData, { transaction: t });
    const applicantRet = await models.applicantInfoTb.create(
      { userIdx: result.userIdx }, { transaction: t },
    );
    const { applicantIdx } = applicantRet;
    const applicationRet = await models.applicationDoc.create({ applicantIdx });
    newData = {
      applicantIdx: applicantRet.applicantIdx,
      applicationDocument: applicationRet._id.toString(),
    };
    await models.applicationTb.create(newData, { transaction: t });
    await t.commit();
    const token = await auth.createToken(applicantRet.applicantIdx, userEmail, 'applicant');
    const resData = {
      token,
      applicantIdx: applicantRet.applicantIdx,
    };
    res.r(resData);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      err.status = 400;
    }
    await t.rollback();
    next(err);
  }
};

module.exports.getAllApplicant = async (req, res, next) => {
  try {
    const allApplicants = await models.userInfoTb.findAll({ where: { userType: 'applicant' } });
    res.r(allApplicants);
  } catch (err) {
    next(err);
  }
};
