const mongoose = require('mongoose');

const appliDocSchema = new mongoose.Schema(
  {
    userIdx: {
      type: Number,
      index: true,
      unique: true,
    },
    answers: [String],
    interviewAvailableTime: [Date],
  },
);

module.exports = mongoose.model('applicationDoc', appliDocSchema);
