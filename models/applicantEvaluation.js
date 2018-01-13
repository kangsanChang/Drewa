const mongoose = require('mongoose');

const applicantEvaluationSchema = new mongoose.Schema(
  {
    applicantIdx: Number,
    application: {
      comments: [
        {
          userIdx: Number,
          comment: String,
          createdAt: Date,
        },
      ],
      evaluations: [
        {
          userIdx: Number,
          point: Number,
        },
      ],
    },
    interview: {
      comments: [
        {
          userIdx: Number,
          comment: String,
          createdAt: Date,
        },
      ],
      evaluations: [
        {
          userIdx: Number,
          point: Number,
        },
      ],
    },
  }, {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  },
);

module.exports = mongoose.model('applicantEvaluation', applicantEvaluationSchema);
