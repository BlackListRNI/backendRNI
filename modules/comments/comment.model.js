const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  vote: {
    type: String,
    enum: ['agree', 'disagree', 'neutral'],
    required: true
  },
  evidence: [{
    url: String,
    hash: String
  }],
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    userId: String,
    vote: String // 'up' or 'down'
  }]
}, {
  timestamps: true
});

commentSchema.index({ reportId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
