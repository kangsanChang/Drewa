const models = require('../models');

module.exports.postApplication = async (req, res, next) => {
  // transaction 은 exception 시 rollback 해야 하므로 try 위에 적어준다
  const t = await models.sequelize.transaction();

  try {
    const userIdx = req.params.applicantId;

    // token에 있는 userIdx 값과 url param으로 온 userIdx 가 맞아야 함
    // if (req.user.userIdx !== req.param.applicantId) {
    //   throw Error('권한이 없습니다.');
    // }

    // (임시) 유효한 row 검사
    const check = await models.userInfoTb.findOne({ where: { userIdx } });
    if (!check) {
      throw new Error('param is not include in user table!');
    }

    const data = req.body;
    const userName = data.userName;
    const userPosition = data.userPosition;
    data.interviewAvailableTime.forEach((elem, i, arr) => { arr[i] = new Date(elem); });

    const applicantData = {
      userIdx,
      applicantGender: data.applicantGender,
      applicantBirthday: new Date(data.applicantBirthday),
      applicantLocation: data.applicantLocation,
      applicantOrganization: data.applicantOrganization,
      applicantMajor: data.applicantMajor,
      applicantGrade: data.applicantGrade,
      applicantPhone: data.applicantPhone,
      applicantPictureUrl: data.applicantPictureUrl,
    };

    const appDocData = {
      userIdx,
      entryRoute: data.entryRoute,
      portfolioFileUrl: data.portfolioFileUrl,
      personalUrl: data.personalUrl,
      answers: data.answers,
      interviewAvailableTime: data.interviewAvailableTime,
    };

    // DB에 넣어주기
    const userInfoResult = await models.userInfoTb.update({ userName, userPosition },
      { where: { userIdx }, transaction: t });
    const applicantInfoResult = await models.applicantInfoTb.upsert(applicantData,
      { transaction: t });
    const appDocResult = await models.applicationDoc.findOneAndUpdate(
      { userIdx }, appDocData, { upsert: true, runValidators: true });
    await t.commit();
    // 결과값 응답
    const results = [userInfoResult, applicantInfoResult, appDocResult];
    res.r(results);
  } catch (err) {
    next(err);
    t.rollback();
  }
};

module.exports.getApplications = async (req, res, next) => {
  try {
    const result = await models.applicationDoc.find().exec();
    res.r(result);
  } catch (err) {
    next(err);
  }
};

// 내 정보 조회 (면접자 전용)
module.exports.getMyApplication = async (req, res, next) => {
  // 본인 토큰의 userIdx 와 맞는지 비교해야 함
  try {
    const userIdx = Number(req.params.applicantId);
    // 본인조회 아닌경우 에러
    if (req.user.userIdx !== userIdx) {
      throw new Error('Unauthorized');
    }
    const result = await models.applicationDoc.findOne({ userIdx })
                               .exec();
    const ret = await models.applicantInfoTb.findOne({ where: { userIdx } });
    // ret.dataValues 에 있는 모든 인자를 돌며, 밑의 구문 실행함
    Object.keys(ret.dataValues).map((d) => result._doc[d] = ret.dataValues[d]);
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.removeApplication = async (req, res, next) => {
  // 본인 토큰의 userIdx 와 맞는지 비교해야 함
  try {
    const userIdx = req.params.applicantId;
    const result = [];
    result.push(await models.applicantInfoTb.destroy({ where: { userIdx } }));
    result.push(await models.userInfoTb.destroy({ where: { userIdx } }));
    result.push(await models.applicationDoc.remove({ userIdx }));
    res.r(result);
  } catch (err) {
    next(err);
  }
};
