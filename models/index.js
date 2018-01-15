const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const config = require('../config/config.json');
const { dbConfig } = config;
// Trun off warning : https://github.com/sequelize/sequelize/issues/8417
dbConfig.mysql.operatorsAliases = Sequelize.Op;
const mysql = dbConfig.mysql[global.env];
const mongo = dbConfig.mongo[global.env];
// Split into two environments. test/development(default)
const mongoEnv = `mongodb_${global.env}`;
const mongoConfig = require('../config/config.json')[mongoEnv];
const mongoose = require('mongoose');
const db = {};
const sequelize = new Sequelize(mysql.database, mysql.username, mysql.password, dbConfig.mysql);
const bcrypt = require('bcrypt');

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js') &&
    (file !== 'applicationDoc.js') && (file !== 'applicantEvaluation.js') && (file !== 'recruitmentInfo.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// MongoDB Model export
db.applicationDoc = require('./applicationDoc');
db.applicantEvaluation = require('./applicantEvaluation');
db.recruitmentInfo = require('./recruitmentInfo');

// MongoDB Initializing
mongoose.Promise = global.Promise;
// Mongoose 4.11 부터 아래와 같이 옵션을 줘야함 http://mongoosejs.com/docs/connections.html#use-mongo-client
mongoose.connect(mongo, {
  useMongoClient: true,
});
mongoose.connection.once('open', () => {
  if (global.env !== 'test') {
    console.log('Mongoose on!');
  }
});

// sync with Initializing
// DB 생성 sync
sequelize.sync().then(async () => {
  if (global.env !== 'test') {
    console.log('Sync complete');
  }
});

// 서버 실행시, Admin 게정이 없으면 생성한다
// 있는 경우에는 비밀번호만 업데이트 한다.
(async () => {
  db.userInfoTb.findOrCreate({
    where: { userEmail: 'admin@depromeet.com' },
    defaults: {
      userName: 'admin',
      userPassword: bcrypt.hashSync(config.adminPassword, 10),
      userType: 'admin',
      userPosition: 'admin',
      userSeason: 0,
    },
  }).spread(async (user, created) => {
    if (created) {
      console.log('due to admin account is not exists, account created');
    } else {
      user.userPassword = bcrypt.hashSync(config.adminPassword, 10);
      await user.save();
      console.log('password updated');
    }
  });
})();

module.exports = db;
