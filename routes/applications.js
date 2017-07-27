const express = require('express');
const router = express.Router();
const models = require('../models');
// const controller = require('../controller/applications');


// 라우팅에서는 ArrowFunction 안되서 이렇게 정의해야됨
const postApplications = async (req, res, next) => {
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

const getApplications = async (req, res, next) => {
  try {
    const result = await models.applicationDoc.find().exec();
    res.json(result);
  } catch (err) {
    next(err);
  }
};

const getApplication = async (req, res, next) => {
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

router.route('/').post(postApplications).get(getApplications);
router.route('/:userAuthIdx').get(getApplication);

module.exports = router;