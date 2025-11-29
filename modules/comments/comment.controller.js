const Comment = require('./comment.model');
const Report = require('../reports/report.model');

// Get comments for a report
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({ reportId: req.params.reportId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ comments });
  } catch (error) {
    next(error);
  }
};

// Create comment
exports.createComment = async (req, res, next) => {
  try {
    const { content, vote, evidence, userId, userName } = req.body;

    const comment = new Comment({
      reportId: req.params.reportId,
      userId,
      userName,
      content,
      vote,
      evidence: evidence || []
    });

    await comment.save();

    // Update report vote counts
    await updateReportStatus(req.params.reportId);

    res.status(201).json({
      message: 'Comentario agregado',
      comment
    });
  } catch (error) {
    next(error);
  }
};

// Vote on comment
exports.voteComment = async (req, res, next) => {
  try {
    const { userId, vote } = req.body; // vote: 'up' or 'down'
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comentario no encontrado' });
    }

    // Check if already voted
    const existingVote = comment.votedBy.find(v => v.userId === userId);

    if (existingVote) {
      if (existingVote.vote === vote) {
        return res.status(400).json({ error: 'Ya votaste este comentario' });
      }
      // Change vote
      if (existingVote.vote === 'up') {
        comment.upvotes--;
        comment.downvotes++;
      } else {
        comment.downvotes--;
        comment.upvotes++;
      }
      existingVote.vote = vote;
    } else {
      // New vote
      if (vote === 'up') {
        comment.upvotes++;
      } else {
        comment.downvotes++;
      }
      comment.votedBy.push({ userId, vote });
    }

    await comment.save();

    res.json({
      upvotes: comment.upvotes,
      downvotes: comment.downvotes
    });
  } catch (error) {
    next(error);
  }
};

// Update report status based on votes
async function updateReportStatus(reportId) {
  const comments = await Comment.find({ reportId });
  
  const agree = comments.filter(c => c.vote === 'agree').length;
  const disagree = comments.filter(c => c.vote === 'disagree').length;
  const total = agree + disagree;

  if (total === 0) return;

  const agreePercent = (agree / total) * 100;

  let status;
  if (agreePercent >= 70) {
    status = 'Verificado Mayoritariamente';
  } else if (agreePercent <= 30) {
    status = 'Mayoritariamente en Desacuerdo';
  } else {
    status = 'Opiniones Variadas';
  }

  await Report.findByIdAndUpdate(reportId, { 
    communityStatus: status,
    agreeCount: agree,
    disagreeCount: disagree
  });
}

module.exports.updateReportStatus = updateReportStatus;
