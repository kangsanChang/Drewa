const models = require('../models');
const auth = require('./authController');
const bcrypt = require('bcrypt');

module.exports.postLogin = async (req, res, next) => {
  try {
    if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
      throw Error('Property exception');
    }
    const token = await auth.comparePassword(req.body.userEmail, req.body.userPassword);
    res.json({ token, });
  } catch (err) {
    next(err);
  }
};

module.exports.postSignUp = async (req, res, next) => {
  try {
    if (req.body.userEmail === undefined || req.body.userPassword === undefined) {
      throw Error('Property exception');
    }
    const { userEmail, userName, userType, userPassword } = req.body;
    let where = {
      userEmail,
    };
    // const data = req.body;
    // const result = await models.userInfoTb.find({ where: { userEmail: data.userEmail } });

    const t = await models.sequelize.transaction();
    let result = await models.userInfoTb.find({
      where,
    });

    console.log(result);
    if (result !== null) {
      await t.rollback()
      throw Error('User Already Exists');
    }
    const newdata = {
      userPassword: await bcrypt.hash(userPassword, 10),
      userName,
      userType,
    };
    // console.log(where);
    result = await models.userInfoTb.update({ newdata }, { where }, { transaction: t });
    await t.commit();
    res.json(result);
  } catch (err) {
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
