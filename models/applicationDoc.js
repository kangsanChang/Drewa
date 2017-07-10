const mongoose = require('mongoose');

const appliDocSchema = new mongoose.Schema({
    cardinalNumber: Number,
    userAuthIdx: {
        type: Number,
        index: true,
        unique: true
    },
    answers: [String],
    interviewAvailableTime: [Date],
    algorithmAnswer: String
});

module.exports = mongoose.model('errandChats', appliDocSchema);