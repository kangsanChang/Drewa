const mongoose = require('mongoose');

const recruitmentInfoSchema = new mongoose.Schema(
  {
    season: Number,
    invitationCode: String,
    commQuestions: [String],
    developerQuestions: [String],
    designerQuestions: [String],
    start: Date,
    deadline: Date,
    interviewTimes: [
      {
        date: String,
        times: [String],
      },
    ],
    interviewPlace: [String],
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

module.exports = mongoose.model('recruitmentInfo', recruitmentInfoSchema);
