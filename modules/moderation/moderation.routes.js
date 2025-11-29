const express = require('express');
const router = express.Router();
const moderationController = require('./moderation.controller');

// Routes
router.post('/flag', moderationController.flagContent);
router.get('/queue', moderationController.getModerationQueue);
router.get('/:id', moderationController.getModerationItem);
router.put('/:id', moderationController.moderateItem);

module.exports = router;
