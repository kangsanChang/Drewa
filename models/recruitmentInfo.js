const mongoose = require('mongoose');

const recruitmentInfoSchema = new mongoose.Schema(
  {
    season: Number,
    commQuestions: [String],
    developerQuestions: [String],
    designerQuestions: [String],
    deadline: Date,
    interviewTimes: [
      {
        date: String,
        times: [String],
      },
    ],
    interviewPlace: [String],
  }, {
    timestamps: { createdAt: 'createdAt' },
  },
);

module.exports = mongoose.model('recruitmentInfo', recruitmentInfoSchema);
