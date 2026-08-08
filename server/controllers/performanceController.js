const Performance = require('../models/Performance');

exports.getUserPerformance = async (req, res) => {
  try {
    const performances = await Performance.find({ user: req.user.id })
      .sort({ lastUpdated: -1 });

    res.status(200).json({
      success: true,
      performances
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPerformanceByCategory = async (req, res) => {
  try {
    const performance = await Performance.findOne({
      user: req.user.id,
      category: req.params.category
    });

    if (!performance) {
      return res.status(404).json({
        success: false,
        message: 'Performance data not found for this category'
      });
    }

    res.status(200).json({
      success: true,
      performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getOverallStats = async (req, res) => {
  try {
    const performances = await Performance.find({ user: req.user.id });

    const totalInterviews = performances.reduce((sum, p) => sum + p.totalInterviews, 0);
    const averageScore = performances.length > 0
      ? performances.reduce((sum, p) => sum + p.averageScore, 0) / performances.length
      : 0;
    const bestScore = performances.length > 0
      ? Math.max(...performances.map(p => p.bestScore))
      : 0;

    const allWeakTopics = performances.flatMap(p => p.weakTopics.map(w => w.topic));
    const allStrongTopics = performances.flatMap(p => p.strongTopics.map(s => s.topic));

    const weakTopics = [...new Set(allWeakTopics)];
    const strongTopics = [...new Set(allStrongTopics)];

    const avgSkills = performances.length > 0
      ? {
          technical: Math.round(performances.reduce((sum, p) => sum + p.skills.technical, 0) / performances.length),
          communication: Math.round(performances.reduce((sum, p) => sum + p.skills.communication, 0) / performances.length),
          confidence: Math.round(performances.reduce((sum, p) => sum + p.skills.confidence, 0) / performances.length),
          problemSolving: Math.round(performances.reduce((sum, p) => sum + p.skills.problemSolving, 0) / performances.length)
        }
      : { technical: 0, communication: 0, confidence: 0, problemSolving: 0 };

    res.status(200).json({
      success: true,
      stats: {
        totalInterviews,
        averageScore: Math.round(averageScore),
        bestScore,
        weakTopics,
        strongTopics,
        skills: avgSkills,
        categories: performances.map(p => p.category)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
