require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3070,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lista-negra',
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3050',
  jwtSecret: process.env.JWT_SECRET || 'default-secret-change-me',
  
  // Rate limiting
  maxReportsPerDay: parseInt(process.env.MAX_REPORTS_PER_DAY) || 3,
  rateLimitWindowMs: 24 * 60 * 60 * 1000, // 24 hours
  
  // Verification
  verificationThreshold: parseInt(process.env.VERIFICATION_THRESHOLD) || 3,
  
  // Disputes
  disputeReviewHours: parseInt(process.env.DISPUTE_REVIEW_HOURS) || 48,
  
  // Geolocation
  ipapiKey: process.env.IPAPI_KEY || 'free',
  
  // File upload
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/jpg'],
  
  // Pagination
  defaultPageSize: 20,
  maxPageSize: 100
};
