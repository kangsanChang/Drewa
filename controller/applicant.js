/* eslint-disable camelcase */
// 지원자 생성 페이지에서 넘어오면 실행되는 logic
// USER_INFO_TB에 저장한다
// USER_INFO_TB의 user_name 빼고 다 채움
const models = require('../models');
const auth = require('./authController');
const bcrypt = require('bcrypt');

module.exports.postLogin = async (req, res, next) => {
  try {
    if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
      throw Error('Property exception');
    }
    const token = await auth.comparePassword(req.body.userEmail, req.body.userPassword);
    res.json({
      token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports.postSignUp = async (req, res, next) => {
  try {
    // email, password 빈칸인지 검사
    if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
      throw Error('Property exception');
    }
    // req.body 에서 가져옴 각각 user... 라는 변수명으로 저장함
    const { userEmail, userPassword, userPosition } = req.body;

    // 이미 있는 email 인지 validation 해야 함
    const check = await models.userInfoTb.find({ where: { userEmail } });
    // Transaction 준비
    const t = await models.sequelize.transaction();

    // 이미 존재하는 email 일 경우
    if (check !== null) {
      await t.rollback();
      throw Error('User Already Exists');
    }
    const newData = {
      userPassword: await bcrypt.hash(userPassword, 10),
      userType: 'applicant',
      userSeason: 3,
      userEmail,
      userPosition,
    };
    const result = await models.userInfoTb.create(newData, { transaction: t });
    await t.commit();
    res.json(result);
  } catch (err) {
    console.log(err);
    next(err);
  }
};

module.exports.tokenVerify = async (req, res, next) => {
  try {
    const result = await models.userInfoTb.findOne({ where: { userEmail: req.user.userEmail } });
    // res.json(result);
    res.r(result);
  } catch (err) {
    next(err);
  }
};
