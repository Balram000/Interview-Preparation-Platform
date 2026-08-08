const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
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
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  mode: {
    type: String,
    enum: ['MCQ', 'Text', 'Voice', 'Video'],
    default: 'Text'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'abandoned'],
    default: 'pending'
  },
  questions: [{
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question'
    },
    userAnswer: {
      type: String,
      default: ''
    },
    aiFeedback: {
      score: Number,
      accuracy: Number,
      communication: Number,
      confidence: Number,
      completeness: Number,
      missingConcepts: [String],
      suggestions: [String],
      strengths: [String]
    },
    timeTaken: {
      type: Number,
      default: 0
    },
    isCorrect: {
      type: Boolean,
      default: false
    }
  }],
  totalScore: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 100
  },
  duration: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  weakTopics: [String],
  strongTopics: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Interview', interviewSchema);
