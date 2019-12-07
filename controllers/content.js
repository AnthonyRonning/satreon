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

    newContent.save((err) => {
      if (err) {
        console.error(err);
        return next(err);
      }
      req.flash('success', { msg: 'Content posted!' });
      res.redirect('/');
    });
  });
};
