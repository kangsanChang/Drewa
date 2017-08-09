const mongoose = require('mongoose');

const questionFormSchema = new mongoose.Schema(
  {
    season: Number,
    commQuestions: [String],
    developerQuestions: [String],
    designerQuestions: [String],
  },
);

module.exports = mongoose.model('questionForm', questionFormSchema);
