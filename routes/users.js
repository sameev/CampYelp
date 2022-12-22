const express = require('express');
const router = express.Router();
const asyncErrorWrapper = require('../utils/AsyncErrorWrapper')

const User = require('../models/user');

router.get('/register', (req, res) => {
  res.render('users/register')
})

router.post('/register', asyncErrorWrapper(async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ email, username })
    const registeredUser = await User.register(user, password);
    console.log(registeredUser);
    req.flash('success', `Welcome to CampersYelp, ${user.username}!`);
    res.redirect('/campgrounds')
  } catch (e) {
    req.flash('error', e.message);
    res.redirect('/register')
  }
}))

module.exports = router;