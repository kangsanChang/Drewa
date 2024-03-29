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
    const { settingForm } = req.body;
    const onSeasonCheck = await models.recruitmentInfo.findOne()
      .where({ isFinished: false }).exec();
    if (onSeasonCheck) {
      // 현재 모집중인 시즌이 있는 경우
      // post 보낸 season 과 동일하면 update 하고 다르면 에러
      if (onSeasonCheck.season.toString() === settingForm.season.toString()) {
        // update
        await models.recruitmentInfo.findOneAndUpdate({ season: settingForm.season }, settingForm);
        res.sendStatus(200);
      } else {
        // error : 현재 모집중인 정보가 있지만 다른 시즌을 생성하려는 경우
        const err = new Error('on recruitment now');
        err.status = 400;
        throw err;
      }
    } else {
      // 이전에 생성했던 시즌인지 중복검사
      const checkDup = await models.recruitmentInfo.findOne().where({ season: settingForm.season });
      if (checkDup) {
        const err = new Error('Duplicated Error');
        err.status = 400;
        throw err;
      }
      // create new
      await models.recruitmentInfo.create(settingForm);
      res.sendStatus(200);
    }
  } catch (err) {
    next(err);
  }
};

module.exports.getMainInfo = async (req, res, next) => {
  // token 필요없이 main 에서만 주는 정보 필요해서 생성
  try {
    const results = await models.recruitmentInfo.findOne().where({ isFinished: false }).exec();
    if (results) {
      const { season, mainTitle, mainDescription, mainPosterUrl } = results;
      res.r({ season, mainTitle, mainDescription, mainPosterUrl });
    }else{
      res.sendStatus(204);
    }
  } catch (e) {
    next(e);
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
    } else if (params.season === 'prev') {
      const ret = await models.recruitmentInfo.findOne()
        .where({ isFinished: true })
        .sort('-createdAt')
        .exec();
      // mongoose query 로 받아온 object 에 바로 delete 불가능
      const info = ret.toObject();
      delete info._id;
      delete info.createdAt;
      delete info.updatedAt;
      info.season = '';
      info.isFinished = false;
      res.r(info);
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

module.exports.seasonEnd = async (req, res, next) => {
  try {
    const { params } = req;
    const { season } = params;
    // 해당 시즌 지원자정보 모두 삭제해야 함
    await models.applicantEvaluation.remove({});
    await models.applicationDoc.remove({});
    await models.applicantStatusTb.destroy({ where: {} });
    await models.applicantInfoTb.destroy({ where: {} });
    await models.userInfoTb.destroy({ where: {} });
    await models.recruitmentInfo.findOneAndUpdate({ season }, { isFinished: true });
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

module.exports.removeRecruitInfo = async (req, res, next) => {
  try {
    await models.recruitmentInfo.remove({ season: req.params.season }).exec();
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
};
