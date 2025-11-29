const Dispute = require('./dispute.model');
const Report = require('../reports/report.model');
const ModerationQueue = require('../moderation/moderation.model');
const { validateDispute } = require('./dispute.validation');
const { uploadEvidence } = require('../../shared/utils/fileHandler');
const config = require('../../core/config');

// File new dispute
exports.createDispute = async (req, res, next) => {
  try {
    // Validate input
    const { error, value } = validateDispute(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if report exists
    const report = await Report.findById(value.reportId);
    if (!report) {
      return res.status(404).json({ error: 'Reporte no encontrado' });
    }

    // Check if report is already disputed
    if (report.status === 'disputed') {
      return res.status(400).json({ 
        error: 'Este reporte ya tiene una disputa activa' 
      });
    }

    // Check if there's already a pending dispute for this report
    const existingDispute = await Dispute.findOne({
      reportId: value.reportId,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingDispute) {
      return res.status(400).json({ 
        error: 'Ya existe una disputa pendiente para este reporte' 
      });
    }

    // Process counter-evidence uploads
    let evidenceArray = [];
    if (value.counterEvidence && value.counterEvidence.length > 0) {
      evidenceArray = await uploadEvidence(value.counterEvidence);
    }

    // Calculate auto-review date
    const autoReviewDate = new Date();
    autoReviewDate.setHours(autoReviewDate.getHours() + config.disputeReviewHours);

    // Create dispute
    const dispute = new Dispute({
      reportId: value.reportId,
      disputerContact: {
        email: value.email,
        phone: value.phone
      },
      counterEvidence: evidenceArray,
      statement: value.statement,
      autoReviewDate
    });

    await dispute.save();

    // Update report status
    report.status = 'disputed';
    await report.save();

    // Add to moderation queue with high priority
    await ModerationQueue.create({
      itemId: dispute._id,
      itemType: 'dispute',
      autoFlags: [],
      manualReviewRequired: true,
      priority: 'high'
    });

    res.status(201).json({
      message: 'Disputa creada exitosamente',
      disputeId: dispute.disputeId,
      reviewDate: autoReviewDate
    });

  } catch (error) {
    next(error);
  }
};

// Get disputes for a report
exports.getDisputesByReport = async (req, res, next) => {
  try {
    const disputes = await Dispute.find({ reportId: req.params.reportId })
      .select('-disputerContact -__v')
      .sort({ createdAt: -1 })
      .lean();

    res.json(disputes);

  } catch (error) {
    next(error);
  }
};

// Get single dispute details
exports.getDisputeById = async (req, res, next) => {
  try {
    const dispute = await Dispute.findOne({ disputeId: req.params.id })
      .populate('reportId', 'reportId reportedName reportedLastName status')
      .select('-__v')
      .lean();

    if (!dispute) {
      return res.status(404).json({ error: 'Disputa no encontrada' });
    }

    res.json(dispute);

  } catch (error) {
    next(error);
  }
};

// Get disputes pending auto-review
exports.getPendingAutoReview = async (req, res, next) => {
  try {
    const now = new Date();
    
    const disputes = await Dispute.find({
      status: 'pending',
      autoReviewDate: { $lte: now }
    })
    .populate('reportId', 'reportId reportedName reportedLastName')
    .lean();

    res.json(disputes);

  } catch (error) {
    next(error);
  }
};
