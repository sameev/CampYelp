const express = require('express');
const router = express.Router();

const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const {
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
  noCampground,
} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router.get('/', asyncErrorWrapper(campgrounds.index));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  asyncErrorWrapper(campgrounds.createCampground)
);

router.get('/:id', noCampground, asyncErrorWrapper(campgrounds.showCampground));

router.get(
  '/:id/edit',
  isLoggedIn,
  noCampground,
  isCampgroundAuthor,
  asyncErrorWrapper(campgrounds.renderEditForm)
);

router.put(
  '/:id',
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
  asyncErrorWrapper(campgrounds.updateCampground)
);

router.delete(
  '/:id',
  isLoggedIn,
  isCampgroundAuthor,
  asyncErrorWrapper(campgrounds.deleteCampground)
);

module.exports = router;
