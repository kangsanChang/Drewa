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
    const data = req.body;
    data.userPassword = await bcrypt.hash(data.userPassword, 10);
    const result = await models.userInfoTb.findOrCreate({
      where: data,
    });
    if (result[1] === false) {
      throw Error('User Already Exists');
    }
    res.json(result[0]);
  } catch (err) {
    next(err);
  }
};

module.exports.tokenVerify = async (req, res, next) => {
  try {
    const result = await models.userInfoTb.findOne({ where: { userEmail: req.user.userEmail } });
    res.json(result);
  } catch (err) {
    next(err);
  }
};