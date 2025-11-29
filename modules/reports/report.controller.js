const Report = require('./report.model');
const User = require('../users/user.model');
const ModerationQueue = require('../moderation/moderation.model');
const { validateReport } = require('./report.validation');
const { generateUserId, checkSpamPatterns } = require('../../shared/utils/security');
const { uploadEvidence } = require('../../shared/utils/fileHandler');
const config = require('../../core/config');

// Submit new report
exports.createReport = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateReport(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Generate reporter ID from IP and device fingerprint
    const reporterId = generateUserId(req.ip, req.body.deviceFingerprint);
    
    // Check rate limiting
    const user = await User.findOne({ 
      $or: [
        { ipHash: req.ipHash },
        { deviceFingerprint: req.body.deviceFingerprint }
      ]
    });

    if (user) {
      const reportsToday = await Report.countDocuments({
        reporterIds: reporterId,
        createdAt: { $gte: new Date(Date.now() - config.rateLimitWindowMs) }
      });

      if (reportsToday >= config.maxReportsPerDay) {
        return res.status(429).json({ 
          error: 'Límite de reportes diarios alcanzado. Intenta mañana.' 
        });
      }
    }

    // Process evidence uploads
    let evidenceArray = [];
    if (req.body.evidence && req.body.evidence.length > 0) {
      evidenceArray = await uploadEvidence(req.body.evidence);
    }

    // Create report
    const report = new Report({
      reportedName: value.reportedName,
      reportedLastName: value.reportedLastName,
      department: value.department,
      district: value.district,
      age: value.age,
      occupation: value.occupation,
      reporterIds: [reporterId],
      evidence: evidenceArray,
      country: req.country || 'PE',
      region: value.region,
      city: value.city,
      additionalInfo: value.additionalInfo
    });

    await report.save();

    // Update or create user record
    if (user) {
      user.reportsSubmitted.push(report._id);
      await user.save();
    } else {
      await User.create({
        userId: reporterId,
        ipHash: req.ipHash,
        deviceFingerprint: req.body.deviceFingerprint,
        country: req.country || 'PE',
        reportsSubmitted: [report._id]
      });
    }

    // Check for spam patterns and add to moderation queue if needed
    const spamFlags = await checkSpamPatterns(report, reporterId);
    if (spamFlags.length > 0) {
      await ModerationQueue.create({
        itemId: report._id,
        itemType: 'report',
        autoFlags: spamFlags,
        manualReviewRequired: true,
        priority: spamFlags.length > 2 ? 'high' : 'medium'
      });
    }

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      reportId: report.reportId,
      status: report.status
    });

  } catch (error) {
    next(error);
  }
};

// Get reports with filters and pagination
exports.getReports = async (req, res, next) => {
  try {
    const {
      country = 'PE',
      status,
      department,
      page = 1,
      limit = config.defaultPageSize,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { country: country.toUpperCase() };
    if (status) query.status = status;
    if (department) query.department = department;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = Math.min(parseInt(limit), config.maxPageSize);

    // Execute query
    const reports = await Report.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(limitNum)
      .select('-reporterIds -__v')
      .lean();

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      pagination: {
        page: parseInt(page),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get single report details
exports.getReportById = async (req, res, next) => {
  try {
    // Try by MongoDB _id first, then by reportId
    let report = await Report.findById(req.params.id).select('-reporterIds -__v').lean();
    
    if (!report) {
      report = await Report.findOne({ reportId: req.params.id }).select('-reporterIds -__v').lean();
    }

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    res.json(report);

  } catch (error) {
    next(error);
  }
};

// Add verification to existing report
exports.verifyReport = async (req, res, next) => {
  try {
    // Try by MongoDB _id first, then by reportId
    let report = await Report.findById(req.params.id);
    
    if (!report) {
      report = await Report.findOne({ reportId: req.params.id });
    }

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Generate reporter ID
    const reporterId = generateUserId(req.ip, req.body.deviceFingerprint);

    // Check if already verified by this user
    if (report.reporterIds.includes(reporterId)) {
      return res.status(400).json({ 
        error: 'Ya has verificado este reporte anteriormente' 
      });
    }

    // Add verification
    await report.addVerification(reporterId);

    // Update user record
    await User.findOneAndUpdate(
      { userId: reporterId },
      { $push: { reportsSubmitted: report._id } }
    );

    res.json({
      message: 'Verificación agregada exitosamente',
      verificationScore: report.verificationScore,
      status: report.status
    });

  } catch (error) {
    next(error);
  }
};

// Get statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const { country = 'PE' } = req.query;

    const stats = await Report.aggregate([
      { $match: { country: country.toUpperCase() } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalReports = await Report.countDocuments({ country: country.toUpperCase() });
    const verifiedReports = await Report.countDocuments({ 
      country: country.toUpperCase(), 
      status: 'verified' 
    });

    res.json({
      total: totalReports,
      verified: verifiedReports,
      byStatus: stats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });

  } catch (error) {
    next(error);
  }
};


// Delete report
exports.deleteReport = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({
      message: 'Reporte eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};
