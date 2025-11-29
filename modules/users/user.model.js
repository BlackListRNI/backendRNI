const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  ipHash: {
    type: String,
    required: true
  },
  deviceFingerprint: {
    type: String,
    required: true
  },
  country: {
    type: String,
    uppercase: true,
    length: 2
  },
  reportsSubmitted: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  disputesFiled: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  }],
  trustScore: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 10
  },
  accountAge: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
userSchema.index({ ipHash: 1 });
userSchema.index({ deviceFingerprint: 1 });
userSchema.index({ userId: 1 });

// Calculate trust score
userSchema.methods.calculateTrustScore = async function() {
  const Report = require('../reports/report.model');
  
  const totalReports = this.reportsSubmitted.length;
  if (totalReports === 0) {
    this.trustScore = 1.0;
    return this.trustScore;
  }

  // Get verified reports
  const verifiedReports = await Report.countDocuments({
    _id: { $in: this.reportsSubmitted },
    status: 'verified'
  });

  // Calculate account age in days
  const ageInDays = Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
  this.accountAge = ageInDays;

  // Trust score formula: (verified/total) * age_weight
  const successRate = verifiedReports / totalReports;
  const ageWeight = Math.min(1 + (ageInDays / 365), 2); // Max 2x multiplier after 1 year
  
  this.trustScore = Math.min(successRate * ageWeight * 10, 10);
  
  return this.trustScore;
};

module.exports = mongoose.model('User', userSchema);
