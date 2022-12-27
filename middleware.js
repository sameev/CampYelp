const Campground = require('./models/campground.js');
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
  if(!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash('error', 'You must be signed in to proceed');
    return res.redirect('/login');
  }
  next();
}

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);

  if (error) {
    const message = error.details
      .map((el) => {
        return el.message;
      })
      .join(',');
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to edit this campground');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.noCampground = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);

  if (!campground) {
    req.flash('error', 'Cannot find that campground');
    return res.redirect('/campgrounds');
  }
  next();
}

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);

  if (error) {
    console.log(error);
    const message = error.details
      .map((el) => {
        return el.message;
      })
      .join(',');
    throw new ExpressError(message, 400);
  } else {
    next();
  }
};