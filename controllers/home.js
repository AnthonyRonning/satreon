const User = require('../models/User');

/**
 * GET /
 * Home page.
 */
exports.index = async (req, res) => {
  const getActiveUsers = new Promise((res, rej) => {
    User.find({ active: true }, (err, users) => {
      res(users);
    });
  });

  const users = await getActiveUsers;

  res.render('home', {
    title: 'Home',
    users
  });
};
