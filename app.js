const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const morgan = require('morgan');
const methodOverride = require('method-override');

const asyncErrorWrapper = require('./utils/AsyncErrorWrapper');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground.js');
const Review = require('./models/review.js');
const { campgroundSchema, reviewSchema } = require('./schemas');

mongoose.set('strictQuery', true); // included to suppress console warning when connecting to mongodb server
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}); //connecting to mongodb server

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const app = express();
app.use(morgan('tiny')); //console logs info on each request

app.engine('ejs', ejsMate); //telling express to use ejsMate for the ejs engine instead of the default one
app.set('view engine', 'ejs'); //sets the view engine to ejs and "view" is the folder where web pages are kept
app.set('views', path.join(__dirname, 'views')); //serves static files in the views folder

//needed for POST and PUT requests to parse body
app.use(express.urlencoded({ extended: true })); // recognizes the incoming request obj as strings or arrays
app.use(express.json()); //recognizes the incoming request obj as a JSON object and parses it
app.use(methodOverride('_method')); //allows for override of method type in front end form requests

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

app.get('/', (req, res) => {
  res.render('home');
});

app.get(
  '/campgrounds',
  asyncErrorWrapper(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

app.post(
  '/campgrounds',
  validateCampground,
  asyncErrorWrapper(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

app.get(
  '/campgrounds/:id',
  asyncErrorWrapper(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
  })
);

app.get(
  '/campgrounds/:id/edit',
  asyncErrorWrapper(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);

app.put(
  '/campgrounds/:id',
  validateCampground,
  asyncErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.delete(
  '/campgrounds/:id',
  asyncErrorWrapper(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  })
);

app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  asyncErrorWrapper(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404));
});

//default error handler
app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'Oh no, something went wrong!';
  res.status(statusCode).render('error', { err });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serving on PORT ${PORT}`);
});
