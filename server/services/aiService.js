const ai = require('./aiProvider');
const ml = require('./mlService');

const QUESTION_SYSTEM_PROMPT = 'You are an expert technical interviewer. Generate interview questions in valid JSON format only.';
const EVALUATION_SYSTEM_PROMPT = 'You are an expert interviewer. Evaluate answers and provide feedback in valid JSON format only.';

exports.generateAIQuestions = async (role, difficulty, mode) => {
  const prompt = `Generate 5 interview questions for a ${role} position at ${difficulty} level in ${mode} format.

Return the response in this exact JSON format:
[
  {
    "question": "Your question here",
    "type": "${mode}",
    "difficulty": "${difficulty}",
    "category": "${role}",
    "expectedKeywords": ["keyword1", "keyword2"],
    "explanation": "Brief explanation of the answer"
  }
]`;

  try {
    const questions = await ai.complete({ system: QUESTION_SYSTEM_PROMPT, prompt, temperature: 0.7, maxTokens: 1500 });
    if (!Array.isArray(questions) || questions.length === 0) throw new Error('Empty question set');
    return questions;
  } catch (error) {
    console.error('AI Question Generation Error:', error.message);
    return getFallbackQuestions(role, difficulty, mode);
  }
};

exports.evaluateAnswer = async (question, answer, expectedKeywords = []) => {
  const prompt = `Evaluate this interview answer:

Question: ${question}
User Answer: ${answer}
Expected Keywords: ${expectedKeywords.join(', ')}

Provide feedback in this exact JSON format:
{
  "score": 85,
  "accuracy": 80,
  "communication": 75,
  "confidence": 70,
  "completeness": 85,
  "missingConcepts": ["concept1", "concept2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "strengths": ["strength1", "strength2"]
}`;

  try {
    const feedback = await ai.complete({ system: EVALUATION_SYSTEM_PROMPT, prompt, temperature: 0.3, maxTokens: 500 });
    if (!Number.isFinite(Number(feedback.score))) throw new Error('Model returned no score');
    return feedback;
  } catch (error) {
    console.error('AI Answer Evaluation Error:', error.message);
    return getFallbackEvaluation(question, answer, expectedKeywords);
  }
};

/**
 * Generates a personalised study plan from ML-derived weak topics and readiness.
 */
exports.generateStudyPlan = async ({ role, weakTopics = [], readiness = 0, days = 7 }) => {
  const prompt = `Build a ${days}-day interview preparation plan for a ${role} candidate.
Current readiness: ${readiness}%.
Weakest topics: ${weakTopics.join(', ') || 'none recorded yet'}.

Return this exact JSON format:
{
  "summary": "one sentence overview",
  "days": [
    { "day": 1, "focus": "topic", "activities": ["activity1", "activity2"], "outcome": "what to achieve" }
  ]
}`;

  try {
    return await ai.complete({
      system: 'You are an interview coach. Reply with valid JSON only.',
      prompt,
      temperature: 0.5,
      maxTokens: 1200
    });
  } catch (error) {
    console.error('AI Study Plan Error:', error.message);
    return getFallbackStudyPlan(role, weakTopics, readiness, days);
  }
};

function getFallbackStudyPlan(role, weakTopics, readiness, days) {
  // Weak topics first, then role skills, so a single weak topic does not fill every day
  const roleSkills = ml.ROLE_SKILL_MATRIX[role] || ml.ROLE_SKILL_MATRIX['Full Stack Developer'];
  const focusAreas = [...new Set([...weakTopics, ...roleSkills])];

  return {
    summary: `Rule-based ${days}-day plan for ${role} at ${readiness}% readiness (AI provider unavailable).`,
    days: Array.from({ length: days }, (_, index) => {
      const focus = focusAreas[index % focusAreas.length];
      return {
        day: index + 1,
        focus,
        activities: [
          `Review core concepts of ${focus}`,
          `Solve 3 practice questions on ${focus}`,
          `Run a mock interview round focused on ${focus}`
        ],
        outcome: `Score above 70% on ${focus} questions`
      };
    })
  };
}

function getFallbackQuestions(role, difficulty, mode = 'Text') {
  const skills = ml.ROLE_SKILL_MATRIX[role] || ml.ROLE_SKILL_MATRIX['Full Stack Developer'];

  return skills.slice(0, 5).map((skill) => ({
    question: `Explain how you have used ${skill} and the trade-offs you considered.`,
    type: mode === 'MCQ' ? 'Text' : mode,
    difficulty,
    category: role,
    expectedKeywords: [skill, 'trade-off', 'example'],
    explanation: `A strong answer describes concrete ${skill} experience with reasoning about alternatives.`
  }));
}

function getFallbackEvaluation(question, answer, expectedKeywords) {
  const result = ml.scoreAnswer(answer, question, expectedKeywords);

  return {
    score: result.score,
    accuracy: result.keywordRecall,
    communication: result.vocabularyRichness,
    confidence: result.completeness,
    completeness: result.completeness,
    missingConcepts: result.missingKeywords,
    suggestions: [
      result.missingKeywords.length ? `Cover these concepts: ${result.missingKeywords.join(', ')}` : 'Add a concrete example from your experience',
      'Quantify the impact of what you built'
    ],
    // Plain concept names: `completeInterview` records these as strong topics
    strengths: result.matchedKeywords,
    model: result.model
  };
}
