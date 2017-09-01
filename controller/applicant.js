const models = require('../models');
const auth = require('./authController');
const bcrypt = require('bcrypt');

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
    const { userEmail, userPassword } = req.body;

    // Email Validation
    const check = await models.userInfoTb.find({ where: { userEmail } });
    if (check !== null) {
      const err = new Error('User Already Exists');
      err.status = 400;
      throw err;
    }

    let season = await models.recruitmentInfo.find()
                             .sort('-createdAt')
                             .limit(1)
                             .select('season')
                             .exec();
    season = season[0].season;
    let newData = {
      userPassword: await bcrypt.hash(userPassword, 10),
      userType: 'applicant',
      userSeason: season,
      userEmail,
    };
    const result = await models.userInfoTb.create(newData, { transaction: t });
    const applicantRet = await models.applicantInfoTb.create(
      { userIdx: result.userIdx }, { transaction: t });
    const applicantIdx = applicantRet.applicantIdx;
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
