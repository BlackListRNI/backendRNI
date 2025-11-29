const ModerationQueue = require('./moderation.model');
const Report = require('../reports/report.model');
const Dispute = require('../disputes/dispute.model');

// Flag content for moderation
exports.flagContent = async (req, res, next) => {
  try {
    const { itemId, itemType, reason } = req.body;

    if (!itemId || !itemType || !reason) {
      return res.status(400).json({ 
        error: 'itemId, itemType y reason son requeridos' 
      });
    }

    // Check if item exists
    const Model = itemType === 'report' ? Report : Dispute;
    const item = await Model.findById(itemId);

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Check if already in moderation queue
    let queueItem = await ModerationQueue.findOne({ 
      itemId, 
      itemType: itemType === 'report' ? 'Report' : 'Dispute' 
    });

    if (queueItem) {
      // Add flag to existing queue item
      queueItem.autoFlags.push({
        type: 'suspicious_pattern',
        description: reason,
        severity: 'medium'
      });
      queueItem.manualReviewRequired = true;
      await queueItem.save();
    } else {
      // Create new queue item
      queueItem = await ModerationQueue.create({
        itemId,
        itemType: itemType === 'report' ? 'Report' : 'Dispute',
        autoFlags: [{
          type: 'suspicious_pattern',
          description: reason,
          severity: 'medium'
        }],
        manualReviewRequired: true,
        priority: 'medium'
      });
    }

    res.json({
      message: 'Contenido marcado para revisión',
      queueId: queueItem._id
    });

  } catch (error) {
    next(error);
  }
};

// Get moderation queue
exports.getModerationQueue = async (req, res, next) => {
  try {
    const { 
      status = 'pending', 
      priority,
      page = 1,
      limit = 20 
    } = req.query;

    const query = { status };
    if (priority) query.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const items = await ModerationQueue.find(query)
      .populate('itemId')
      .sort({ priority: -1, createdAt: 1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ModerationQueue.countDocuments(query);

    res.json({
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    next(error);
  }
};

// Get single moderation item
exports.getModerationItem = async (req, res, next) => {
  try {
    const item = await ModerationQueue.findById(req.params.id)
      .populate('itemId')
      .lean();

    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    res.json(item);

  } catch (error) {
    next(error);
  }
};

// Moderate item (approve/reject)
exports.moderateItem = async (req, res, next) => {
  try {
    const { action, notes, moderatorId } = req.body;

    if (!action || !['approve', 'reject', 'needs_info'].includes(action)) {
      return res.status(400).json({ 
        error: 'Acción inválida. Usa: approve, reject, needs_info' 
      });
    }

    const queueItem = await ModerationQueue.findById(req.params.id);

    if (!queueItem) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Update queue item
    queueItem.status = action === 'approve' ? 'approved' : 
                       action === 'reject' ? 'rejected' : 'needs_info';
    queueItem.reviewedBy = moderatorId || 'admin';
    queueItem.reviewNotes = notes;
    queueItem.reviewedAt = new Date();
    await queueItem.save();

    // Update original item
    const Model = queueItem.itemType === 'Report' ? Report : Dispute;
    const item = await Model.findById(queueItem.itemId);

    if (item) {
      if (action === 'approve') {
        if (queueItem.itemType === 'Report') {
          // Keep current status or set to pending if was flagged
          if (item.status === 'rejected') {
            item.status = 'pending';
          }
        } else {
          // Dispute approved
          item.status = 'accepted';
          // Update related report
          const report = await Report.findById(item.reportId);
          if (report) {
            report.status = 'rejected';
            await report.save();
          }
        }
      } else if (action === 'reject') {
        if (queueItem.itemType === 'Report') {
          item.status = 'rejected';
        } else {
          item.status = 'rejected';
          // Restore report status
          const report = await Report.findById(item.reportId);
          if (report && report.status === 'disputed') {
            report.status = item.verificationScore >= 3 ? 'verified' : 'pending';
            await report.save();
          }
        }
      }
      
      if (queueItem.itemType === 'Dispute') {
        item.moderationNotes = notes;
      }
      
      await item.save();
    }

    res.json({
      message: 'Moderación completada',
      status: queueItem.status
    });

  } catch (error) {
    next(error);
  }
};
