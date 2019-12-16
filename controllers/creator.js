const api = require('./api');
const User = require('../models/User');
const Content = require('../models/Content');
const lnrpc = require('../services/lnd/lnd');
const lsat = require('../services/lsat/lsat');

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
  // query variables
  const { macaroons } = req.query;
  let macaroonList = [];

  let firstMacaroon = '';
  let firstPreimage = '';

  if (macaroons === null) {
    console.log('macaroons empty');
  } else {
    console.log(`macaroon from the query: ${macaroons}`);

    macaroonList = macaroons.split(',');

    // first macaroon : preimage pair
    firstMacaroon = macaroonList[0].split(':')[0];
    firstPreimage = macaroonList[0].split(':')[1];
  }

  console.log(`first macaroon:${firstMacaroon}`);
  console.log(`first preimage: ${firstPreimage}`);

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
  let authorized = false;
  try {
    for (let i = 0; i < macaroonList.length; i++) {
      const macaroon = macaroonList[i].split(':')[0];
      const preimage = macaroonList[i].split(':')[1];
      authorized = await lsat.verifyMacaroon(macaroon, preimage, creator._id, content._id);
      if (authorized) break;
    }
  } catch (e) {
    authorized = false;
  }

  let errorMsg = null;
  let invoice = '';
  let macaroon = '';

  try {
    console.log('Grabbing invoice from creators node: ');
    invoice = await lnrpc.createInvoice(creator, content.price);
    console.log(invoice);


    // create a macaroon to give to the user
    macaroon = await lsat.generatePostMacaroon(content._id.toString(), invoice);
  } catch (error) {
    errorMsg = error.message;
  }

  res.render('creator/post/post', {
    title: 'View Post',
    creator,
    content,
    authorized,
    invoice,
    macaroon,
    errorMsg
  });
};


/**
 * GET /creator/:userId/subscribeCheck
 * Check the subscription of a user
 */
exports.postCheck = async (req, res) => {
  const { macaroon } = req.body;
  const { preimage } = req.body;

  console.log(`retrieved macaroon: ${macaroon}`);
  console.log(`retrieved preimage: ${preimage}`);

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

  res.render('creator/post/postCheck', {
    title: 'Bought Post',
    creator,
    macaroon,
    preimage
  });
};

/**
 * GET /creator/:userId/subscribe
 * View the subscription page of a creator
 */
exports.subscribe = async (req, res) => {
  let macaroon = '';
  let creator = '';
  let invoice = '';
  let errorMsg = null;

  try {
    // get the creator
    const getCreator = new Promise((res, rej) => {
      console.log(req);
      User.findById(req.params.userId, (err, user) => {
        if (err) console.error(err);

        console.log(`got creator: ${user}`);
        res(user);
      });
    });

    creator = await getCreator;

    console.log('Grabbing invoice from creators node: ');
    invoice = await lnrpc.createInvoice(creator, creator.profile.supporterAmount);
    console.log(invoice);

    // create a macaroon to give to the user
    macaroon = await lsat.generateMacaroon(creator._id.toString(), invoice);
  } catch (error) {
    console.log('Caught error: ' + error.message);
    errorMsg = error.message;
  }

  res.render('creator/subscribe', {
    title: 'Subscribe to Creator',
    creator,
    invoice,
    macaroon,
    errorMsg
  });
};


/**
 * GET /creator/:userId/subscribeCheck
 * Check the subscription of a user
 */
exports.subscribeCheck = async (req, res) => {
  const { macaroon } = req.body;
  const { preimage } = req.body;

  console.log(`retrieved macaroon: ${macaroon}`);
  console.log(`retrieved preimage: ${preimage}`);

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

  res.render('creator/subscribeCheck', {
    title: 'Subscribed to Creator',
    creator,
    macaroon,
    preimage
  });
};
