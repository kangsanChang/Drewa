/* eslint-disable consistent-return */
const config = require('../config/config.json');
const models = require('../models');
// Connect to S3
const AWS = require('aws-sdk');
AWS.config.region = config.S3.region;
AWS.config.update({
  accessKeyId: config.S3.accessKeyId,
  secretAccessKey: config.S3.secretAccessKey,
});

// Set multer to use memory storage
const multer = require('multer');
const storage = multer.memoryStorage();
const imageMax = 2 * 1000 * 1000; // 2 MB
const portfolioMax = 50 * 1000 * 1000; // 50 MB

// Set validator
const imageValidation = (req, file, cb) => {
  try {
    if (file.fieldname === 'user_image') {
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        return cb(null, true);
      }
    }
    return cb(null, false);
  } catch (err) {
    return cb(new Error('Unexpected error'));
  }
};

const portfolioValidation = (req, file, cb) => {
  try {
    if (file.fieldname === 'user_portfolio') {
      if (file.mimetype === 'application/pdf') {
        return cb(null, true);
      }
    }
    return cb(null, false);
  } catch (err) {
    return cb(new Error('Unexpected error'));
  }
};

// Accept expected file only (image:jpeg,png / file:pdf)
module.exports.imageUpload = multer(
  { storage, limits: { fileSize: imageMax }, fileFilter: imageValidation });

module.exports.portfolioUpload = multer(
  { storage, limits: { fileSize: portfolioMax }, fileFilter: portfolioValidation });

//TODO: 따로 뺴야함. 스파게티 청소 필요
const clearToS3 = (removeKeyPath) => {
  return new Promise(async (resolve, reject) => {
    const params = {
      Bucket: config.S3.bucketName,
      Key: removeKeyPath,
    };
    const s3 = new AWS.S3();
    await s3.deleteObject(params, (err) => { if (err) { reject(err); } });
  });
};

const saveToS3 = (file, keyName) => {
  return new Promise(async (resolve, reject) => {
    const s3path = (file.fieldname === 'user_image') ? 'images/' : 'portfolios/';
    const params = {
      Bucket: config.S3.bucketName,
      Key: s3path + keyName,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };
    const s3obj = new AWS.S3({ params });
    // 업데이트 되는 경우에 key 값 같으면 자동으로 덮어 씀
    await s3obj.upload({ Body: file.buffer })
               .send((err, data) => {
                 if (err) { reject(err); }
                 resolve(data.Location);
               });
  });
};

module.exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) { throw new Error('Unexpected file!'); }
    const file = req.file;
    const userEmail = req.user.userEmail;
    const fileType = (file.fieldname === 'user_image') ? 'images' : 'portfolios';
    const encoded = Buffer.from(userEmail).toString('base64');
    const keyName = encoded + file.originalname;

    if (fileType === 'images') {
      // applicantInfoTb 조회해서 존재하는 파일 명 있으면 S3에서 찾아서 삭제하기
      await models.applicantInfoTb.findOne({ where: { userIdx: req.user.userIdx } })
                  .then((data) => {
                    const existFileName = data.dataValues.applicantPictureFilename;
                    if (existFileName !== null) {
                      // DB 안에 picture filename 있으면 삭제하기
                      const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
                      clearToS3(removeKeyPath);
                    }
                  });
      // 새로 저장할 file 이름으로 Update 시키기 (null 이어도 테이블 셀이 존재는 하므로 update)
      await models.applicantInfoTb.update({ applicantPictureFilename: file.originalname },
        { where: { userIdx: req.user.userIdx } });
    } else if (fileType === 'portfolios') {
      const existObject = await models.applicationDoc.findOneAndUpdate(
        { userIdx: req.user.userIdx },
        { portfolioFilename: file.originalname }, { ranValidators: true });
      const existFileName = existObject.portfolioFilename;
      if (existFileName !== null) {
        // DB 안에 picture filename 있으면 삭제하기
        const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
        clearToS3(removeKeyPath);
      }
    }
    const result = await saveToS3(file, keyName);
    res.r(result);
  } catch (err) {
    next(err);
  }
};

module.exports.removePicture = async (req, res, next) => {
  try {
    const userEmail = req.user.userEmail;
    const fileType = 'images';
    const encoded = Buffer.from(userEmail).toString('base64');
    await models.applicantInfoTb.findOne({ where: { userIdx: req.user.userIdx } })
                .then((data) => {
                  const existFileName = data.dataValues.applicantPictureFilename;
                  if (existFileName !== null) {
                    const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
                    clearToS3(removeKeyPath);
                  }
                });
    // filename null 로 만들기
    await models.applicantInfoTb.update({ applicantPictureFilename: null },
      { where: { userIdx: req.user.userIdx } });
    res.r('remove picture success!!');
  } catch (err) {
    next(err);
  }
};

module.exports.removePortfolio = async (req, res, next) => {
  try {
    const userEmail = req.user.userEmail;
    const fileType = 'portfolios';
    const encoded = Buffer.from(userEmail).toString('base64');
    await models.applicationDoc.findOne({ userIdx: req.user.userIdx }, (err, data) => {
      const existFileName = data.portfolioFilename;
      if (existFileName !== null) {
        const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
        clearToS3(removeKeyPath);
      }
    });
    // filename null 로 만들기
    await models.applicationDoc.findOneAndUpdate({ userIdx: req.user.userIdx },
      { portfolioFilename: null });
    res.r('remove portfolio success!!');
  } catch (err) {
    next(err);
  }
};
