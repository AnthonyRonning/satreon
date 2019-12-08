const User = require('../models/User');
const Content = require('../models/Content');
const lnrpc = require('../services/lnd/lnd');

/**
 * GET /creator/:userId
 * View creator page.
 */
exports.viewCreator = async (req, res) => {
  const getCreator = new Promise((res, rej) => {
    console.log(req);
    User.findById(req.params.userId, (err, user) => {
      if (err) console.error(err);

      console.log(`got creator: ${user}`);
      res(user);
    });
  });

  const creator = await getCreator;

  const getContentByCreatorId = new Promise((res, rej) => {
    Content.find({ userId: creator._id }, (err, contents) => {
      if (err) console.error(err);

      console.log(`Found all these contents for userId ${creator._id}: ${contents}`);
      res(contents);
    });
  });

  const contents = await getContentByCreatorId;

  res.render('creator/profile', {
    title: 'View Content',
    creator,
    contents
  });
};


/**
 * GET /creator/:userId/post/:postId
 * View a creator's post.
 */
exports.viewPost = async (req, res) => {

  // get the creator
  const getCreator = new Promise((res, rej) => {
    console.log(req);
    User.findById(req.params.userId, (err, user) => {
      if (err) console.error(err);

      console.log(`got creator: ${user}`);
      res(user);
    });
  });

  const creator = await getCreator;

  // get the post
  const getContentById = new Promise((res, rej) => {
    Content.findById(req.params.postId, (err, content) => {
      if (err) console.error(err);

      console.log(`got content: ${content}`);
      res(content);
    });
  });

  const content = await getContentById;

  // check to see if the user is authorized to see
  const authorized = false;

  // create an invoice for the user to pay
  const invoice = await lnrpc.addInvoice(content.price);
  console.log('invoice: ' + JSON.stringify(invoice));
  console.log(invoice);

  res.render('creator/post/post', {
    title: 'View Post',
    creator,
    content,
    authorized,
    invoice
  });
};


/**
 * GET /creator/:userId/subscribe
 * View the subscription page of a creator
 */
exports.subscribe = async (req, res) => {

  // get the creator
  const getCreator = new Promise((res, rej) => {
    console.log(req);
    User.findById(req.params.userId, (err, user) => {
      if (err) console.error(err);

      console.log(`got creator: ${user}`);
      res(user);
    });
  });

  const creator = await getCreator;

  // create an invoice for the user to pay
  const invoice = await lnrpc.addInvoice(creator.profile.supporterAmount);
  console.log('invoice: ' + JSON.stringify(invoice));
  console.log(invoice);

  res.render('creator/subscribe', {
    title: 'Subscribe to Creator',
    creator,
    invoice
  });
};
