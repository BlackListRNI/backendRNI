const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const authUserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
    unique: true
  },
  deviceFingerprint: {
    type: String,
    required: true
  },
  reportsCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report'
  }],
  disputesCreated: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dispute'
  }]
}, {
  timestamps: true
});

// Hash password before saving
authUserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
authUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Index for efficient queries
authUserSchema.index({ email: 1 });
authUserSchema.index({ userId: 1 });

module.exports = mongoose.model('AuthUser', authUserSchema);
