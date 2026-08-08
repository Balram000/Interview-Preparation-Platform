const Interview = require('../models/Interview');
const Performance = require('../models/Performance');
const ml = require('../services/mlService');
const ai = require('../services/aiProvider');
const { generateStudyPlan } = require('../services/aiService');

/**
 * Completed interview scores, oldest first, used as training data.
 */
async function getScoreHistory(userId) {
  const interviews = await Interview.find({ user: userId, status: 'completed' })
    .select('totalScore maxScore role difficulty completedAt')
    .sort({ completedAt: 1 })
    .lean();

  return interviews.map((interview) => ({
    role: interview.role,
    difficulty: interview.difficulty,
    score: interview.maxScore ? Math.round((interview.totalScore / interview.maxScore) * 100) : interview.totalScore
  }));
}

exports.scoreAnswer = async (req, res) => {
  try {
    const { answer, referenceAnswer, expectedKeywords } = req.body;

    if (!answer) {
      return res.status(400).json({ success: false, message: 'answer is required' });
    }

    res.status(200).json({
      success: true,
      evaluation: ml.scoreAnswer(answer, referenceAnswer || '', Array.isArray(expectedKeywords) ? expectedKeywords : [])
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.matchResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: 'resumeText is required' });
    }

    res.status(200).json({
      success: true,
      analysis: ml.analyzeResumeFit(resumeText, targetRole || req.user.targetRole)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Trains a readiness model on the user's own completed interviews and predicts
 * their current interview readiness.
 */
exports.getReadiness = async (req, res) => {
  try {
    const history = await getScoreHistory(req.user.id);
    const scores = history.map((entry) => entry.score);
    const summary = ml.summarizeHistory(scores);

    const samples = scores.map((score, index) => ({
      ...ml.summarizeHistory(scores.slice(0, index + 1)),
      totalInterviews: index + 1,
      label: score >= ml.PASS_MARK
    }));

    const model = ml.trainReadinessModel(samples);
    const prediction = ml.predictReadiness(model, { ...summary, totalInterviews: scores.length });

    res.status(200).json({
      success: true,
      readiness: {
        ...prediction,
        ...summary,
        totalInterviews: scores.length,
        nextDifficulty: ml.recommendDifficulty(scores, history[history.length - 1]?.difficulty)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Clusters recorded topic scores into weak/strong groups and turns the weak
 * cluster into concrete practice recommendations.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const performances = await Performance.find({ user: req.user.id }).lean();
    const topics = performances.flatMap((performance) => [
      ...(performance.weakTopics || []),
      ...(performance.strongTopics || [])
    ]);

    const clusters = ml.clusterTopics(topics);
    const history = await getScoreHistory(req.user.id);
    const scores = history.map((entry) => entry.score);
    const targetRole = req.user.targetRole || 'Full Stack Developer';
    const requiredSkills = ml.ROLE_SKILL_MATRIX[targetRole] || [];
    const practisedTopics = new Set(topics.map((topic) => String(topic.topic || '').toLowerCase()));

    res.status(200).json({
      success: true,
      recommendations: {
        targetRole,
        focusTopics: clusters.weak.slice(0, 5),
        strengths: clusters.strong.slice(0, 5),
        boundary: clusters.boundary,
        untouchedSkills: requiredSkills.filter((skill) => !practisedTopics.has(skill)),
        nextDifficulty: ml.recommendDifficulty(scores, history[history.length - 1]?.difficulty),
        model: clusters.model
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ML-derived weak topics turned into an AI study plan (rule-based when no
 * provider is configured).
 */
exports.getStudyPlan = async (req, res) => {
  try {
    const days = Math.min(30, Math.max(1, Number(req.query.days) || 7));
    const performances = await Performance.find({ user: req.user.id }).lean();
    const clusters = ml.clusterTopics(performances.flatMap((performance) => performance.weakTopics || []));

    const history = await getScoreHistory(req.user.id);
    const scores = history.map((entry) => entry.score);
    const summary = ml.summarizeHistory(scores);
    const model = ml.trainReadinessModel(scores.map((score, index) => ({
      ...ml.summarizeHistory(scores.slice(0, index + 1)),
      totalInterviews: index + 1,
      label: score >= ml.PASS_MARK
    })));

    const { readiness } = ml.predictReadiness(model, { ...summary, totalInterviews: scores.length });
    const plan = await generateStudyPlan({
      role: req.user.targetRole || 'Full Stack Developer',
      weakTopics: clusters.weak.map((topic) => topic.topic).slice(0, 5),
      readiness,
      days
    });

    res.status(200).json({ success: true, readiness, aiEnabled: ai.isEnabled(), plan });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
