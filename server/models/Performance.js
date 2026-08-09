const mongoose = require('mongoose');

const performanceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true
  },
  totalInterviews: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  bestScore: {
    type: Number,
    default: 0
  },
  weakTopics: [{
    topic: String,
    score: Number,
    attempts: Number
  }],
  strongTopics: [{
    topic: String,
    score: Number,
    attempts: Number
  }],
  skills: {
    technical: {
      type: Number,
      default: 0
    },
    communication: {
      type: Number,
      default: 0
    },
    confidence: {
      type: Number,
      default: 0
    },
    problemSolving: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Performance', performanceSchema);
