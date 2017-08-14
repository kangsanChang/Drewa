const mongoose = require('mongoose');

const applicationDocSchema = new mongoose.Schema(
  {
    userIdx: {
      type: Number,
      index: true,
      unique: true,
    },
    entryRoute: {
      type: String,
      default: null,
    },
    portfolioFileUrl: {
      type: String,
      default: null,
    },
    personalUrl: [String],
    answers: [String],
    interviewAvailableTime: [Date],
  },
);

module.exports = mongoose.model('applicationDoc', applicationDocSchema);
