const mongoose = require('mongoose');

const recruitmentInfoSchema = new mongoose.Schema(
  {
    season: Number,
    isFinished: {
      type: Boolean,
      default: false,
    },
    invitationCode: String,
    commQuestions: [String],
    developerQuestions: [String],
    designerQuestions: [String],
    applicationPeriod: [Date],
    interviewSchedule: [
      {
        date: String,
        place: String,
        times: [String],
      },
    ],
    interviewGroup: [
      {
        interviewDate: String,
        interviewTime: String,
        interviewees: [String],
      },
    ],
    mainTitle: String,
    mainDescription: String,
    mainPosterUrl: String,
    infoMessages: {
      submitted: String,
      notSubmitted: String,
      applicationAccept: String,
      applicationReject: String,
      finalAccept: String,
      finalReject: String,
    },
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

module.exports = mongoose.model('recruitmentInfo', recruitmentInfoSchema);
