const express = require('express');
const router = express.Router();

const Campground = require('../models/campground.js');
const { campgroundSchema } = require('../schemas');
const { isLoggedIn } = require('../middleware');
const ExpressError = require('../utils/ExpressError');
const asyncErrorWrapper = require('../utils/AsyncErrorWrapper');

const validateCampground = (req, res, next) => {
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
  asyncErrorWrapper(async (req, res) => {
    const campground = await Campground.findById(req.params.id)
      .populate('reviews')
      .populate('author');

    if (!campground) {
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
  })
);

router.get(
  '/:id/edit',
  isLoggedIn,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params
    const campground = await Campground.findById(id);

    if (!campground) {
      req.flash('error', 'Cannot find that campground');
      res.redirect('/campgrounds');
    }

    if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to edit this campground');
      return res.redirect(`/campgrounds/${id}`);
    }

    res.render('campgrounds/edit', { campground });
  })
);

router.put(
  '/:id',
  isLoggedIn,
  validateCampground,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to edit this campground');
      return res.redirect(`/campgrounds/${id}`);
    }
    const camp = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    req.flash('success', `${camp.title} was successfully updated`);
    res.redirect(`/campgrounds/${camp._id}`);
  })
);

router.delete(
  '/:id',
  isLoggedIn,
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to delete this campground');
      return res.redirect(`/campgrounds/${id}`);
    }
    const camp = await Campground.findByIdAndDelete(id);
    req.flash('success', `${camp.title} was successfully deleted`);
    res.redirect('/campgrounds');
  })
);

module.exports = router;
