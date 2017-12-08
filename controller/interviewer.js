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

module.exports.interviewerSignUp = async (req, res, next) => {
  const t = await models.sequelize.transaction();
  try {
    if (!req.body.userEmail || !req.body.userPassword) {
      const err = new Error('There is an empty field');
      err.status = 400;
      throw err;
    }
    const { userEmail, userPassword, recaptchaToken } = req.body;

    // Verification reCAPTCHA
    const verified = await verifyRecaptcha(recaptchaToken);
    const v = JSON.parse(verified);
    if (!v.success) {
      const err = new Error('reCAPTCHA Failed');
      err.status = 400;
      throw err;
    }

    // invitationCode Validation
    const { season, invitationCode } = await models.recruitmentInfo.findOne()
      .sort('-createdAt')
      .select('season')
      .exec();

    if (invitationCode !== req.body.invitationCode) {
      const err = new Error('invitation code is not matching');
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

    const data = {
      userPassword: await bcrypt.hash(userPassword, 10),
      userType: 'interviewer',
      userSeason: season,
      userEmail,
    };
    const { userIdx } = await models.userInfoTb.create(data, { transaction: t });
    const { interviewerIdx } = await models.interviewerTb.create({ userIdx }, { transaction: t });
    await t.commit();
    const token = await auth.createToken(interviewerIdx, userEmail, 'interviewer');
    const resData = {
      token,
      interviewerIdx,
    };
    console.log('create interviewer in server successfully \n', token, interviewerIdx);
    res.r(resData);
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      err.status = 400;
    }
    await t.rollback();
    next(err);
  }
};