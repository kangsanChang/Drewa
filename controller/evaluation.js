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

// comments + 내 점수 읽어오기
module.exports.getEvalData = async (req, res, next) => {
  try {
    const { applicantIdx } = req.params;
    const { userIdx } = req.user;
    const { application } = await models.applicantEvaluation.findOne({ applicantIdx })
      .select('application -_id').exec();
    // application.comment 에 아무것도 없으면 함수 실행 종료해도 됨
    if (application.comments.length === 0) {
      return res.r([]);
    }
    const rawInterviewers = await models.userInfoTb.findAll({
      where: { userType: 'interviewer' },
      attributes: ['userIdx', 'userName', 'userEmail'],
      raw: true,
    });

    // sequelize 의 경우 raw true 로 가져와도 plain object 의 배열이 아님
    // console 에서 보는 것과 달리 spread operator로 merge 하면 dummy 많음
    // plain object 만 추출
    const interviewers = rawInterviewers.map(
      (x) => {
        return {
          userIdx: x.userIdx,
          userName: x.userName,
          userEmail: x.userEmail,
        };
      },
    );
    // Mongoose 는 Plain object를 바로 추출할 수 있다
    const comments = application.comments.map(x => x.toObject());
    const results = { myPoint: null, comments: [] };
    comments.forEach((comment) => {
      interviewers.forEach((interviewer) => {
        if (comment.userIdx === interviewer.userIdx) {
          results.comments.push({ ...interviewer, ...comment });
        }
      });
    });

    // 내 점수 있으면 찾아오기
    application.evaluations.forEach((evaluation) => {
      if (evaluation.userIdx === userIdx) {
        results.myPoint = evaluation.point;
      }
    });
    res.r(results);
  } catch (e) {
    next(e);
  }
};

// TODO: 나중에 interview 도중에 comment 달때도 사용하기 위해서 mode 옵션을 주자

// comment 달기
module.exports.postComment = async (req, res, next) => {
  try {
    const { userIdx } = req.user;
    const { applicantIdx } = req.params;
    const { comment, createdAt } = req.body;
    const commentObj = { userIdx, comment, createdAt };
    await models.applicantEvaluation.update({ applicantIdx }, {
      $push: { 'application.comments': commentObj },
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports.deleteComment = async (req, res, next) => {
  try {
    const { applicantIdx, id } = req.params;
    console.log(id, applicantIdx);
    await models.applicantEvaluation.update({ applicantIdx }, {
      $pull: { 'application.comments': { _id: id } },
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};

module.exports.setPoint = async (req, res, next) => {
  try {
    const { applicantIdx } = req.params;
    const { userIdx } = req.user;
    const { point } = req.body;
    const pointObj = { userIdx, point };
    const applicantEval = await models.applicantEvaluation.findOne({ applicantIdx });
    const { evaluations } = applicantEval.application;
    let existing = false;
    evaluations.forEach((evaluation) => {
      if (evaluation.userIdx === userIdx) {
        existing = true;
      }
    });
    if (existing) {
      await models.applicantEvaluation.update({ applicantIdx }, {
        $pull: { 'application.evaluations': { userIdx } },
      });
    }
    await models.applicantEvaluation.update({ applicantIdx }, {
      $push: { 'application.evaluations': pointObj },
    });
    res.sendStatus(200);
  } catch (e) {
    next(e);
  }
};