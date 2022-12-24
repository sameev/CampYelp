const express = require('express');
const router = express.Router();

const Campground = require('../models/campground.js');
const { isLoggedIn, isAuthor, validateCampground, noCampground } = require('../middleware');
const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');

router.get(
  '/',
  asyncErrorWrapper(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

router.get('/new', isLoggedIn, (req, res) => {
  res.render('campgrounds/new');
});

router.post(
  '/',
  isLoggedIn,
  validateCampground,
  asyncErrorWrapper(async (req, res) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', `${campground.title} was successfully created`);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.get(
  '/:id',
  noCampground,
  asyncErrorWrapper(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate('reviews')
      .populate('author');

    res.render('campgrounds/show', { campground });
  })
);

//refactor to update middleware so that trying to edit a non-existent campground response is appropriate
router.get(
  '/:id/edit',
  isLoggedIn,
  noCampground,
  isAuthor,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    res.render('campgrounds/edit', { campground });
  })
);

router.put(
  '/:id',
  isLoggedIn,
  isAuthor,
  validateCampground,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', `${campground.title} was successfully updated`);
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  '/:id',
  isLoggedIn,
  isAuthor,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    req.flash('success', `${campground.title} was successfully deleted`);
    res.redirect('/campgrounds');
  })
);

module.exports = router;
