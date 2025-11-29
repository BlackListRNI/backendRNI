const mongoose = require('mongoose');
const config = require('./config');

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ MongoDB connected successfully');
    
    // Create indexes for performance
    await createIndexes();
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

const createIndexes = async () => {
  try {
    const Report = require('../modules/reports/report.model');
    const Dispute = require('../modules/disputes/dispute.model');
    const User = require('../modules/users/user.model');
    
    // Report indexes
    await Report.collection.createIndex({ country: 1, status: 1, createdAt: -1 });
    await Report.collection.createIndex({ reportedName: 1, reportedLastName: 1 });
    await Report.collection.createIndex({ verificationScore: -1 });
    await Report.collection.createIndex({ createdAt: -1 });
    
    // Dispute indexes
    await Dispute.collection.createIndex({ reportId: 1 });
    await Dispute.collection.createIndex({ status: 1, createdAt: -1 });
    
    // User indexes
    await User.collection.createIndex({ ipHash: 1 });
    await User.collection.createIndex({ deviceFingerprint: 1 });
    
    console.log('✅ Database indexes created');
  } catch (error) {
    console.error('⚠️  Index creation warning:', error.message);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB error:', err);
});

module.exports = connectDatabase;
