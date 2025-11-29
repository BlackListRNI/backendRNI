const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportId: {
    type: String,
    required: true,
    unique: true,
    default: () => `RPT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  reportedName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  reportedLastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  district: {
    type: String,
    required: true,
    trim: true
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 120
  },
  occupation: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  reporterIds: [{
    type: String,
    required: true
  }],
  evidence: [{
    url: String,
    hash: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'verified', 'disputed', 'rejected'],
    default: 'pending'
  },
  verificationScore: {
    type: Number,
    default: 1,
    min: 0
  },
  country: {
    type: String,
    required: true,
    uppercase: true,
    length: 2
  },
  region: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  additionalInfo: {
    type: String,
    maxlength: 2000
  },
  communityStatus: {
    type: String,
    default: 'Pendiente'
  },
  agreeCount: {
    type: Number,
    default: 0
  },
  disagreeCount: {
    type: Number,
    default: 0
  },
  hasSTD: {
    type: Boolean,
    default: false
  },
  stdInfo: {
    type: String,
    maxlength: 500
  },
  isTreated: {
    type: Boolean,
    default: false
  },
  relationshipPeriod: {
    startDate: String,
    endDate: String
  },
  anecdotes: {
    type: String,
    maxlength: 2000
  }
}, {
  timestamps: true
});

// Index for efficient queries
reportSchema.index({ country: 1, status: 1, createdAt: -1 });
reportSchema.index({ reportedName: 1, reportedLastName: 1 });
reportSchema.index({ verificationScore: -1 });

// Virtual for verification status
reportSchema.virtual('isVerified').get(function() {
  return this.verificationScore >= 3;
});

// Method to add verification from new reporter
reportSchema.methods.addVerification = function(reporterId) {
  if (!this.reporterIds.includes(reporterId)) {
    this.reporterIds.push(reporterId);
    this.verificationScore = this.reporterIds.length;
    
    // Auto-verify if threshold reached
    const config = require('../../core/config');
    if (this.verificationScore >= config.verificationThreshold) {
      this.status = 'verified';
    }
  }
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);
