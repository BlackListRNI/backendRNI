const mongoose = require('mongoose');

const moderationQueueSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  itemType: {
    type: String,
    required: true,
    enum: ['Report', 'Dispute']
  },
  autoFlags: [{
    type: {
      type: String,
      enum: ['rapid_submission', 'duplicate_evidence', 'duplicate_name', 'suspicious_pattern']
    },
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high']
    }
  }],
  manualReviewRequired: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'approved', 'rejected', 'needs_info'],
    default: 'pending'
  },
  reviewedBy: {
    type: String
  },
  reviewNotes: {
    type: String,
    maxlength: 2000
  },
  reviewedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for efficient queries
moderationQueueSchema.index({ status: 1, priority: -1, createdAt: 1 });
moderationQueueSchema.index({ itemId: 1, itemType: 1 });

module.exports = mongoose.model('ModerationQueue', moderationQueueSchema);
