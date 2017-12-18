const mongoose = require('mongoose');

const applicantEvaluationSchema = new mongoose.Schema(
  {
    applicantIdx: Number,
    applicationEvaluation: [
      {
        userIdx: Number,
        comment: String,
        point: Number,
      },
    ],
    interviewEvaluation: [
      {
        userIdx: Number,
        comment: String,
        point: Number,
      },
    ],
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

module.exports = mongoose.model('applicantEvaluation', applicantEvaluationSchema);
