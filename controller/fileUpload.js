/* eslint-disable consistent-return */
const config = require('../config/config.json');
// Connect to S3
const AWS = require('aws-sdk');
AWS.config.region = config.S3.region;
AWS.config.update({
  accessKeyId: config.S3.accessKeyId,
  secretAccessKey: config.S3.secretAccessKey,
});

// Setting multer using memory storage
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

module.exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) { throw new Error('Unexpected file!'); }
    const file = req.file;
    const folder = (file.fieldname === 'user_image') ? 'images/' : 'portfolios/';
    const params = {
      Bucket: config.S3.bucketName,
      Key: folder + file.originalname, // 나중에 userEmail(unique) 값으로 바꾸어야 함
      ACL: 'public-read',
      ContentType: file.mimetype,
    };
    const s3obj = new AWS.S3({ params });
    // 업데이트 되는 경우에 key 값 같으면 자동으로 덮어 씀
    await s3obj.upload({ Body: file.buffer })
               .send((err, data) => {
                 res.r(data.Location);
               });
  } catch (err) {
    next(err);
  }
};

module.exports.removePicture = async (req, res, next) => {
  try {
    // token 에서 가져온 user email 을 key 값에 넣어야 함
    const folder = 'images/';
    const userEmail = 'hahahoho.png';
    const checkParams = {
      Bucket: config.S3.bucketName,
      Key: folder + userEmail,
    };
    const s3 = new AWS.S3();
    s3.deleteObject(checkParams, (err) => { if (err) throw (err); else res.r('kill image'); });
  } catch (err) {
    next(err);
  }
};

module.exports.removePortfolio = async (req, res, next) => {
  try {
    // token 에서 가져온 user email 을 key 값에 넣어야 함
    const folder = 'portfolios/';
    const userEmail = 'sample.pdf'; // 한글은 삭제 불가능함
    const checkParams = {
      Bucket: config.S3.bucketName,
      Key: folder + userEmail,
    };
    const s3 = new AWS.S3();
    s3.deleteObject(checkParams, (err) => { if (err) throw (err); else res.r('kill portfolio'); });
  } catch (err) {
    next(err);
  }
};
