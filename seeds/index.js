if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');

const Campground = require('../models/campground.js');

const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken =
  'pk.eyJ1IjoiZWVtYXMxOTkxIiwiYSI6ImNsY2I5Z3luODM5eHUzeGxreDRzaGRoNTQifQ.J1IGOdc4dyWLUWxhiaC6Hg';
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';

mongoose.set('strictQuery', true); // included to suppress warning
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Database connected');
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});

  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const location = `${cities[random1000].city}, ${cities[random1000].state}`;

    const geoData = await geocoder
      .forwardGeocode({
        query: location,
        limit: 1,
      })
      .send();

    const camp = new Campground({
      author: '63b4b4a3a1872234cd73f5b0',
      // dev: '63a6177809320f7e0c526d94',
      // prod: '63b4b4a3a1872234cd73f5b0',
      location,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: 'https://res.cloudinary.com/dgbjjb2cw/image/upload/v1672275443/yelpCamp/q9m7xejhu5lzsz0jm3kt.jpg',
          filename: 'yelpCamp/q9m7xejhu5lzsz0jm3kt',
        },
        {
          url: 'https://res.cloudinary.com/dgbjjb2cw/image/upload/v1672275443/yelpCamp/blalsrm8gsr4eoqvcix8.jpg',
          filename: 'yelpCamp/blalsrm8gsr4eoqvcix8',
        },
        {
          url: 'https://res.cloudinary.com/dgbjjb2cw/image/upload/v1672275443/yelpCamp/mddbdr9dvkrel5xn6k6p.jpg',
          filename: 'yelpCamp/mddbdr9dvkrel5xn6k6p',
        },
      ],
      description:
        'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus, illum? Explicabo totam nulla, laudantium dolores aperiam, ipsum aliquid accusantium quaerat ex dolorum impedit exercitationem minima deserunt dignissimos eveniet iure nostrum!',
      price,
      geometry: geoData.body.features[0].geometry,
    });

    await camp.save();
  }
};

seedDB().then(() => {
  console.log('Database Closing...');
  mongoose.connection.close();
});
