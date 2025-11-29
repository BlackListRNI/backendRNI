const express = require('express');
const router = express.Router();
const disputeController = require('./dispute.controller');
const { rateLimiter } = require('../../shared/middleware/rateLimiter');

// Routes
router.post('/', rateLimiter, disputeController.createDispute);
router.get('/report/:reportId', disputeController.getDisputesByReport);
router.get('/pending-review', disputeController.getPendingAutoReview);
router.get('/:id', disputeController.getDisputeById);

module.exports = router;
