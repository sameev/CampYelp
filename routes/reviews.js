const express = require('express');
const router = express.Router( {
  mergeParams: true
});

const Campground = require('../models/campground.js');
const Review = require('../models/review.js');
const { reviewSchema } = require('../schemas');
const ExpressError = require('../utils/ExpressError');
const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');

const validateReview = (req, res, next) => {
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

router.post(
  '/',
  validateReview,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  '/:reviewId',
  asyncErrorWrapper(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {
      $pull: {
        reviews: reviewId,
      },
    });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
