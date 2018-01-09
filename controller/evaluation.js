const models = require('../models');

// application 전체 및 평균 점수 가져오기
module.exports.getApplications = async (req, res, next) => {
  try {
    const { userIdx } = req.user;
    const applicants = await models.userInfoTb.findAll({
      where: { userType: 'applicant' },
      attributes: ['userName', 'userPosition'],
      include: [
        {
          model: models.applicantInfoTb,
          attributes: ['applicantIdx'],
          include: [
            {
              model: models.applicantStatusTb,
              attributes: ['isSubmit'],
              where: { isSubmit: true },
            }],
        }],
    });
    const objValues = applicants.map(x => x.get({ plain: true }));
    const filterBySubmit = (obj) => {
      // 제출 된 애들만 applicantInfoTb 가 생성되므로 filtering
      if (obj.applicantInfoTb) { return true; }
      return false;
    };
    const submitted = objValues.filter(filterBySubmit);
    const results = submitted.map((val) => {
      return {
        applicantIdx: val.applicantInfoTb.applicantIdx,
        userName: val.userName,
        userPosition: val.userPosition,
      };
    });

    const indexes = submitted.map(x => x.applicantInfoTb.applicantIdx);
    const applicantsEvaluations = await models.applicantEvaluation
      .find({ applicantIdx: { $in: indexes } })
      .select('application -_id').exec();
    let resultIdx = 0;
    for (const applicantEvaluations of applicantsEvaluations) {
      const { evaluations } = applicantEvaluations.application;
      let average = 0;
      for (const val of evaluations) {
        if (val.userIdx === userIdx) { results[resultIdx].myPoint = val.point; }
        average += val.point;
      }
      average /= evaluations.length;
      results[resultIdx].evalCount = evaluations.length;
      results[resultIdx].averagePoint = average;
      resultIdx += 1;
    }
    res.r(results);
  } catch (e) {
    next(e);
  }
};

// admin 전용 (합격자 체크해서 보내기)
module.exports.passApplications = async (req, res, next) => {
  try {
    console.log('haha');
  } catch (e) {
    next(e);
  }
};

// 점수 매기기
module.exports.postGrade = async (req, res, next) => {
  try {
    console.log('haha');
  } catch (e) {
    next(e);
  }
};

// comments 읽어오기
module.exports.getComments = async (req, res, next) => {
  try {
    console.log('haha');
  } catch (e) {
    next(e);
  }
};

// comment 달기
module.exports.postComment = async (req, res, next) => {
  try {
    console.log('haha');
  } catch (e) {
    next(e);
  }
};
