// 지원서 작성 페이지에서 넘어오면 실행되는 logic
// USER_INFO_TB의 user_name 채워야 함
// COMM_INFO_TB 채우면 됨
const models = require('../models');

module.exports.postApplications = async (req, res, next) => {
  // transaction 은 exception 시 rollback 해야 하므로 try 위에 적어준다
  const t = await models.sequelize.transaction();

  try {
    const data = req.body;
    // console.log('DATA----- \n', data);
    const userName = data.userName;
    const commData = {
      commGender: data.commGender,
      commBirthday: new Date(data.commBirthday),
      commLocation: data.commLocation,
      commPhone: data.commPhone,
      commPictureUrl: data.commPictureUrl,
      commUniversity: data.commUniversity,
      commGrade: data.commGrade,
      commKnownPath: data.commKnownPath,
      commPortfolioUrl: data.commPortfolioUrl,
      commPersonalUrl: data.commPersonalUrl,
    };
    // json array 로 받는 애들 비워졌을 경우에 어떻게 처리할 지 프론트에 정의 되어 있어야 함

    // 토큰에서 user email 가져오는 부분 필요...
    // CODE ...
    // 헤더에서 토큰 까서 email 가지고 왔다(tempEmail)고 생각하고 진행.
    const tempEmail = 'test7@gmail.com';
    // 현재는 수동으로 userAuthIdx 지정해 주어야 함. 토큰에서 까서 찾아내는 코드 필요
    const appDocData = {
      cardinalNumber: 3,
      userAuthIdx: null,
      algorithmAnswer: data.algorithmAnswer,
      interviewAvailableTime: data.interviewAvailableTime,
      answers: data.answers,
    };

    await models.userInfoTb.findOne({ where: { userEmail: tempEmail } })
                .then((result) => {
                  // userAuthIdx 가져오기
                  appDocData.userAuthIdx = result.dataValues.userAuthIdx;
                  // interviewAvailavleTime 의 배열 요소들을 Date 타입으로 변경
                  // 몽고디비 확인해보면 string으로 넣어도 알아서 Date 타입으로 변경해서 저장하는 것 같긴 함
                  appDocData.interviewAvailableTime
                            .forEach((elem, i, arr) => { arr[i] = new Date(elem); });
                });

    // DB에 넣어주기
    const userInfoResult = await models.userInfoTb.update({ userName },
      { where: { userEmail: tempEmail }, transaction: t });
    const commInfoResult = await models.commInfoTb.create(commData, { transaction: t });
    const appDocResult = await models.applicationDoc.create(appDocData);
    await t.commit();

    // 결과값 응답
    const results = [userInfoResult, commInfoResult, appDocResult];
    res.json(results);
  } catch (err) {
    next(err);
    t.rollback();
  }
};

module.exports.getApplications = async (req, res, next) => {
  try {
    const result = await models.applicationDoc.find().exec();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

module.exports.getApplication = async (req, res, next) => {
  try {
    const result = await models.applicationDoc
                               // 전체다찾고
                               .find()
                               // 'userAuthIdx' 가
                               .where('userAuthIdx')
                               // 파라메터로 받은값과 같은걸 찾아라
                               .equals(req.params.userAuthIdx)
                               // Promise 반환을 위한 함수
                               .exec();
    res.json(result);
  } catch (err) {
    next(err);
  }
};
