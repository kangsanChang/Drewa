const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(module.filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.json')[env];
const mongoConfig = require(__dirname + '/../config/config.json')['mongodb'];
const mongoose = require('mongoose');
const db = {};
const sequelize = config.use_env_variable
    ? new Sequelize(process.env[config.use_env_variable])
    : new Sequelize(config.database, config.username, config.password, config);

mongoose.Promise = global.Promise;
// Mongoose 4.11 부터 아래와 같이 옵션을 줘야함 http://mongoosejs.com/docs/connections.html#use-mongo-client
mongoose.connect(mongoConfig.url, {
    useMongoClient: true
});

fs
    .readdirSync(__dirname)
    .filter(file => {
        // applicationDoc 파일을 읽지 말아야 함
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js' && file !== 'applicationDoc.js');
    })
    .forEach(file => {
        const model = sequelize['import'](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// MongoDB Model export
db.applicationDoc = require('./applicationDoc');

mongoose.connection.once('open', () => {
    console.log('Mongoose on!');
});

module.exports = db;
