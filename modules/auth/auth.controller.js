const AuthUser = require('./auth.model');
const jwt = require('jsonwebtoken');
const config = require('../../core/config');
const { generateUserId } = require('../../shared/utils/security');

// Register new user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, deviceFingerprint } = req.body;

    // Check if user already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Generate userId
    const userId = generateUserId(req.ip, deviceFingerprint);

    // Create user
    const user = new AuthUser({
      name,
      email,
      password,
      userId,
      deviceFingerprint
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await AuthUser.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email o contraseña incorrectos' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      config.jwtSecret,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login exitoso',
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      token
    });

  } catch (error) {
    next(error);
  }
};

// Get user reports
exports.getUserReports = async (req, res, next) => {
  try {
    const Report = require('../reports/report.model');
    
    const reports = await Report.find({
      reporterIds: req.params.userId
    }).sort({ createdAt: -1 });

    res.json({ reports });

  } catch (error) {
    next(error);
  }
};

// Get user disputes
exports.getUserDisputes = async (req, res, next) => {
  try {
    const Dispute = require('../disputes/dispute.model');
    const AuthUser = require('./auth.model');
    
    const user = await AuthUser.findOne({ userId: req.params.userId });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const disputes = await Dispute.find({
      _id: { $in: user.disputesCreated }
    })
    .populate('reportId', 'reportedName reportedLastName')
    .sort({ createdAt: -1 });

    res.json({ disputes });

  } catch (error) {
    next(error);
  }
};
