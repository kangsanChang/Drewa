const mongoose = require('mongoose');

const applicationDocSchema = new mongoose.Schema(
  {
    applicantIdx: {
      type: Number,
      index: true,
      unique: true,
    },
    entryRoute: {
      type: String,
      default: null,
    },
    portfolioFilename: {
      type: String,
      default: null,
    },
    personalUrl: [String],
    answers: [String],
    interviewAvailableTime: [Date],
  },
);

module.exports = mongoose.model('applicationDoc', applicationDocSchema);
