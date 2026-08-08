const Interview = require('../models/Interview');
const Question = require('../models/Question');
const Performance = require('../models/Performance');
const { generateAIQuestions, evaluateAnswer } = require('../services/aiService');
const aiProvider = require('../services/aiProvider');

/**
 * AI-generated questions are plain objects, so they must become `Question`
 * documents before an interview can reference them by `_id`.
 */
async function persistGeneratedQuestions(generated, { role, difficulty, mode, userId }) {
  if (!Array.isArray(generated)) return [];

  const documents = generated
    .filter((question) => question && typeof question.question === 'string' && question.question.trim())
    .map((question) => {
      const options = Array.isArray(question.options)
        ? question.options.map((option) => (
          typeof option === 'string'
            ? { option, isCorrect: option === question.correctAnswer }
            : { option: option.option, isCorrect: Boolean(option.isCorrect) }
        ))
        : [];

      return {
        category: role,
        difficulty,
        // Only keep the MCQ type when the model actually returned options
        type: mode === 'MCQ' && options.length > 0 ? 'MCQ' : 'Text',
        question: question.question.trim(),
        options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        topics: question.topics || [],
        expectedKeywords: question.expectedKeywords || [],
        keywords: question.expectedKeywords || [],
        aiGenerated: true,
        createdBy: userId
      };
    });

  if (documents.length === 0) return [];

  return Question.insertMany(documents);
}

exports.createInterview = async (req, res) => {
  try {
    const { role, difficulty, mode } = req.body;

    // Prefer the requested type, but do not leave the user with an empty interview
    const findSeededQuestions = async () => {
      const preferredType = mode === 'MCQ' ? 'MCQ' : 'Text';
      const preferred = await Question.find({ category: role, difficulty, type: preferredType, isActive: true }).limit(10);
      if (preferred.length > 0) return preferred;
      return Question.find({ category: role, difficulty, isActive: true }).limit(10);
    };

    let questions;
    if (req.body.useAI && aiProvider.isEnabled()) {
      const generated = await generateAIQuestions(role, difficulty, mode);
      questions = await persistGeneratedQuestions(generated, { role, difficulty, mode, userId: req.user.id });
    } else {
      questions = await findSeededQuestions();
    }

    // AI questions can be unusable (e.g. MCQs without options); fall back to the seeded bank
    if (!questions || questions.length === 0) {
      questions = await findSeededQuestions();
    }

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No questions found for this category. Run `npm run seed:questions` to load the question bank.'
      });
    }

    const interviewQuestions = questions.map(q => ({
      question: q._id,
      userAnswer: '',
      aiFeedback: {},
      timeTaken: 0,
      isCorrect: false
    }));

    const interview = await Interview.create({
      user: req.user.id,
      role,
      difficulty,
      mode,
      status: 'pending',
      questions: interviewQuestions,
      startedAt: null,
      completedAt: null
    });

    res.status(201).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.startInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    interview.status = 'in_progress';
    interview.startedAt = Date.now();
    await interview.save();

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { answer, timeTaken } = req.body;
    const interview = await Interview.findById(req.params.id).populate('questions.question');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    const questionIndex = interview.questions.findIndex(
      q => q.question._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    interview.questions[questionIndex].userAnswer = answer;
    interview.questions[questionIndex].timeTaken = timeTaken;

    const question = interview.questions[questionIndex].question;
    const feedback = await evaluateAnswer(question.question, answer, question.expectedKeywords);
    
    interview.questions[questionIndex].aiFeedback = feedback;
    interview.questions[questionIndex].isCorrect = feedback.score >= 60;

    await interview.save();

    res.status(200).json({
      success: true,
      feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.completeInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    interview.status = 'completed';
    interview.completedAt = Date.now();
    interview.duration = Math.floor((interview.completedAt - interview.startedAt) / 1000);

    let totalScore = 0;
    let weakTopics = [];
    let strongTopics = [];

    interview.questions.forEach(q => {
      totalScore += q.aiFeedback.score || 0;
      if (q.aiFeedback.missingConcepts) {
        weakTopics.push(...q.aiFeedback.missingConcepts);
      }
      if (q.aiFeedback.strengths) {
        strongTopics.push(...q.aiFeedback.strengths);
      }
    });

    interview.totalScore = Math.round(totalScore / interview.questions.length);
    interview.weakTopics = [...new Set(weakTopics)];
    interview.strongTopics = [...new Set(strongTopics)];

    await interview.save();

    await updatePerformance(req.user.id, interview);

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getInterview = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('questions.question');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    res.status(200).json({
      success: true,
      interview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: interviews.length,
      interviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

async function updatePerformance(userId, interview) {
  let performance = await Performance.findOne({ user: userId, category: interview.role });

  if (!performance) {
    performance = await Performance.create({
      user: userId,
      category: interview.role
    });
  }

  performance.totalInterviews += 1;
  performance.averageScore = (performance.averageScore * (performance.totalInterviews - 1) + interview.totalScore) / performance.totalInterviews;
  
  if (interview.totalScore > performance.bestScore) {
    performance.bestScore = interview.totalScore;
  }

  interview.weakTopics.forEach(topic => {
    const existingTopic = performance.weakTopics.find(t => t.topic === topic);
    if (existingTopic) {
      existingTopic.attempts += 1;
    } else {
      performance.weakTopics.push({ topic, score: interview.totalScore, attempts: 1 });
    }
  });

  interview.strongTopics.forEach(topic => {
    const existingTopic = performance.strongTopics.find(t => t.topic === topic);
    if (existingTopic) {
      existingTopic.attempts += 1;
    } else {
      performance.strongTopics.push({ topic, score: interview.totalScore, attempts: 1 });
    }
  });

  const avgFeedback = interview.questions.reduce((acc, q) => {
    acc.technical += q.aiFeedback.accuracy || 0;
    acc.communication += q.aiFeedback.communication || 0;
    acc.confidence += q.aiFeedback.confidence || 0;
    acc.problemSolving += q.aiFeedback.completeness || 0;
    return acc;
  }, { technical: 0, communication: 0, confidence: 0, problemSolving: 0 });

  const count = interview.questions.length;
  performance.skills.technical = Math.round(avgFeedback.technical / count);
  performance.skills.communication = Math.round(avgFeedback.communication / count);
  performance.skills.confidence = Math.round(avgFeedback.confidence / count);
  performance.skills.problemSolving = Math.round(avgFeedback.problemSolving / count);

  performance.lastUpdated = Date.now();
  await performance.save();
}
