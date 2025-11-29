const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  disputeId: {
    type: String,
    required: true,
    unique: true,
    default: () => `DSP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: true
  },
  disputerContact: {
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  counterEvidence: [{
    url: String,
    hash: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  statement: {
    type: String,
    required: true,
    maxlength: 1000
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'accepted', 'rejected'],
    default: 'pending'
  },
  moderationNotes: {
    type: String,
    maxlength: 2000
  },
  reviewedBy: {
    type: String
  },
  reviewedAt: {
    type: Date
  },
  autoReviewDate: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
disputeSchema.index({ reportId: 1 });
disputeSchema.index({ status: 1, createdAt: -1 });
disputeSchema.index({ autoReviewDate: 1 });

module.exports = mongoose.model('Dispute', disputeSchema);
