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
    res.r(token);
  } catch (err) {
    next(err);
  }
};

module.exports.postSignUp = async (req, res, next) => {
  const season = 3;
  // email, password 빈칸인지 검사
  const t = await models.sequelize.transaction();
  try {
    // Transaction 준비
    if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
      throw Error('Property exception');
    }

    // req.body 에서 가져옴 각각 user... 라는 변수명으로 저장함
    const { userEmail, userPassword } = req.body;
    // 이미 있는 email 인지 validation 해야 함
    const check = await models.userInfoTb.find({ where: { userEmail } }); // userEmail : userEmail

    // 이미 존재하는 email 일 경우
    if (check !== null) {
      throw Error('User Already Exists');
    }
    // Todo : season 을 디비에서 뽑아 적용하기
    const newData = {
      userPassword: await bcrypt.hash(userPassword, 10),
      userType: 'applicant',
      userSeason: season,
      userEmail,
    };
    const result = await models.userInfoTb.create(newData, { transaction: t });
    await t.commit();
    res.r(result);
  } catch (err) {
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
