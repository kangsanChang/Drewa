/* eslint-disable consistent-return */
const config = require('../config/config.json');
const models = require('../models');
const debug = require('debug')('drewa:test');
// Connect to S3
const AWS = require('aws-sdk');
AWS.config.region = config.S3.region;
AWS.config.update(
  { accessKeyId: config.S3.accessKeyId, secretAccessKey: config.S3.secretAccessKey });

// Set multer to use memory storage
const multer = require('multer');
const storage = multer.memoryStorage();
const imageMax = 3 * 1000 * 1000; // 3 MB
const portfolioMax = 50 * 1000 * 1000; // 50 MB

// Set validator
const imageFilter = (req, file, cb) => {
  // Reject
  if (file.fieldname !== 'user_image') {
    const err = new Error('file from wrong field');
    err.status = 400;
    return cb(err, false);
  }

  // Resolve
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') { return cb(null, true); }

  // Error
  const err = new Error('goes wrong on the filename extensions');
  err.status = 400;
  return cb(err);
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

// AWS Control methods
const clearToS3 = removeKeyPath => new Promise(async (resolve, reject) => {
  const params = {
    Bucket: config.S3.bucketName,
    Key: removeKeyPath,
  };
  const s3 = new AWS.S3();
  await s3.deleteObject(params, (err) => { if (err) { reject(err); } });
});
const saveToS3 = (file, keyPath) => new Promise(async (resolve, reject) => {
  const s3 = new AWS.S3({
    params: {
      Bucket: config.S3.bucketName,
      Key: keyPath,
      ACL: 'public-read',
      ContentType: file.mimetype,
    },
  });
  await s3.upload({ Body: file.buffer })
    .send((err, data) => {
      if (err) { reject(err); }
      resolve(data.Location);
    });
});

const getFileName = async (field, applicantIdx) => {
  // TODO: index 로 받고 poster 타입 추가하면 될 듯
  if (field === 'user_image') {
    const { applicantPictureFilename } = await models.applicantInfoTb
      .findOne({ where: { applicantIdx } });
    return applicantPictureFilename;
  } else if (field === 'user_portfolio') {
    const { portfolioFilename } = await models.applicationDoc.findOne({ applicantIdx }).exec();
    return portfolioFilename;
  }
};
module.exports.getFileName = getFileName;

const getKeyPath = (userEmail, field, fileName) => {
  const encoded = Buffer.from(userEmail).toString('base64');
  return `${field}/${encoded}${fileName}`;
};
module.exports.getKeyPath = getKeyPath;

module.exports.getFileUrl =
  keyPath => `https://s3.${config.S3.region}.amazonaws.com/${config.S3.bucketName}/${keyPath}`;

// create multer object
module.exports.imgUpload = multer({
  storage, limits: { fileSize: imageMax }, fileFilter: imageFilter,
}).single('user_image');

module.exports.portfolioUpload = multer({
  storage,
  limits: { fileSize: portfolioMax },
  fileFilter: portfolioFilter,
}).single('user_portfolio');

module.exports.posterUpload = multer({ storage }).single('poster');

module.exports.posterUploadCB = async (req, res, next) => {
  try {
    const { fieldname, originalname } = req.file; // fieldname: poster
    const { season } = req.params;
    const keyPath = `${fieldname}/${season}/${originalname}`;
    const url = await saveToS3(req.file, keyPath);
    await models.recruitmentInfo.findOneAndUpdate({ season }, { mainPosterUrl: url });
    res.r({ url });
  } catch (e) {
    next(e);
  }
};

module.exports.fileUploadCB = async (req, res, next) => {
  try {
    const { userEmail, applicantIdx } = req.user;
    const { fieldname, originalname } = req.file;

    // 이전 파일 삭제
    const prevFile = await getFileName(fieldname, applicantIdx);
    if (prevFile) {
      const keyPath = getKeyPath(userEmail, fieldname, prevFile);
      clearToS3(keyPath);
    }

    if (fieldname === 'user_image') {
      await models.applicantInfoTb.update({ applicantPictureFilename: originalname },
        { where: { applicantIdx } });
    } else if (fieldname === 'user_portfolio') {
      await models.applicationDoc.findOneAndUpdate({ applicantIdx },
        { portfolioFilename: originalname });
    }
    // 파일 업로드
    const keyPath = getKeyPath(userEmail, fieldname, originalname);
    const url = await saveToS3(req.file, keyPath);
    const result = { url, fileName: originalname };
    res.r(result);
  } catch (e) {
    next(e);
  }
};

// Remove files
const removeFile = async (applicantIdx, userEmail, fileType) => {
  let keyPath;
  if (fileType === 'user_image') {
    const data = await models.applicantInfoTb.findOne({ where: { applicantIdx } });
    if (data.applicantPictureFilename) {
      keyPath = getKeyPath(userEmail, fileType, data.applicantPictureFilename);
      clearToS3(keyPath);
    } else {
      // 파일이 없는 데 삭제하려고 하는 경우
      const err = new Error('Can not find file');
      err.status = 400;
      throw err;
    }
    // filename null 로 만들기
    await models.applicantInfoTb.update({ applicantPictureFilename: null },
      { where: { applicantIdx } });
  } else if (fileType === 'user_portfolio') {
    const data = await models.applicationDoc.findOne({ applicantIdx }).exec();
    if (data.portfolioFilename) {
      keyPath = getKeyPath(userEmail, fileType, data.portfolioFilename);
      clearToS3(keyPath);
    } else {
      // 파일이 없는 데 삭제하려고 하는 경우
      const err = new Error('Can not find file');
      err.status = 400;
      throw err;
    }
    // filename null 로 만들기
    await models.applicationDoc.findOneAndUpdate({ applicantIdx },
      { portfolioFilename: null });
  }
};

module.exports.removeFile = removeFile;

module.exports.removeImage = async (req, res, next) => {
  try {
    const { userEmail, applicantIdx } = req.user;
    await removeFile(applicantIdx, userEmail, 'user_image');
    res.status(204).end(); // 204 (No-content) 는 res.body 없이 res 를 종료한다.
  } catch (err) {
    next(err);
  }
};

module.exports.removePortfolio = async (req, res, next) => {
  try {
    const { userEmail, applicantIdx } = req.user;
    await removeFile(applicantIdx, userEmail, 'user_portfolio');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
