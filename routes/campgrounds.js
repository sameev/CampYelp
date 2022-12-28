const express = require('express');
const router = express.Router();

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');
const {
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
  noCampground,
} = require('../middleware');
const campgrounds = require('../controllers/campgrounds');

router
  .route('/')
  .get(asyncErrorWrapper(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array('image'),
    validateCampground,
    asyncErrorWrapper(campgrounds.createCampground)
  );

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
  .route('/:id')
  .get(noCampground, asyncErrorWrapper(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isCampgroundAuthor,
    validateCampground,
    asyncErrorWrapper(campgrounds.updateCampground)
  )
  .delete(
    isLoggedIn,
    isCampgroundAuthor,
    asyncErrorWrapper(campgrounds.deleteCampground)
  );

router.get(
  '/:id/edit',
  isLoggedIn,
  noCampground,
  isCampgroundAuthor,
  asyncErrorWrapper(campgrounds.renderEditForm)
);

module.exports = router;
