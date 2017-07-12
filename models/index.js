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


fs
  .readdirSync(__dirname)
  .filter(file =>
    // applicationDoc 파일을 읽지 말아야 함
  (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js' && file !== 'applicationDoc.js'))
  .forEach((file) => {
      const model = sequelize.import(path.join(__dirname, file));
      db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

// Request Body Vailidation
db.hasAllProp = (body, model) => {
    let attributes = null;
    const copied = {};
    if (db[model].rawAttributes) {
        attributes = db[model].rawAttributes;
    } else {
        attributes = db[model].schema.obj;
    }
    for (prop in attributes) {
        if (!body[prop]) {
            const err = new Error('Body property exception');
            err.status = 400;
            throw err;
        }
        copied[prop] = body[prop];
    }
    return copied;
};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// MongoDB Model export
db.applicationDoc = require('./applicationDoc');

/*
 * MongoDB Initializing
 */
mongoose.Promise = global.Promise;
// Mongoose 4.11 부터 아래와 같이 옵션을 줘야함 http://mongoosejs.com/docs/connections.html#use-mongo-client
mongoose.connect(mongoConfig.url, {
    useMongoClient: true,
});
mongoose.connection.once('open', () => {
    console.log('Mongoose on!');
});

module.exports = db;
