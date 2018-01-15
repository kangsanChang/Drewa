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
    personalUrl: String,
    answers: [String],
    devAnswers: [String],
    desAnswers: [String],
    interviewAvailableTime: [{
      date: Date,
      times: [String],
    }],
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

module.exports = mongoose.model('applicationDoc', applicationDocSchema);
