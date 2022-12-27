const express = require('express');
const passport = require('passport');

const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const users = require('../controllers/users')

const router = express.Router();

router.get('/register', users.renderRegisterForm);

router.post(
  '/register',
  asyncErrorWrapper(users.registerUser)
);

router.get('/login', users.renderLoginForm);

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
    keepSessionInfo: true,
  }),
  users.loginUser
);

router.get('/logout', users.logoutUser)

module.exports = router;
