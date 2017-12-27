const models = require('../models');

module.exports.getAllRecruitmentSeason = async (req, res, next) => {
  try {
    const seasons = await models.recruitmentInfo.find().select('season isFinished');
    res.r(seasons);
  } catch (err) {
    next(err);
  }
};

module.exports.postRecruitInfo = async (req, res, next) => {
  try {
    // 새로운 면접 정보 입력함
    const {
      season, questions, applicationPeriod, interviewSchedule,
    } = req.body;
    const appDocResult = await models.recruitmentInfo.findOne({ season }).exec();
    if (appDocResult) {
      const err = new Error('Duplicated Season');
      err.status = 400;
      throw err;
    }
    const newData = {
      season: Number(season),
      questions,
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
    // admin 이 이전 지원정보 보는 경우랑 지원자들이 보는 경우 둘다 사용
    // admin 은 param 으로 season 을 줘서 찾게함
    // 지원자들은 params 의 season 이 'now' - isFinished 가 false(현재 모집중인 시즌)인 정보를 가져오도록 함.
    const { params } = req;
    if (params.season === 'now') {
      const {
        questions, season, applicationPeriod, interviewSchedule,
      } = await models.recruitmentInfo.findOne().where({ isFinished: false }).exec();

      res.r({
        season, applicationPeriod, interviewSchedule, questions,
      });
    } else {
      const ret = await models.recruitmentInfo.findOne().where({ season: params.season }).exec();
      // mongoose query 로 받아온 object 에 바로 delete 불가능
      const info = ret.toObject();
      delete info._id;
      delete info.createdAt;
      delete info.updatedAt;
      res.r(info);
    }
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
