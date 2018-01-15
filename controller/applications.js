const models = require('../models');
const email = require('./Email');
const {
  removeFile, getFileName, getKeyPath, getFileUrl,
} = require('./fileUpload');

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
    const { applicantIdx } = req.user;
    const applicantInfo = await models.applicantInfoTb.findOne(
      { where: { applicantIdx }, transaction: t },
    );
    const { userIdx } = applicantInfo;
    const data = req.body;
    const { userName, userPosition } = data;

    const applicantData = {
      applicantGender: data.applicantGender,
      applicantBirthday: data.applicantBirthday,
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
      devAnswers: data.devAnswers,
      desAnswers: data.desAnswers,
      interviewAvailableTime: data.interviewAvailableTime,
    };
    // DB에 넣어주기
    await models.userInfoTb.update({ userName, userPosition },
      { where: { userIdx }, transaction: t });
    await models.applicantInfoTb.update(applicantData,
      { where: { applicantIdx }, transaction: t });
    await models.applicationDoc.findOneAndUpdate({ applicantIdx }, appDocData);
    await t.commit();
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
    await models.applicantStatusTb.update({ isSubmit: true },
      { where: { applicantIdx: req.user.applicantIdx } });
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
module.exports.getApplicationData = async (req, res, next) => {
  try {
    const applicantIdx = Number(req.params.applicantIdx);
    const applicationDocRet = await models.applicationDoc.findOne({ applicantIdx })
      .select('-interviewAvailableTime._id').exec();
    const applicantInfo = await models.applicantInfoTb.findOne({ where: { applicantIdx } });
    const applicantInfoRet = applicantInfo.dataValues;
    const { userIdx } = applicantInfoRet;
    const userInfo = await models.userInfoTb.findOne({ where: { userIdx } });
    const userInfoRet = userInfo.dataValues;
    const applicantStatusData = await models.applicantStatusTb
      .findOne({ where: { applicantIdx } });
    const { isSubmit } = applicantStatusData.dataValues;

    const result = {
      // From UserInfo
      name: userInfoRet.userName,
      position: userInfoRet.userPosition,
      // From ApplicantInfo
      gender: applicantInfoRet.applicantGender,
      birth: applicantInfoRet.applicantBirthday,
      residence: applicantInfoRet.applicantLocation,
      phone: applicantInfoRet.applicantPhone,
      company: applicantInfoRet.applicantOrganization,
      major: applicantInfoRet.applicantMajor,
      // From ApplicantDoc
      knownFrom: applicationDocRet.entryRoute,
      portfolioFilename: applicationDocRet.portfolioFilename,
      personalUrl: applicationDocRet.personalUrl,
      answers: applicationDocRet.answers,
      devAnswers: applicationDocRet.devAnswers,
      desAnswers: applicationDocRet.desAnswers,
      interviewAvailableTimes: applicationDocRet.interviewAvailableTime,
      // From FileUrl
      applicantImageUrl: null,
      applicantPortfolioUrl: null,
      // isSubmit?
      isSubmit,
    };

    // Get File URL
    const imageFileName = await getFileName('user_image', applicantIdx);
    const portfolioFileName = await getFileName('user_portfolio', applicantIdx);
    if (imageFileName) {
      const imageKeyPath = getKeyPath(userInfoRet.userEmail, 'user_image', imageFileName);
      const imageUrl = getFileUrl(imageKeyPath);
      result.applicantImageUrl = imageUrl;
    }
    if (portfolioFileName) {
      const portfolioKeyPath = getKeyPath(userInfoRet.userEmail, 'user_portfolio', portfolioFileName);
      const portfolioUrl = getFileUrl(portfolioKeyPath);
      result.applicantPortfolioUrl = portfolioUrl;
    }
    res.r(result);
  } catch (err) {
    next(err);
  }
};

// 지원자 + 지원서 모두 삭제
const remover = async (applicantIdx, userEmail) => {
  const t = await models.sequelize.transaction();
  // 파일 있는지 확인
  const imageFileName = await getFileName('user_image', applicantIdx);
  const portfolioFileName = await getFileName('user_portfolio', applicantIdx);
  if (imageFileName) {
    await removeFile(applicantIdx, userEmail, 'user_image');
  }
  if (portfolioFileName) {
    await removeFile(applicantIdx, userEmail, 'user_portfolio');
  }
  await models.applicantStatusTb.destroy({ where: { applicantIdx }, transaction: t });
  await models.userInfoTb.destroy({ where: { userEmail }, transaction: t });
  await models.applicantInfoTb.destroy({ where: { applicantIdx }, transaction: t });
  await models.applicationDoc.remove({ applicantIdx });
  await t.commit();
};
module.exports.remover = remover;

module.exports.removeApplication = async (req, res, next) => {
  try {
    const { applicantIdx } = req.params;
    const { userEmail } = req.user;
    remover(applicantIdx, userEmail);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
