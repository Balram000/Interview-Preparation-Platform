/**
 * Local machine-learning utilities. Runs entirely in-process so the platform
 * keeps working (and stays cheap) when no LLM provider key is configured.
 *
 * Implements: TF-IDF vectorisation, cosine similarity answer scoring,
 * resume/role skill-gap matching, k-means topic clustering and an online
 * logistic-regression readiness predictor.
 */

// The platform treats 70% as interview-ready
const PASS_MARK = 70;

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 'of', 'to', 'in',
  'on', 'at', 'by', 'for', 'with', 'about', 'is', 'are', 'was', 'were', 'be',
  'been', 'being', 'it', 'its', 'this', 'that', 'these', 'those', 'as', 'from',
  'into', 'we', 'you', 'i', 'they', 'he', 'she', 'can', 'will', 'would',
  'should', 'could', 'do', 'does', 'did', 'not', 'no', 'so', 'than', 'there'
]);

const ROLE_SKILL_MATRIX = {
  'Frontend Developer': ['javascript', 'react', 'html', 'css', 'typescript', 'redux', 'webpack', 'accessibility', 'testing', 'responsive'],
  'Backend Developer': ['node', 'express', 'sql', 'mongodb', 'rest', 'authentication', 'caching', 'docker', 'testing', 'queues'],
  'Full Stack Developer': ['javascript', 'react', 'node', 'express', 'mongodb', 'sql', 'rest', 'docker', 'git', 'testing'],
  'Java Developer': ['java', 'spring', 'hibernate', 'jvm', 'maven', 'sql', 'multithreading', 'junit', 'microservices', 'rest'],
  'Cyber Security Analyst': ['networking', 'siem', 'linux', 'cryptography', 'owasp', 'firewall', 'forensics', 'python', 'compliance', 'incident'],
  'Data Analyst': ['sql', 'python', 'pandas', 'statistics', 'excel', 'tableau', 'visualization', 'etl', 'regression', 'dashboard'],
  'HR Interview': ['communication', 'teamwork', 'leadership', 'conflict', 'ownership', 'motivation', 'adaptability', 'feedback'],
  'System Design': ['scalability', 'caching', 'sharding', 'queues', 'consistency', 'loadbalancer', 'replication', 'cdn', 'microservices'],
  'DSA Round': ['array', 'string', 'tree', 'graph', 'recursion', 'dynamic', 'sorting', 'hashing', 'complexity', 'heap']
};

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#. ]/g, ' ')
    .split(/\s+/)
    .map((token) => token.replace(/^[.]+|[.]+$/g, ''))
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function termFrequency(tokens) {
  const counts = new Map();
  tokens.forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));
  const tf = new Map();
  counts.forEach((count, token) => tf.set(token, count / tokens.length));
  return tf;
}

/**
 * Builds L2-normalised TF-IDF vectors for a corpus of documents.
 */
function tfidfVectors(documents) {
  const tokenized = documents.map(tokenize);
  const documentFrequency = new Map();

  tokenized.forEach((tokens) => {
    new Set(tokens).forEach((token) => {
      documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
    });
  });

  return tokenized.map((tokens) => {
    const vector = new Map();
    if (tokens.length === 0) return vector;

    termFrequency(tokens).forEach((tf, token) => {
      const idf = Math.log((1 + documents.length) / (1 + documentFrequency.get(token))) + 1;
      vector.set(token, tf * idf);
    });

    const norm = Math.sqrt([...vector.values()].reduce((sum, value) => sum + value * value, 0));
    if (norm > 0) vector.forEach((value, token) => vector.set(token, value / norm));
    return vector;
  });
}

function cosineSimilarity(a, b) {
  let dot = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  small.forEach((value, token) => {
    if (large.has(token)) dot += value * large.get(token);
  });
  return Math.max(0, Math.min(1, dot));
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Scores a candidate answer against a reference answer and expected keywords.
 * Combines TF-IDF similarity, keyword recall and a length/detail prior.
 */
function scoreAnswer(answer, referenceAnswer = '', expectedKeywords = []) {
  const tokens = tokenize(answer);
  const [answerVector, referenceVector] = tfidfVectors([answer, referenceAnswer]);
  const similarity = referenceAnswer ? cosineSimilarity(answerVector, referenceVector) : 0;

  const keywords = expectedKeywords.map((keyword) => String(keyword).toLowerCase());
  const answerText = String(answer || '').toLowerCase();
  const matchedKeywords = keywords.filter((keyword) => answerText.includes(keyword));
  const missingKeywords = keywords.filter((keyword) => !answerText.includes(keyword));
  const recall = keywords.length ? matchedKeywords.length / keywords.length : similarity;

  const uniqueRatio = tokens.length ? new Set(tokens).size / tokens.length : 0;
  const detail = Math.min(1, tokens.length / 60);

  const score = clamp(Math.round(100 * (0.4 * recall + 0.35 * similarity + 0.15 * detail + 0.1 * uniqueRatio)));

  return {
    score,
    similarity: Math.round(similarity * 100),
    keywordRecall: Math.round(recall * 100),
    completeness: Math.round(detail * 100),
    vocabularyRichness: Math.round(uniqueRatio * 100),
    matchedKeywords,
    missingKeywords,
    model: 'tfidf-cosine-v1'
  };
}

/**
 * Compares a resume against the skill matrix of a target role.
 */
function analyzeResumeFit(resumeText, targetRole = 'Full Stack Developer') {
  const requiredSkills = ROLE_SKILL_MATRIX[targetRole] || ROLE_SKILL_MATRIX['Full Stack Developer'];
  const text = String(resumeText || '').toLowerCase();

  const matchedSkills = requiredSkills.filter((skill) => text.includes(skill));
  const missingSkills = requiredSkills.filter((skill) => !text.includes(skill));

  const [resumeVector, roleVector] = tfidfVectors([resumeText, requiredSkills.join(' ')]);
  const similarity = cosineSimilarity(resumeVector, roleVector);

  const coverage = matchedSkills.length / requiredSkills.length;
  const hasMetrics = /\d+%|\d+\s*(users|ms|requests|rps|x)\b/.test(text);
  const sections = ['experience', 'education', 'project', 'skill'].filter((section) => text.includes(section));

  const fitScore = clamp(Math.round(100 * (0.6 * coverage + 0.2 * similarity + 0.1 * sections.length / 4 + (hasMetrics ? 0.1 : 0))));

  return {
    targetRole,
    fitScore,
    atsScore: clamp(Math.round(100 * (0.5 * coverage + 0.3 * sections.length / 4 + (hasMetrics ? 0.2 : 0)))),
    semanticSimilarity: Math.round(similarity * 100),
    matchedSkills,
    missingSkills,
    presentSections: sections,
    quantifiedAchievements: hasMetrics,
    model: 'skill-matrix-tfidf-v1'
  };
}

/**
 * k-means (k = 2) over topic scores to separate weak from strong topics
 * without relying on a fixed score threshold.
 */
function clusterTopics(topics, iterations = 20) {
  const points = topics
    .filter((topic) => topic && Number.isFinite(Number(topic.score)))
    .map((topic) => ({ topic: topic.topic, score: Number(topic.score) }));

  if (points.length < 2) {
    return { weak: points, strong: [], boundary: null, model: 'kmeans-v1' };
  }

  const scores = points.map((point) => point.score);
  let low = Math.min(...scores);
  let high = Math.max(...scores);

  // A single cluster carries no relative signal, so fall back to the pass mark
  if (low === high) {
    return {
      weak: low < PASS_MARK ? points : [],
      strong: low >= PASS_MARK ? points : [],
      boundary: PASS_MARK,
      model: 'kmeans-v1'
    };
  }

  for (let i = 0; i < iterations; i += 1) {
    const lowGroup = points.filter((point) => Math.abs(point.score - low) <= Math.abs(point.score - high));
    const highGroup = points.filter((point) => Math.abs(point.score - low) > Math.abs(point.score - high));
    if (!lowGroup.length || !highGroup.length) break;

    const nextLow = lowGroup.reduce((sum, point) => sum + point.score, 0) / lowGroup.length;
    const nextHigh = highGroup.reduce((sum, point) => sum + point.score, 0) / highGroup.length;
    if (nextLow === low && nextHigh === high) break;
    low = nextLow;
    high = nextHigh;
  }

  const boundary = (low + high) / 2;
  return {
    weak: points.filter((point) => point.score < boundary).sort((a, b) => a.score - b.score),
    strong: points.filter((point) => point.score >= boundary).sort((a, b) => b.score - a.score),
    boundary: Math.round(boundary),
    model: 'kmeans-v1'
  };
}

function sigmoid(z) {
  return 1 / (1 + Math.exp(-z));
}

function featurize(sample) {
  return [
    (Number(sample.averageScore) || 0) / 100,
    (Number(sample.bestScore) || 0) / 100,
    Math.min(1, (Number(sample.totalInterviews) || 0) / 20),
    (Number(sample.consistency) || 0) / 100,
    ((Number(sample.trend) || 0) + 100) / 200
  ];
}

/**
 * Logistic regression trained with batch gradient descent on the user's own
 * interview history. Labels are "interview-ready" (score >= 70) outcomes.
 */
function trainReadinessModel(samples, { epochs = 300, learningRate = 0.5 } = {}) {
  const dimensions = 5;
  let weights = new Array(dimensions).fill(0);
  let bias = 0;

  const rows = samples
    .map((sample) => ({ x: featurize(sample), y: sample.label ? 1 : 0 }))
    .filter((row) => row.x.every(Number.isFinite));

  if (rows.length === 0) {
    // Prior derived from the platform's 70% pass mark when no history exists.
    return { weights: [2.2, 1.1, 0.6, 0.5, 0.4], bias: -2.4, trainedOn: 0 };
  }

  for (let epoch = 0; epoch < epochs; epoch += 1) {
    const gradients = new Array(dimensions).fill(0);
    let biasGradient = 0;

    rows.forEach(({ x, y }) => {
      const error = sigmoid(x.reduce((sum, value, index) => sum + value * weights[index], bias)) - y;
      x.forEach((value, index) => { gradients[index] += error * value; });
      biasGradient += error;
    });

    weights = weights.map((weight, index) => weight - (learningRate * gradients[index]) / rows.length);
    bias -= (learningRate * biasGradient) / rows.length;
  }

  return { weights, bias, trainedOn: rows.length };
}

function predictReadiness(model, sample) {
  const x = featurize(sample);
  const probability = sigmoid(x.reduce((sum, value, index) => sum + value * model.weights[index], model.bias));
  return {
    readiness: Math.round(probability * 100),
    confidence: Math.round(Math.abs(probability - 0.5) * 200),
    trainedOn: model.trainedOn,
    model: 'logistic-regression-v1'
  };
}

/**
 * Recommends the next difficulty using an epsilon-free bandit style rule over
 * recent accuracy, keeping the learner in the ~60-85% success band.
 */
function recommendDifficulty(recentScores = [], currentDifficulty = 'Beginner') {
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const index = Math.max(0, levels.indexOf(currentDifficulty));
  if (recentScores.length < 3) return { difficulty: levels[index], reason: 'Not enough attempts yet — staying at the current level.' };

  const window = recentScores.slice(-5);
  const mean = window.reduce((sum, score) => sum + score, 0) / window.length;

  if (mean >= 85 && index < levels.length - 1) {
    return { difficulty: levels[index + 1], reason: `Averaging ${Math.round(mean)}% — ready for harder questions.` };
  }
  if (mean < 60 && index > 0) {
    return { difficulty: levels[index - 1], reason: `Averaging ${Math.round(mean)}% — reinforcing fundamentals first.` };
  }
  return { difficulty: levels[index], reason: `Averaging ${Math.round(mean)}% — this level is well calibrated.` };
}

function summarizeHistory(scores = []) {
  if (!scores.length) return { averageScore: 0, bestScore: 0, consistency: 0, trend: 0 };

  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const variance = scores.reduce((sum, score) => sum + (score - average) ** 2, 0) / scores.length;
  const half = Math.max(1, Math.floor(scores.length / 2));
  const firstHalf = scores.slice(0, half);
  const secondHalf = scores.slice(-half);
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / values.length;

  return {
    averageScore: Math.round(average),
    bestScore: Math.max(...scores),
    consistency: Math.round(clamp(100 - Math.sqrt(variance))),
    trend: Math.round(mean(secondHalf) - mean(firstHalf))
  };
}

module.exports = {
  PASS_MARK,
  ROLE_SKILL_MATRIX,
  tokenize,
  tfidfVectors,
  cosineSimilarity,
  scoreAnswer,
  analyzeResumeFit,
  clusterTopics,
  trainReadinessModel,
  predictReadiness,
  recommendDifficulty,
  summarizeHistory
};
