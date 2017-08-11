const mongoose = require('mongoose');

const recruitmentInfoSchema = new mongoose.Schema(
  {
    season: Number,
    commQuestions: [String],
    developerQuestions: [String],
    designerQuestions: [String],
    deadline: Date,
    interviewTime: [Date],
  },
);

module.exports = mongoose.model('recruitmentInfo', recruitmentInfoSchema);
