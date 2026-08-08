const hrQuestions = [
  {
    id: 1,
    question: 'Tell me about yourself.',
    category: 'Introduction',
    tips: ['Keep it professional and concise', 'Focus on relevant experience'],
    evaluationCriteria: ['clarity', 'relevance', 'professionalism']
  },
  {
    id: 2,
    question: 'What are your greatest strengths?',
    category: 'Self-Assessment',
    tips: ['Choose 2-3 relevant strengths', 'Provide specific examples'],
    evaluationCriteria: ['self-awareness', 'relevance', 'examples']
  },
  {
    id: 3,
    question: 'Why should we hire you?',
    category: 'Motivation',
    tips: ['Highlight unique skills', 'Connect to company needs'],
    evaluationCriteria: ['value proposition', 'research', 'enthusiasm']
  }
];

exports.getHRQuestions = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      questions: hrQuestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPracticeQuestions = async (req, res) => {
  try {
    const { count = 3 } = req.query;
    const shuffled = [...hrQuestions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, parseInt(count));

    res.status(200).json({
      success: true,
      questions: selected
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.evaluateAnswer = async (req, res) => {
  try {
    const { questionId, answer } = req.body;
    
    const question = hrQuestions.find(q => q.id === parseInt(questionId));
    
    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const answerLength = answer.length;
    const minExpectedLength = 50;
    
    let score = 0;
    let feedback = [];

    if (answerLength >= minExpectedLength) {
      score += 40;
      feedback.push('Good length - provided detailed response');
    } else {
      feedback.push('Consider providing more detail');
    }

    const professionalWords = ['experience', 'skills', 'team', 'project', 'achieved'];
    const hasProfessionalWords = professionalWords.some(word => answer.toLowerCase().includes(word));
    
    if (hasProfessionalWords) {
      score += 30;
      feedback.push('Used professional language');
    } else {
      feedback.push('Try to include more professional terminology');
    }

    const exampleIndicators = ['example', 'for instance', 'when i'];
    const hasExamples = exampleIndicators.some(indicator => answer.toLowerCase().includes(indicator));
    
    if (hasExamples) {
      score += 30;
      feedback.push('Provided specific examples');
    } else {
      feedback.push('Consider adding specific examples');
    }

    res.status(200).json({
      success: true,
      evaluation: {
        score: Math.min(100, score),
        feedback,
        tips: question.tips,
        criteria: question.evaluationCriteria
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
