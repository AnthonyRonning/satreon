const User = require('../models/User');
const Content = require('../models/Content');

/**
 * GET /content/create
 * Content Create page.
 */
exports.createContent = async (req, res) => {
  res.render('content/create', {
    title: 'Create Content',
  });
};

/**
 * GET /content/create
 * Content Create page.
 */
exports.editContent = async (req, res) => {
  const postId = req.params.postId;
  console.log(`user editing post ${postId}`);

  // get the post
  const getContentById = new Promise((res, rej) => {
    Content.findById(postId, (err, content) => {
      if (err) console.error(err);

      console.log(`got content: ${content}`);
      res(content);
    });
  });

  const content = await getContentById;

  res.render('content/edit', {
    title: 'Edit Content',
    content
  });
};


/**
 * POST /content/:postId/edit
 * Edit a post.
 */
exports.postEditContent = (req, res, next) => {
  const { postId } = req.params;

  User.findById(req.user.id, async (err, user) => {
    if (err) { return next(err); }
    // get the post
    const getContentById = new Promise((res, rej) => {
      Content.findById(postId, (err, content) => {
        if (err) console.error(err);

        console.log(`got content: ${content}`);
        res(content);
      });
    });

    const content = await getContentById;

    content.title = req.body.title || '';
    content.content = req.body.content || '';
    content.price = req.body.price || 0;

    content.save((err) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      req.flash('success', { msg: 'Content edited!' });
      res.redirect(`/creator/${user._id}/post/${content._id}`);
    });
  });
};


/**
 * POST /content/create
 * Create new post.
 */
exports.postContent = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    const newContent = new Content();
    newContent.title = req.body.title || '';
    newContent.content = req.body.content || '';
    newContent.price = req.body.price || 0;
    newContent.userId = req.user.id || '';
    newContent.userName = user.profile.name || '';

    newContent.save((err, content) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      req.flash('success', { msg: 'Content posted!' });
      res.redirect(`/creator/${user._id}/post/${content._id}`);
    });
  });
};
