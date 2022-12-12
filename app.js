const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Campground = require('./models/campground.js')

mongoose.set('strictQuery', true); // included to suppress warning
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


app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
  res.render('home');
})

app.get('/campgrounds', async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render('campgrounds/index')
})

app.listen(PORT, () => {
  console.log(`Serving on PORT ${PORT}`)
})