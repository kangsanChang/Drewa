const mongoose = require('mongoose');

const applicationDocSchema = new mongoose.Schema(
  {
    userIdx: {
      type: Number,
      index: true,
      unique: true,
    },
    entryRoute: String,
    portfolioFileUrl: String,
    personalUrl: [String],
    answers: [String],
    interviewAvailableTime: [Date],
  },
);

module.exports = mongoose.model('applicationDoc', applicationDocSchema);
