const mongoose = require('mongoose');

const pendingInvoicesSchema = new mongoose.Schema({
  creatorId: String,
  invoice: String,
  amount: Number,
  status: String,
  type: String,
  refId: String
}, { timestamps: true });

const PendingInvoices = mongoose.model('PendingInvoices', pendingInvoicesSchema);

module.exports = PendingInvoices;
