const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground.js');

mongoose.set('strictQuery', true); // included to suppress console warning when connecting to mongodb server
//connecting to mongodb server
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected");
})

const app = express();
const PORT = 3000;

//sets the view engine to ejs and "view" is the folder where web pages are kept
app.set('view engine', 'ejs') 
app.set('views', path.join(__dirname, 'views')); //

//needed for POST and PUT requests to parse body
app.use(express.urlencoded()); // recognizes the incoming request obj as strings or arrays
app.use(express.json()); //recognizes the incoming request obj as a JSON object and parses it
app.use(methodOverride('_method'));


app.get('/', (req, res) => {
  res.render('home');
})


app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index', { campgrounds })
})

app.post('/campgrounds', async (req, res) => {
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
})


app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
})


app.get('/campgrounds/:id', async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render('campgrounds/show', { campground })
})

app.get('/campgrounds/:id/edit', async (req, res) => {
  const campground = await Campground.findById(req.params.id)
  res.render('campgrounds/edit', { campground })
})

app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
  res.redirect(`/campgrounds/${campground._id}`);
})

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
})


app.listen(PORT, () => {
  console.log(`Serving on PORT ${PORT}`)
})