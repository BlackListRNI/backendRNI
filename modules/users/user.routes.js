const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authController = require('../auth/auth.controller');

// Routes
router.get('/stats', userController.getUserStats);
router.get('/:userId', userController.getUserById);
router.get('/:userId/reports', authController.getUserReports);
router.get('/:userId/disputes', authController.getUserDisputes);

module.exports = router;
