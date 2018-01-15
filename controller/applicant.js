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
  const t = await models.sequelize.transaction();
  try {
    const { userEmail, userPassword, recaptchaToken } = req.body;
    if (!userEmail || !userPassword) {
      const err = new Error('There is an empty field');
      err.status = 400;
      throw err;
    }

    // Verification reCAPTCHA
    const verified = await verifyRecaptcha(recaptchaToken);
    const v = JSON.parse(verified);

    if (!v.success) {
      const err = new Error('reCAPTCHA Failed');
      err.status = 400;
      throw err;
    }

    // Email Validation
    const check = await models.userInfoTb.findOne({ where: { userEmail } });
    if (check !== null) {
      const err = new Error('User Already Exists');
      err.status = 400;
      throw err;
    }

    const { season: userSeason } = await models.recruitmentInfo.findOne()
      .where({ isFinished: false }).exec();
    const newData = {
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
    await models.applicationDoc.create({ applicantIdx });
    await models.applicantEvaluation.create({ applicantIdx });
    await models.applicantStatusTb.create({ applicantIdx }, { transaction: t });
    await t.commit();
    const token = await auth.createToken(applicantIdx, userEmail, 'applicant');
    const resData = {
      token,
      applicantIdx,
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

module.exports.getApplicantStatus = async (req, res, next) => {
  try {
    const applicantIdx = Number(req.params.applicantIdx);
    const {
      season, applicationPeriod, interviewSchedule, interviewPlace,
    } = await models.recruitmentInfo.findOne()
      .sort('-createdAt')
      .exec();
    const applicantStatusData = await models.applicantStatusTb
      .findOne({ where: { applicantIdx } });
    const {
      isSubmit, isApplicationPass, isFinalPass, confirmedInterviewTime,
    } = applicantStatusData.dataValues;
    const result = {
      season,
      applicationPeriod,
      interviewSchedule,
      interviewPlace,
      isSubmit,
      isApplicationPass,
      isFinalPass,
      confirmedInterviewTime,
    };
    res.r(result);
  } catch (err) {
    next(err);
  }
};