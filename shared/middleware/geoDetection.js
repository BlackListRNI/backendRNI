const axios = require('axios');

// Middleware to detect country from IP
exports.detectCountry = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const cleanIp = ip.replace('::ffff:', '');
    
    // Default to Peru
    req.country = 'PE';
    
    // Skip detection for localhost
    if (cleanIp === '127.0.0.1' || cleanIp === 'localhost') {
      return next();
    }

    try {
      const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`, {
        timeout: 2000
      });
      
      if (response.data.country_code) {
        req.country = response.data.country_code;
        req.region = response.data.region;
        req.city = response.data.city;
      }
    } catch (error) {
      // Silently fail and use default
      console.log('Geo detection failed, using default country');
    }
    
    next();
  } catch (error) {
    next(error);
  }
};
