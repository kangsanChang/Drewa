const models = require('../models');

module.exports.getApplications = async (req, res, next) => {
  try {
    const result = await models.applicationDoc.find().exec();
    res.r(result);
  } catch (err) {
    next(err);
  }
};

const updateApplication = async (req) => {
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
    const applicantInfoResult = await models.applicantInfoTb.update(applicantData,
      { where: { userIdx }, transaction: t });
    const appDocResult = await models.applicationDoc.findOneAndUpdate(
      { userIdx }, appDocData, { runValidators: true });
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
    const results = await updateApplication(req);
    res.r(results);
  } catch (err) {
    next(err);
  }
};

module.exports.postApplication = postApplication;

module.exports.submitApplication = async (req, res, next) => {
  try {
    const updateApplicationResult = updateApplication(req);
    const data = await models.applicantInfoTb.findOne(
      { where: { userIdx: req.user.userIdx } });
    const applicationTbResult = await models.applicationTb.update({ isSubmit: true },
      { where: { applicantIdx: data.dataValues.applicantIdx } });
    const results = [updateApplicationResult, applicationTbResult];
    res.r(results);
  } catch (err) {
    next(err);
  }
};

// 내 정보 조회 (면접자 전용)
// Form에 줄 정보만 선별적으로 만들어야 해서 Join 연산보다 쿼리 두번 실행하는 것이 낫다고 판단
module.exports.getMyApplication = async (req, res, next) => {
  try {
    const userIdx = Number(req.params.applicantId);
    const applicationDocRet = await models.applicationDoc.findOne({ userIdx }).exec();
    const userInfo = await models.userInfoTb.findOne({ where: { userIdx } });
    const userInfoRet = userInfo.dataValues;
    const applicantInfo = await models.applicantInfoTb.findOne({ where: { userIdx } });
    const applicantInfoRet = applicantInfo.dataValues;

    const result = {
      // From UserInfo
      userName: userInfoRet.userName,
      userPosition: userInfoRet.userPosition,
      // From ApplicantInfo (field 이름 'userXyz' 로 변경)
      userGender: applicantInfoRet.applicantGender,
      userBirthday: applicantInfoRet.applicantBirthday,
      userLocation: applicantInfoRet.applicantLocation,
      userPhone: applicantInfoRet.applicantPhone,
      userOrganization: applicantInfoRet.applicantOrganization,
      userMajor: applicantInfoRet.applicantMajor,
      userPictureFilename: applicantInfoRet.applicantPictureFilename,
      // From ApplicantDoc (field 이름 'userXyz' 로 변경)
      userEntryRoute: applicationDocRet.entryRoute,
      userPortfolioFilename: applicationDocRet.portfolioFilename,
      userPersonalUrl: applicationDocRet.personalUrl,
      userAnswers: applicationDocRet.answers,
      userInterviewAvailableTime: applicationDocRet.interviewAvailableTime,
    };

    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.removeApplication = async (req, res, next) => {
  try {
    const userIdx = req.params.applicantId;
    const result = [];
    const data = await models.applicantInfoTb.findOne({ where: { userIdx } });
    result.push(await models.applicantInfoTb.destroy({ where: { userIdx } }));
    result.push(await models.userInfoTb.destroy({ where: { userIdx } }));
    result.push(await models.applicationDoc.remove({ userIdx }));
    result.push(await models.applicationTb.destroy(
      { where: { applicantIdx: data.dataValues.applicantIdx } }));
    res.r(result);
  } catch (err) {
    next(err);
  }
};
