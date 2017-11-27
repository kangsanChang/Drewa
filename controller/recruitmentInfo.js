const models = require('../models');

module.exports.postRecruitInfo = async (req, res, next) => {
  try {
    // 새로운 면접 정보 입력함
    const {
      season, commQuestions, developerQuestions, designerQuestions, deadline, interviewTimes,
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
      deadline,
      interviewTimes,
    };
    const result = await models.recruitmentInfo.create(newData);
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.getRecruitInfo = async (req, res, next) => {
  try {
    // 시간순으로 가장 최근에 추가된것만 가져옴
    const result = await models.recruitmentInfo.findOne()
      .sort('-createdAt')
      .exec();
    if (result === null) {
      const err = new Error('recruitmentInfo not exits');
      err.status = 400;
      throw err;
    }
    const questions = result.commQuestions.concat(result[`${req.user.userPosition}Questions`]);
    const resModel = {
      season: result.season,
      deadline: result.deadline,
      questions,
      interviewTimes: result.interviewTimes,
    };
    res.r(resModel);
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
