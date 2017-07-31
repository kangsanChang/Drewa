const models = require('../models');

module.exports.postApplications = async (req, res, next) => {
  try {
    // body 와 해당 모델의 프로퍼티가 일치하면 data 에 복사함
    // const data = models.hasAllProp(req.body, 'applicationDoc');
    const data = req.body;
    // 해당 데이터를 기반으로 DB 삽입
    const result = await models.applicationDoc.create(data);
    // 결과값 응답
    res.json(result);
  } catch (err) {
    next(err);
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
                               // 'userAuthIdx'가
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
