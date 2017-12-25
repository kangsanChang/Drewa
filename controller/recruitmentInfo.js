const models = require('../models');

module.exports.postRecruitInfo = async (req, res, next) => {
  try {
    // 새로운 면접 정보 입력함
    const {
      season, commQuestions, developerQuestions, designerQuestions, applicationPeriod, interviewSchedule,
    } = req.body;
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
      applicationPeriod,
      interviewSchedule,
    };
    const result = await models.recruitmentInfo.create(newData);
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.getRecruitInfo = async (req, res, next) => {
  try {
    const {
      commQuestions, developerQuestions, designerQuestions, season, applicationPeriod,
      interviewSchedule,
    } = await models.recruitmentInfo.findOne().sort('-createdAt').exec();
    const questions = {};
    questions.commonQ = commQuestions;
    questions.devQ = developerQuestions;
    questions.desQ = designerQuestions;
    const result = {
      season, applicationPeriod, questions, interviewSchedule,
    };
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.putRecruitInfo = async (req, res, next) => {
  try {
    await models.recruitmentInfo.findOneAndUpdate({ season: req.params.season }, req.body).exec();
    res.r(null);
  } catch (err) {
    next(err);
  }
};
