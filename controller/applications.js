const models = require('../models');

const upsertApplication = async (req) => {
  const t = await models.sequelize.transaction();

  try {
    const userIdx = req.params.applicantId;

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
    return [userInfoResult, applicantInfoResult, appDocResult];
  } catch (err) {
    t.rollback();
    throw (err);
  }
};

const postApplication = async (req, res, next) => {
  try {
    const results = await upsertApplication(req);
    res.r(results);
  } catch (err) {
    next(err);
  }
};

module.exports.postApplication = postApplication;

module.exports.getApplications = async (req, res, next) => {
  try {
    const result = await models.applicationDoc.find().exec();
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.submitApplication = async (req, res, next) => {
  try {
    const updateApplicationResult = upsertApplication(req);
    const userIdx = req.user.userIdx;
    const updateSubmitResult = await models.applicantInfoTb.update({ isSubmit: true },
      { where: { userIdx } });
    const results = [updateApplicationResult, updateSubmitResult];
    res.r(results);
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
