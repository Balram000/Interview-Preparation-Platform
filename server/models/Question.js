const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: [
      'Frontend Developer',
      'Backend Developer',
      'Full Stack Developer',
      'Java Developer',
      'Cyber Security Analyst',
      'Data Analyst',
      'HR Interview',
      'System Design',
      'DSA Round'
    ]
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  type: {
    type: String,
    enum: ['MCQ', 'Text', 'Coding', 'HR'],
    default: 'Text'
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    option: String,
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  correctAnswer: {
    type: String
  },
  explanation: {
    type: String
  },
  topics: [{
    type: String
  }],
  keywords: [{
    type: String
  }],
  expectedKeywords: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  aiGenerated: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Question', questionSchema);
