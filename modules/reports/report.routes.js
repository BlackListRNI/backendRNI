const express = require('express');
const router = express.Router();
const reportController = require('./report.controller');
const { rateLimiter } = require('../../shared/middleware/rateLimiter');
const { detectCountry } = require('../../shared/middleware/geoDetection');
const { hashIp } = require('../../shared/middleware/ipHasher');

// Apply middleware
router.use(detectCountry);
router.use(hashIp);

// Routes
router.post('/', rateLimiter, reportController.createReport);
router.get('/', reportController.getReports);
router.get('/statistics', reportController.getStatistics);
router.get('/:id', reportController.getReportById);
router.put('/:id/verify', rateLimiter, reportController.verifyReport);
router.delete('/:id', reportController.deleteReport);

module.exports = router;
