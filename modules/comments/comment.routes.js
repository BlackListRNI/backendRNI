const express = require('express');
const router = express.Router();
const commentController = require('./comment.controller');

router.get('/:reportId', commentController.getComments);
router.post('/:reportId', commentController.createComment);
router.put('/:id/vote', commentController.voteComment);

module.exports = router;
