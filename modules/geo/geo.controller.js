const axios = require('axios');
const config = require('../../core/config');

// Detect country from IP
exports.detectCountry = async (req, res, next) => {
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    
    // Remove IPv6 prefix if present
    const cleanIp = ip.replace('::ffff:', '');
    
    // Skip detection for localhost
    if (cleanIp === '127.0.0.1' || cleanIp === 'localhost') {
      return res.json({
        country: 'PE',
        countryName: 'Peru',
        region: 'Lima',
        city: 'Lima'
      });
    }

    try {
      const response = await axios.get(`https://ipapi.co/${cleanIp}/json/`, {
        timeout: 3000
      });

      res.json({
        country: response.data.country_code || 'PE',
        countryName: response.data.country_name || 'Peru',
        region: response.data.region || '',
        city: response.data.city || ''
      });
    } catch (apiError) {
      // Fallback to Peru if API fails
      res.json({
        country: 'PE',
        countryName: 'Peru',
        region: '',
        city: ''
      });
    }

  } catch (error) {
    next(error);
  }
};

// Get available countries
exports.getAvailableCountries = async (req, res, next) => {
  try {
    const Report = require('../reports/report.model');
    
    const countries = await Report.distinct('country');
    
    const countryNames = {
      'PE': 'Perú',
      'CO': 'Colombia',
      'MX': 'México',
      'AR': 'Argentina',
      'CL': 'Chile',
      'EC': 'Ecuador',
      'VE': 'Venezuela',
      'BO': 'Bolivia',
      'PY': 'Paraguay',
      'UY': 'Uruguay'
    };

    const result = countries.map(code => ({
      code,
      name: countryNames[code] || code
    }));

    res.json(result);

  } catch (error) {
    next(error);
  }
};
