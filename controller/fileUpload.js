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

const imageUpload = multer(
  { storage, limits: { fileSize: imageMax }, fileFilter: imageFilter });
module.exports.imageUpload = imageUpload;

const portfolioUpload = multer(
  { storage, limits: { fileSize: portfolioMax }, fileFilter: portfolioFilter });
module.exports.portfolioUpload = portfolioUpload;

const clearToS3 = removeKeyPath => new Promise(async (resolve, reject) => {
  const params = {
    Bucket: config.S3.bucketName,
    Key: removeKeyPath,
  };
  const s3 = new AWS.S3();
  await s3.deleteObject(params, (err) => { if (err) { reject(err); } });
});

const saveToS3 = (file, keyPath) => new Promise(async (resolve, reject) => {
  const params = {
    Bucket: config.S3.bucketName,
    Key: keyPath,
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

const getFileName = async (fileType, applicantIdx) => {
  let filename;
  if (fileType === 'images') {
    const obj = await models.applicantInfoTb.findOne({ where: { applicantIdx } });
    filename = obj.applicantPictureFilename;
  } else if (fileType === 'portfolios') {
    const obj = await models.applicationDoc.findOne({ applicantIdx }).exec();
    filename = obj.portfolioFilename;
  }
  return filename;
};
module.exports.getFileName = getFileName;

const getKeyPath = (userEmail, fileType, fileName) => {
  const encoded = Buffer.from(userEmail).toString('base64');
  return `${fileType}/${encoded}${fileName}`;
};
module.exports.getKeyPath = getKeyPath;

module.exports.getFileUrl =
  keyPath => `https://s3.${config.S3.region}.amazonaws.com/${config.S3.bucketName}/${keyPath}`;

//*-----------------
const helloworld = async (req, res, next) => {
  try {
    console.log('go to hello world');
    const file = req.file;
    console.log(file);
    if (!file) {
      const err = new Error('No file!');
      err.status = 400;
      throw err;
    }
    const fileType = (file.fieldname === 'user_image') ? 'images' : 'portfolios';

    // 기존에 업로드 한 파일이 있으면 삭제하기 (파일 이름이 다르면 덮어쓰기 안되고 생성되므로)
    const existFileName = await getFileName(fileType, req.user.applicantIdx);
    if (existFileName) {
      const keyPath = getKeyPath(req.user.userEmail, fileType, existFileName);
      clearToS3(keyPath);
    }

    // 파일 명 업데이트 (없었다면 null 을 update)
    if (fileType === 'images') {
      await models.applicantInfoTb.update({ applicantPictureFilename: file.originalname },
        { where: { applicantIdx: req.user.applicantIdx } });
    } else if (fileType === 'portfolios') {
      await models.applicationDoc.findOneAndUpdate({ applicantIdx: req.user.applicantIdx },
        { portfolioFilename: file.originalname });
    }

    // 파일 업로드
    const keyPath = getKeyPath(req.user.userEmail, fileType, file.originalname);
    const s3Url = await saveToS3(file, keyPath);
    const result = { url: s3Url, fileName: file.originalname };
    res.r(result);
  } catch (err) {
    debug('error occur in helloworld!', err);
    debug('ERR CODE - ', err.code);
    next(err);
  }
};

// Accept expected file only (image:jpeg,png / file:pdf)
const uploadPic = async (req, res, next) => {
  try {
    const upload = await multer(
      { storage, limits: { fileSize: imageMax }, fileFilter: imageFilter }).single('user_image');
    // upload(req, res, err => {
    //   if (err) {
    //     throw err;
    //   }
    // });

    upload(req, res, (err) => {
      if (err) {
        console.log(`err!!! : ${err}`);
        if (err.code === 'LIMIT_FILE_SIZE') { err.status = 400; } // LIMIT_FILE_SIZE : Multer's default error message
        console.log('in upload pic limit file size error \n');
        throw err;
        console.log('no err throw');
      } else {
        helloworld(req, res, next);
      }
    });

  } catch (e) {
    console.log('catch error! eeee', e);
    next(e);
  }
};
module.exports.uploadPic = uploadPic;
//*-----------------

module.exports.uploadFile = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) {
      const err = new Error('Unexpected file!');
      err.status = 400;
      throw err;
    }
    const fileType = (file.fieldname === 'user_image') ? 'images' : 'portfolios';

    // 기존에 업로드 한 파일이 있으면 삭제하기 (파일 이름이 다르면 덮어쓰기 안되고 생성되므로)
    const existFileName = await getFileName(fileType, req.user.applicantIdx);
    if (existFileName) {
      const keyPath = getKeyPath(req.user.userEmail, fileType, existFileName);
      clearToS3(keyPath);
    }

    // 파일 명 업데이트 (없었다면 null 을 update)
    if (fileType === 'images') {
      await models.applicantInfoTb.update({ applicantPictureFilename: file.originalname },
        { where: { applicantIdx: req.user.applicantIdx } });
    } else if (fileType === 'portfolios') {
      await models.applicationDoc.findOneAndUpdate({ applicantIdx: req.user.applicantIdx },
        { portfolioFilename: file.originalname });
    }

    // 파일 업로드
    const keyPath = getKeyPath(req.user.userEmail, fileType, file.originalname);
    const s3Url = await saveToS3(file, keyPath);
    const result = { url: s3Url, fileName: file.originalname };
    res.r(result);
  } catch (err) {
    next(err);
  }
};

const removeFile = async (applicantIdx, userEmail, fileType) => {
  let keyPath;
  if (fileType === 'images') {
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
  } else if (fileType === 'portfolios') {
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
