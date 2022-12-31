mapboxgl.accessToken = mapToken; // eslint-disable-line
const map = new mapboxgl.Map({ // eslint-disable-line
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: [-74.5, 40], // starting position [lng, lat]
  zoom: 4, // starting zoom
});
