const express = require('express');
const router = express.Router({
  mergeParams: true,
});

const Campground = require('../models/campground.js');
const Review = require('../models/review.js');
const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');

router.post(
  '/',
  isLoggedIn,
  validateReview,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;

    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'New review successfully created');
    res.redirect(`/campgrounds/${id}`);
  })
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  asyncErrorWrapper(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {
      $pull: {
        reviews: reviewId,
      },
    });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Review successfully deleted');
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
