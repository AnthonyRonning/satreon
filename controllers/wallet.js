const lightningPayReq = require('bolt11');
const QRCode = require('qrcode');
const api = require('./api');
const User = require('../models/User');
const Content = require('../models/Content');
const PendingInvoices = require('../models/PendingInvoices');
const Transactions = require('../models/Transactions');
const lnrpc = require('../services/lnd/lnd');
const lsat = require('../services/lsat/lsat');


function findElement(arr, propName, propValue) {
  for (var i=0; i < arr.length; i++)
    if (arr[i][propName] == propValue)
      return arr[i];
}

/**
 * GET /creator/:userId
 * View creator page.
 */
exports.viewBalance = async (req, res) => {
  const validationErrors = [];
  const { user } = req;
  let balance = 0;

  // validation checking
  if (user === null || user === undefined) {
    validationErrors.push({ msg: 'Not logged in?' });
  }
  if (validationErrors.length) {
    req.flash('errors', validationErrors);
  }

  const getPendingInvoices = new Promise((res, rej) => {
    PendingInvoices.find({ creatorId: user._id, status: 'pending' }, (err, content) => {
      if (err) console.error(err);

      res(content);
    });
  });

  // check pending invoices & move to transactions
  const pendingInvoices = await getPendingInvoices;
  console.log('got pending invoices: ');
  console.log(pendingInvoices);

  // check all pending invoices to see if they have been paid
  for (let i = 0; i < pendingInvoices.length; i++) {
    const currentPendingInvoice = pendingInvoices[i];
    const decodedPayReq = lightningPayReq.decode(currentPendingInvoice.invoice);
    console.log(decodedPayReq);

    // look through all tags for it's payment hash
    const paymentHash = findElement(decodedPayReq.tags, 'tagName', 'payment_hash').data;
    console.log(paymentHash);
    const invoiceInfo = await lnrpc.serverLookupInvoice(paymentHash);
    console.log('found invoice: ');
    console.log(invoiceInfo);
    if (invoiceInfo.settled) {
      console.log('^invoice has been paid for');
      currentPendingInvoice.status = 'paid';
      await currentPendingInvoice.save(async (err) => {
        if (err) {
          console.error('error saving invoice information for this creator payment.. abort');
          console.error(err.message);
          throw err;
        }
      });

      const newTransaction = new Transactions();
      newTransaction.creatorId = currentPendingInvoice.creatorId;
      newTransaction.amount = currentPendingInvoice.amount;
      newTransaction.status = 'paid';
      newTransaction.invoice = currentPendingInvoice.invoice;
      newTransaction.updatedAt = currentPendingInvoice.updatedAt;
      await newTransaction.save();
    }
  }

  // get all transactions to calculate latest balance
  const getTransactions = new Promise((res, rej) => {
    Transactions.find({ creatorId: user._id }, (err, content) => {
      if (err) console.error(err);

      res(content);
    });
  });

  // check pending invoices & move to transactions
  const userTransactions = await getTransactions;
  console.log('got these user transactions: ');
  console.log(userTransactions);

  for (let i = 0; i < userTransactions.length; i++) {
    balance += userTransactions[i].amount;
  }

  res.render('wallet/balance', {
    title: 'View Wallet',
    balance
  });
};
