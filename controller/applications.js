const models = require('../models');

// 쓰이지 않는 함수이지만 구조에 참고하라고 아직 지우지 않음
const createNewApplication = async (data) => {
  const result = models.applicationDoc.create({
    cardinalNumber: data.cardinalNumber,
    userAuthIdx: data.userAuthIdx,
    answers: data.answers,
    interviewAvailableTime: data.interviewAvailableTime,
    algorithmAnswer: data.algorithmAnswer,
  });
  return result;
};

module.exports.createApplication = createNewApplication;
