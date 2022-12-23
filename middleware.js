module.exports.isLoggedIn = (req, res, next) => {
  console.log("req.user is...", req.user);
  if(!req.isAuthenticated()) {
    req.flash('error', 'You must be signed in to proceed');
    return res.redirect('/login');
  }
  next();
}