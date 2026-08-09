const ml = require('../services/mlService');

describe('tokenize', () => {
  it('drops stop words and keeps technical tokens', () => {
    expect(ml.tokenize('The scope of let is a block in JavaScript'))
      .toEqual(['scope', 'let', 'block', 'javascript']);
  });
});

describe('scoreAnswer', () => {
  it('scores a keyword-rich answer higher than an empty one', () => {
    const question = 'Explain the difference between let, const and var in JavaScript.';
    const keywords = ['scope', 'hoisting', 'block'];

    const strong = ml.scoreAnswer(
      'let and const are block scoped while var is function scoped, and hoisting differs between them.',
      question,
      keywords
    );
    const weak = ml.scoreAnswer('I do not know.', question, keywords);

    expect(strong.score).toBeGreaterThan(weak.score);
    expect(strong.matchedKeywords).toEqual(expect.arrayContaining(['scope', 'hoisting', 'block']));
    expect(weak.missingKeywords).toHaveLength(3);
  });

  it('keeps scores within 0-100', () => {
    const result = ml.scoreAnswer('a'.repeat(500), 'reference', []);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe('cosineSimilarity', () => {
  it('rates identical documents as more similar than unrelated ones', () => {
    const [a, b, c] = ml.tfidfVectors(['react hooks state', 'react hooks state', 'kubernetes cluster networking']);
    expect(ml.cosineSimilarity(a, b)).toBeGreaterThan(ml.cosineSimilarity(a, c));
  });
});

describe('analyzeResumeFit', () => {
  it('flags missing role skills', () => {
    const analysis = ml.analyzeResumeFit(
      'Experience building React components with JavaScript, HTML and CSS. Improved load time by 30%.',
      'Frontend Developer'
    );

    expect(analysis.matchedSkills).toEqual(expect.arrayContaining(['react', 'javascript', 'html', 'css']));
    expect(analysis.missingSkills).toContain('typescript');
    expect(analysis.quantifiedAchievements).toBe(true);
    expect(analysis.fitScore).toBeGreaterThan(0);
  });

  it('falls back to the full stack matrix for unknown roles', () => {
    expect(ml.analyzeResumeFit('node express mongodb', 'Astronaut').targetRole).toBe('Astronaut');
  });
});

describe('clusterTopics', () => {
  it('separates low scoring topics from high scoring ones', () => {
    const clusters = ml.clusterTopics([
      { topic: 'recursion', score: 30 },
      { topic: 'graphs', score: 35 },
      { topic: 'arrays', score: 90 },
      { topic: 'strings', score: 85 }
    ]);

    expect(clusters.weak.map((topic) => topic.topic)).toEqual(['recursion', 'graphs']);
    expect(clusters.strong.map((topic) => topic.topic)).toEqual(['arrays', 'strings']);
  });

  it('handles empty input', () => {
    expect(ml.clusterTopics([]).weak).toEqual([]);
  });

  it('falls back to the pass mark when every score is identical', () => {
    const lowScores = ml.clusterTopics([{ topic: 'a', score: 18 }, { topic: 'b', score: 18 }]);
    expect(lowScores.weak).toHaveLength(2);
    expect(lowScores.strong).toHaveLength(0);

    const highScores = ml.clusterTopics([{ topic: 'a', score: 90 }, { topic: 'b', score: 90 }]);
    expect(highScores.strong).toHaveLength(2);
    expect(highScores.weak).toHaveLength(0);
  });
});

describe('readiness model', () => {
  it('learns that high scores mean ready', () => {
    const samples = [
      { averageScore: 90, bestScore: 95, totalInterviews: 10, consistency: 90, trend: 5, label: true },
      { averageScore: 85, bestScore: 92, totalInterviews: 8, consistency: 85, trend: 3, label: true },
      { averageScore: 35, bestScore: 45, totalInterviews: 6, consistency: 60, trend: -5, label: false },
      { averageScore: 40, bestScore: 50, totalInterviews: 5, consistency: 55, trend: -2, label: false }
    ];

    const model = ml.trainReadinessModel(samples);
    const high = ml.predictReadiness(model, { averageScore: 88, bestScore: 94, totalInterviews: 9, consistency: 88, trend: 4 });
    const low = ml.predictReadiness(model, { averageScore: 30, bestScore: 40, totalInterviews: 4, consistency: 50, trend: -8 });

    expect(model.trainedOn).toBe(4);
    expect(high.readiness).toBeGreaterThan(low.readiness);
  });

  it('uses a prior when there is no history', () => {
    const model = ml.trainReadinessModel([]);
    expect(model.trainedOn).toBe(0);
    expect(ml.predictReadiness(model, {}).readiness).toBeLessThan(50);
  });
});

describe('recommendDifficulty', () => {
  it('levels up consistent high performers', () => {
    expect(ml.recommendDifficulty([90, 92, 88, 95, 91], 'Beginner').difficulty).toBe('Intermediate');
  });

  it('levels down struggling users', () => {
    expect(ml.recommendDifficulty([40, 45, 38], 'Intermediate').difficulty).toBe('Beginner');
  });

  it('holds the level without enough data', () => {
    expect(ml.recommendDifficulty([80], 'Intermediate').difficulty).toBe('Intermediate');
  });
});

describe('summarizeHistory', () => {
  it('reports trend and consistency', () => {
    const summary = ml.summarizeHistory([50, 60, 70, 80]);
    expect(summary.averageScore).toBe(65);
    expect(summary.bestScore).toBe(80);
    expect(summary.trend).toBeGreaterThan(0);
    expect(summary.consistency).toBeLessThan(100);
  });
});
