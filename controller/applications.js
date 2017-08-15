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
    const updateSubmitResult = await models.applicantInfoTb.findOne(
      { where: { userIdx: req.user.userIdx } }).then((data) => {
        models.applicationTb.update({ isSubmit: true },
          { where: { applicantIdx: data.dataValues.applicantIdx } });
      },
    );
    const results = [updateApplicationResult, updateSubmitResult];
    res.r(results);
  } catch (err) {
    next(err);
  }
};
// 내 정보 조회 (면접자 전용)
module.exports.getMyApplication = async (req, res, next) => {
  try {
    const userIdx = Number(req.params.applicantId);
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
