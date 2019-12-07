const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: String,
  content: String,
  price: Number,

  user: {
    name: String,
    id: String
  }
}, { timestamps: true });

const Content = mongoose.model('Content', contentSchema);

module.exports = Content;
