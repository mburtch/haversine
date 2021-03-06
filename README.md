# Haversine Module

## Installation
`npm install mburtch/haversine`

## Unit Tests
`npm test` or `make test`

## Usage
```
// load it
var haversine = require('haversine');

// points
var milan = { latitude: 45.465422, longitude: 9.1859240 };
var minsk = { latitude: 53.900000, longitude: 27.566667 };

// use it
var distance_in_km = haversine(milan, minsk);
var distance_in_ft = haversine(milan, minsk, { units:'ft' });
var distance_on_moon = haversine(milan, minsk, { radius:1737.4 }); // much less
var within_walking_distance = haversine(milan, minsk, { within:10 }); // false
var distance_rounded = haversine(milan, minsk, { precision:2 }); // 1000?
```
