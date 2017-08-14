const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const mongoConfig = require('../config/config.json').mongodb;
const mongoose = require('mongoose');
const db = {};
const sequelize = config.use_env_variable
  ? new Sequelize(process.env[config.use_env_variable])
  : new Sequelize(config.database, config.username, config.password, config);

fs.readdirSync(__dirname)
  .filter(file => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js') &&
    (file !== 'applicationDoc.js') && (file !== 'recruitmentInfo.js'))
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Request Body Validation
db.hasAllProp = (body, model) => {
  let attributes = null;
  if (db[model].rawAttributes) {
    attributes =
      Object.getOwnPropertyNames(db[model].rawAttributes)
            .filter(prop => (prop !== 'created_at') && (prop !== 'updated_at') && (body[prop]));
  } else {
    attributes = Object.getOwnPropertyNames(db[model].schema.obj);
  }
  const copied = {};
  attributes.forEach((prop) => {
    if (!body[prop]) {
      const err = new Error('Body property exception');
      err.status = 400;
      throw err;
    }
    copied[prop] = body[prop];
  });
  return copied;
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// MongoDB Model export
db.applicationDoc = require('./applicationDoc');
db.recruitmentInfo = require('./recruitmentInfo');

// MongoDB Initializing
mongoose.Promise = global.Promise;
// Mongoose 4.11 부터 아래와 같이 옵션을 줘야함 http://mongoosejs.com/docs/connections.html#use-mongo-client
mongoose.connect(mongoConfig.url, {
  useMongoClient: true,
});
mongoose.connection.once('open', () => {
  console.log('Mongoose on!');
});

module.exports = db;
