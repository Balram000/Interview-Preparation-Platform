const ai = require('../services/aiProvider');
const ml = require('../services/mlService');

exports.analyzeResume = async (req, res) => {
  const { resumeText, targetRole } = req.body;

  if (!resumeText) {
    return res.status(400).json({
      success: false,
      message: 'Resume text is required'
    });
  }

  const role = targetRole || req.user?.targetRole || 'Full Stack Developer';

  const prompt = `Analyze this resume for a ${role} position.

Resume Text:
${resumeText}

Provide analysis in this exact JSON format:
{
  "score": 85,
  "atsScore": 75,
  "strengths": ["strength1"],
  "weaknesses": ["weakness1"],
  "missingSkills": ["skill1"],
  "suggestions": ["suggestion1"],
  "grammarIssues": [],
  "formatting": {
    "overall": "Good",
    "issues": []
  },
  "keywords": {
    "matched": ["keyword1"],
    "missing": ["keyword2"]
  }
}`;

  try {
    const analysis = await ai.complete({
      system: 'You are an expert resume analyzer. Analyze resumes in valid JSON format only.',
      prompt,
      temperature: 0.3,
      maxTokens: 1500
    });

    return res.status(200).json({ success: true, analysis, source: 'ai' });
  } catch (error) {
    console.error('Resume Analysis Error:', error.message);
    return res.status(200).json({
      success: true,
      analysis: buildMlAnalysis(resumeText, role),
      source: 'ml'
    });
  }
};

/**
 * Deterministic analysis from the local skill-matrix model, used whenever the
 * LLM provider is unavailable.
 */
function buildMlAnalysis(resumeText, targetRole) {
  const fit = ml.analyzeResumeFit(resumeText, targetRole);

  return {
    score: fit.fitScore,
    atsScore: fit.atsScore,
    strengths: fit.matchedSkills.map((skill) => `Demonstrates ${skill}`),
    weaknesses: fit.missingSkills.map((skill) => `No evidence of ${skill}`),
    missingSkills: fit.missingSkills,
    suggestions: [
      fit.quantifiedAchievements ? 'Keep quantifying achievements' : 'Add measurable outcomes (%, latency, users)',
      `Add ${targetRole} keywords: ${fit.missingSkills.slice(0, 5).join(', ') || 'none missing'}`,
      'Describe projects with the technologies used'
    ],
    grammarIssues: [],
    formatting: {
      overall: fit.presentSections.length >= 3 ? 'Good' : 'Needs work',
      issues: ['experience', 'education', 'project', 'skill']
        .filter((section) => !fit.presentSections.includes(section))
        .map((section) => `Missing a clear ${section} section`)
    },
    keywords: {
      matched: fit.matchedSkills,
      missing: fit.missingSkills
    },
    model: fit.model
  };
}
