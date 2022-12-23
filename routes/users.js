const express = require('express');
const passport = require('passport');

const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const User = require('../models/user');

const router = express.Router();

router.get('/register', (req, res) => {
  res.render('users/register');
});

router.post(
  '/register',
  asyncErrorWrapper(async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.flash('success', `Welcome to CampersYelp, ${user.username}!`);
      res.redirect('/campgrounds');
    } catch (e) {
      req.flash('error', e.message);
      res.redirect('/register');
    }
  })
);

router.get('/login', (req, res) => {
  res.render('users/login');
});

router.post(
  '/login',
  passport.authenticate('local', {
    failureFlash: true,
    failureRedirect: '/login',
  }),
  (req, res) => {
    const {username} = req.body;
    req.flash('success', `welcome back, ${username}!`);
    res.redirect('/campgrounds');
  }
);

router.get('/logout', (req, res, next) => {
  req.logout( (err) => {
    if(err) return next(err);
    req.flash('success', 'You have logged out');
    res.redirect('/campgrounds')
  });
})

module.exports = router;
