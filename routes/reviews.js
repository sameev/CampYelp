const express = require('express');
const router = express.Router({
  mergeParams: true,
});

const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const reviews = require('../controllers/reviews')

router.post(
  '/',
  isLoggedIn,
  validateReview,
  asyncErrorWrapper(reviews.createReview)
);

router.delete(
  '/:reviewId',
  isLoggedIn,
  isReviewAuthor,
  asyncErrorWrapper(reviews.deleteReview)
);

module.exports = router;
