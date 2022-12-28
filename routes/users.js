const express = require('express');
const passport = require('passport');

const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const users = require('../controllers/users');

const router = express.Router();

router
  .route('/register')
  .get(users.renderRegisterForm)
  .post(asyncErrorWrapper(users.registerUser));

router
  .route('/login')
  .get(users.renderLoginForm)
  .post(
    passport.authenticate('local', {
      failureFlash: true,
      failureRedirect: '/login',
      keepSessionInfo: true,
    }),
    users.loginUser
  );

router.get('/logout', users.logoutUser);

module.exports = router;
