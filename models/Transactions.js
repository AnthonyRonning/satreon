const mongoose = require('mongoose');

const transactionsSchema = new mongoose.Schema({
  creatorId: String,
  invoice: String,
  amount: Number,
  status: String,
  type: String,
  refId: String
}, { timestamps: true });

const Transactions = mongoose.model('Transactions', transactionsSchema);

module.exports = Transactions;
