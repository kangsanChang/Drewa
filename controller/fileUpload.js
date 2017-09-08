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
const imageMax = 3 * 1000 * 1000; // 3 MB
const portfolioMax = 50 * 1000 * 1000; // 50 MB

// Set validator
const imageFilter = (req, file, cb) => {
  if (file.fieldname !== 'user_image') {
    const err = new Error('wrong field name');
    err.status = 400;
    return cb(err, false);
  }
  // Resolve
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    return cb(null, true);
  }
  // Reject : wrong filename extensions.
  const err = new Error('goes wrong on the filename extensions');
  err.status = 400;
  return cb(err, false);
};

const portfolioFilter = (req, file, cb) => {
  if (file.fieldname !== 'user_portfolio') {
    const err = new Error('wrong field name');
    err.status = 400;
    return cb(err, false);
  }
  // Resolve
  if (file.mimetype === 'application/pdf') {
    return cb(null, true);
  }
  // Reject : wrong filename extensions.
  const err = new Error('goes wrong on the filename extensions');
  err.status = 400;
  return cb(err, false);
};

// Accept expected file only (image:jpeg,png / file:pdf)
module.exports.imageUpload = multer(
  { storage, limits: { fileSize: imageMax }, fileFilter: imageFilter });

module.exports.portfolioUpload = multer(
  { storage, limits: { fileSize: portfolioMax }, fileFilter: portfolioFilter });

const clearToS3 = removeKeyPath => new Promise(async (resolve, reject) => {
  const params = {
    Bucket: config.S3.bucketName,
    Key: removeKeyPath,
  };
  const s3 = new AWS.S3();
  await s3.deleteObject(params, (err) => { if (err) { reject(err); } });
});

const saveToS3 = (file, keyName) => new Promise(async (resolve, reject) => {
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

module.exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      const err = new Error('Unexpected file!');
      err.status = 400;
      throw err;
    }
    const file = req.file;
    const userEmail = req.user.userEmail;
    const fileType = (file.fieldname === 'user_image') ? 'images' : 'portfolios';
    const encoded = Buffer.from(userEmail).toString('base64');
    const keyName = encoded + file.originalname;

    if (fileType === 'images') {
      // applicantInfoTb 조회해서 존재하는 파일 명 있으면 S3에서 찾아서 삭제하기
      await models.applicantInfoTb.findOne({ where: { applicantIdx: req.user.applicantIdx } })
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
        { where: { applicantIdx: req.user.applicantIdx } });
    } else if (fileType === 'portfolios') {
      const existObject = await models.applicationDoc.findOneAndUpdate(
        { applicantIdx: req.user.applicantIdx },
        { portfolioFilename: file.originalname }, { ranValidators: true });
      if (existObject !== null) {
        // DB 안에 picture filename 있으면 삭제하기
        const existFileName = existObject.portfolioFilename;
        const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
        clearToS3(removeKeyPath);
      }
    }
    const s3Url = await saveToS3(file, keyName);
    const result = {
      url: s3Url,
      fileName: file.originalname,
    };
    res.r(result);
  } catch (err) {
    // file 이 없을때 보내는 에러
    next(err);
  }
};

const removeFile = async (applicantIdx, userEmail, fileType) => {
  const encoded = Buffer.from(userEmail).toString('base64');
  if (fileType === 'images') {
    const data = await models.applicantInfoTb.findOne({ where: { applicantIdx } });
    if (data.applicantPictureFilename) {
      const existFileName = data.applicantPictureFilename;
      const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
      clearToS3(removeKeyPath);
    } else {
      return false;
    }
    // filename null 로 만들기
    await models.applicantInfoTb.update({ applicantPictureFilename: null },
      { where: { applicantIdx } });
    return true;
  } else if (fileType === 'portfolios') {
    const data = await models.applicationDoc.findOne({ applicantIdx }).exec();
    if (data.portfolioFilename) {
      const existFileName = data.portfolioFilename;
      const removeKeyPath = `${fileType}/${encoded}${existFileName}`;
      clearToS3(removeKeyPath);
    } else {
      return false;
    }
    // filename null 로 만들기
    await models.applicationDoc.findOneAndUpdate({ applicantIdx },
      { portfolioFilename: null });
    return true;
  }
  throw new Error('no file types');
};

module.exports.removeFile = removeFile;

module.exports.removePicture = async (req, res, next) => {
  try {
    const userEmail = req.user.userEmail;
    const applicantIdx = req.user.applicantIdx;
    await removeFile(applicantIdx, userEmail, 'images');
    res.status(204).end(); // 204 (No-content) 는 res.body 없이 res 를 종료한다.
  } catch (err) {
    next(err);
  }
};

module.exports.removePortfolio = async (req, res, next) => {
  try {
    const userEmail = req.user.userEmail;
    const applicantIdx = req.user.applicantIdx;
    await removeFile(applicantIdx, userEmail, 'portfolios');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
