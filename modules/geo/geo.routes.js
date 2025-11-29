const express = require('express');
const router = express.Router();
const geoController = require('./geo.controller');

// Routes
router.get('/detect', geoController.detectCountry);
router.get('/countries', geoController.getAvailableCountries);

module.exports = router;
