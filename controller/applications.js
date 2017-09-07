const models = require('../models');
const email = require('./Email');
const removeFile = require('./fileUpload').removeFile;

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
    const applicantIdx = req.user.applicantIdx;
    const applicantInfo = await models.applicantInfoTb.findOne(
      { where: { applicantIdx }, transaction: t });
    const userIdx = applicantInfo.userIdx;
    const data = req.body;
    const { userName, userPosition } = data;
    data.interviewAvailableTime.forEach((elem, i, arr) => { arr[i] = new Date(elem); });

    const applicantData = {
      applicantGender: data.applicantGender,
      applicantBirthday: new Date(data.applicantBirthday),
      applicantLocation: data.applicantLocation,
      applicantOrganization: data.applicantOrganization,
      applicantMajor: data.applicantMajor,
      applicantGrade: data.applicantGrade,
      applicantPhone: data.applicantPhone,
    };

    const appDocData = {
      applicantIdx,
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
      { where: { applicantIdx }, transaction: t });
    const appDocResult = await models.applicationDoc.findOneAndUpdate(
      { applicantIdx }, appDocData, { runValidators: true });
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
    await updateApplication(req);
    await models.applicationTb.update({ isSubmit: true },
      { where: { applicantIdx: req.applicantIdx } });
    // production 에서는 이메일을 보낸다
    if (global.env === 'production') {
      await email.sendHello(req.user.userEmail);
    }
    const results = req.user.userEmail;
    res.r(results);
  } catch (err) {
    next(err);
  }
};

// 내 정보 조회 (면접자 전용)
module.exports.getMyApplication = async (req, res, next) => {
  try {
    const applicantIdx = Number(req.params.applicantIdx);
    const applicationDocRet = await models.applicationDoc.findOne({ applicantIdx }).exec();
    const applicantInfo = await models.applicantInfoTb.findOne({ where: { applicantIdx } });
    const applicantInfoRet = applicantInfo.dataValues;
    const userIdx = applicantInfoRet.userIdx;
    const userInfo = await models.userInfoTb.findOne({ where: { userIdx } });
    const userInfoRet = userInfo.dataValues;
    const result = {
      // From UserInfo
      userName: userInfoRet.userName,
      userPosition: userInfoRet.userPosition,
      // From ApplicantInfo
      applicantGender: applicantInfoRet.applicantGender,
      applicantBirthday: applicantInfoRet.applicantBirthday,
      applicantLocation: applicantInfoRet.applicantLocation,
      applicantPhone: applicantInfoRet.applicantPhone,
      applicantOrganization: applicantInfoRet.applicantOrganization,
      applicantMajor: applicantInfoRet.applicantMajor,
      applicantPictureFilename: applicantInfoRet.applicantPictureFilename,
      // From ApplicantDoc
      entryRoute: applicationDocRet.entryRoute,
      portfolioFilename: applicationDocRet.portfolioFilename,
      personalUrl: applicationDocRet.personalUrl,
      answers: applicationDocRet.answers,
      interviewAvailableTime: applicationDocRet.interviewAvailableTime,
      // TODO : picture, portfolio 있으면, url 가져와야지 사진 보여줄 수 있을 듯.
      // TODO : applicantGrade 쓸지 여부 정하기.
    };

    res.r(result);
  } catch (err) {
    next(err);
  }
};

const remover = async (applicantIdx, userEmail) => {
  // TODO: 지원 포기면 user Info 도 파괴 / 지원서 자체만 포기면 userInfo 는 살리기
  const result = [];
  const data = await models.applicantInfoTb.findOne({ where: { applicantIdx } });
  result.push(await removeFile(applicantIdx, userEmail, 'images'));
  result.push(await removeFile(applicantIdx, userEmail, 'portfolios'));
  result.push(await models.applicantInfoTb.destroy({ where: { applicantIdx } }));
  result.push(await models.userInfoTb.destroy({ where: { userIdx: data.dataValues.userIdx } }));
  result.push(await models.applicationDoc.remove({ applicantIdx }));
  result.push(await models.applicationTb.destroy({ where: { applicantIdx } }));
  return result;
};
module.exports.remover = remover;

module.exports.removeApplication = async (req, res, next) => {
  try {
    const applicantIdx = req.params.applicantIdx;
    const userEmail = req.user.userEmail;
    const result = remover(applicantIdx, userEmail);
    res.r(result);
  } catch (err) {
    next(err);
  }
};
