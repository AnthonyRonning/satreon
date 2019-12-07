const User = require('../models/User');

/**
 * GET /
 * Home page.
 */
exports.index = async (req, res) => {
  const getAllUsers = new Promise((res, rej) => {
    User.find((err, users) => {
      console.log('got all users: ' + users);
      res(users);
    });
  });

  const users = await getAllUsers;

  res.render('home', {
    title: 'Home',
    users
  });
};
