const crypto = require('crypto');

// Middleware to hash IP addresses for privacy
exports.hashIp = (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const cleanIp = ip.replace('::ffff:', '');
    
    // Hash IP with salt for privacy
    const hash = crypto
      .createHash('sha256')
      .update(cleanIp + process.env.JWT_SECRET)
      .digest('hex');
    
    req.ipHash = hash;
    next();
  } catch (error) {
    next(error);
  }
};
