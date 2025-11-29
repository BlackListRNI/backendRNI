const User = require('./user.model');
const { generateUserId } = require('../../shared/utils/security');

// Get user statistics
exports.getUserStats = async (req, res, next) => {
  try {
    const { deviceFingerprint } = req.query;
    
    if (!deviceFingerprint) {
      return res.status(400).json({ error: 'Device fingerprint requerido' });
    }

    const userId = generateUserId(req.ip, deviceFingerprint);
    const user = await User.findOne({ userId });

    if (!user) {
      return res.json({
        reportsSubmitted: 0,
        disputesFiled: 0,
        trustScore: 1.0,
        accountAge: 0
      });
    }

    // Update trust score
    await user.calculateTrustScore();
    await user.save();

    res.json({
      reportsSubmitted: user.reportsSubmitted.length,
      disputesFiled: user.disputesFiled.length,
      trustScore: user.trustScore,
      accountAge: user.accountAge
    });

  } catch (error) {
    next(error);
  }
};

// Get user by ID
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findOne({ userId: req.params.userId })
      .select('-ipHash -deviceFingerprint -__v')
      .lean();

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);

  } catch (error) {
    next(error);
  }
};
