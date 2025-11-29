const crypto = require('crypto');
const Report = require('../../modules/reports/report.model');

// Generate anonymized user ID from IP and device fingerprint
exports.generateUserId = (ip, deviceFingerprint) => {
  const combined = `${ip}-${deviceFingerprint}`;
  return crypto
    .createHash('sha256')
    .update(combined + process.env.JWT_SECRET)
    .digest('hex')
    .substring(0, 16);
};

// Check for spam patterns
exports.checkSpamPatterns = async (report, reporterId) => {
  const flags = [];
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  // Check for rapid submissions
  const recentReports = await Report.countDocuments({
    reporterIds: reporterId,
    createdAt: { $gte: tenMinutesAgo }
  });

  if (recentReports > 2) {
    flags.push({
      type: 'rapid_submission',
      description: `${recentReports} reportes en menos de 10 minutos`,
      severity: 'high'
    });
  }

  // Check for duplicate names
  const duplicateNames = await Report.countDocuments({
    reportedName: report.reportedName,
    reportedLastName: report.reportedLastName,
    _id: { $ne: report._id }
  });

  if (duplicateNames > 0) {
    flags.push({
      type: 'duplicate_name',
      description: `Nombre duplicado encontrado en ${duplicateNames} reportes`,
      severity: 'medium'
    });
  }

  // Check for similar evidence (basic check - could be enhanced with perceptual hashing)
  if (report.evidence.length > 0) {
    const evidenceHashes = report.evidence.map(e => e.hash);
    const similarEvidence = await Report.countDocuments({
      'evidence.hash': { $in: evidenceHashes },
      _id: { $ne: report._id }
    });

    if (similarEvidence > 0) {
      flags.push({
        type: 'duplicate_evidence',
        description: `Evidencia similar encontrada en ${similarEvidence} reportes`,
        severity: 'high'
      });
    }
  }

  return flags;
};

// Hash file content for duplicate detection
exports.hashFile = (buffer) => {
  return crypto
    .createHash('sha256')
    .update(buffer)
    .digest('hex');
};
