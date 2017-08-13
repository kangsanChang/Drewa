const models = require('../models');

module.exports.postRecruitInfo = async (req, res, next) => {
  try {
    const { season, commQuestions, developerQuestions, designerQuestions, deadline, interviewTime } = req.body;
    const appDocResult = await models.recruitmentInfo.findOne({ season }).exec();
    if (appDocResult) {
      const err = new Error('Duplicated Season');
      err.status = 400;
      throw err;
    }
    const newData = {
      season: Number(season),
      commQuestions,
      developerQuestions,
      designerQuestions,
      deadline,
      interviewTime,
    };
    const result = await models.recruitmentInfo.create(newData);
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.getRecruitInfo = async (req, res, next) => {
  try {

    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.putRecruitInfo = async (req, res, next) => {
  try {

    res.r(result);
  } catch (err) {
    next(err);
  }
};