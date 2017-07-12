const mongoose = require('mongoose');

const questionFormSchema = new mongoose.Schema({
    cardinalNumber: Number,
    questions: [String],
    algorithmUrl: String,
});

module.exports = mongoose.model('questionForm', questionFormSchema);