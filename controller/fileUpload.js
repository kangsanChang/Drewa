/* eslint-disable consistent-return */
const config = require('../config/config.json');

// Connect to S3
const AWS = require('aws-sdk');
AWS.config.region = config.S3.region;
AWS.config.update({
  accessKeyId: config.S3.accessKeyId,
  secretAccessKey: config.S3.secretAccessKey,
});

module.exports.fileValidation = (req, file, cb) => {
  try {
    if (file.fieldname === 'user_image') {
      if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        return cb(null, true);
      }
    } else if (file.fieldname === 'user_portfolio') {
      if (file.mimetype === 'application/pdf') {
        return cb(null, true);
      }
    } else {
      return cb(null, false);
    }
  } catch (err) {
    return cb(new Error('Unexpected error'));
  }
};

module.exports.uploadFile = async (req, res, next) => {
  try {
    // 라우터에 multer 객체를 연결하면 input name 이 일치하는 파일 데이터를 자동으로 받아서 req.file 를 통해 접근가능
    // 토큰 정보랑 결합해서 이미지 이름 (key) 값 정해주면 될 듯, (예를들면 이메일) 가지고 있는 정보가 이메일이랑 useridx 뿐이니
    const file = req.file;
    const folder = (file.fieldname === 'user_image') ? 'images/' : 'portfolios/';
    const params = {
      Bucket: config.S3.bucketName,
      Key: folder + file.originalname,
      ACL: 'public-read',
      ContentType: file.mimetype,
    };
    const s3obj = new AWS.S3({ params });
    await s3obj.upload({ Body: file.buffer })
               .send((err, data) => {
                 res.r(data.Location); // 이 주소로 화면에 사진 파일 연결(?)
               });
  } catch (err) {
    next(err);
  }
};

module.exports.removePicture = async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
};

module.exports.removePortfolio = async (req, res, next) => {
  try {

  } catch (err) {
    next(err);
  }
};

