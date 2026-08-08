const Question = require('../models/Question');

exports.getQuestions = async (req, res) => {
  try {
    const { category, difficulty, type } = req.query;
    
    const query = {};
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (type) query.type = type;
    query.isActive = true;

    const questions = await Question.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create({
      ...req.body,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
