const { bank, buildQuestionDocuments } = require('../data/questionBank');
const Question = require('../models/Question');

const ROLES = Question.schema.path('category').enumValues;
const DIFFICULTIES = Question.schema.path('difficulty').enumValues;

describe('question bank', () => {
  const documents = buildQuestionDocuments();

  it('covers every role and difficulty', () => {
    ROLES.forEach((role) => {
      expect(Object.keys(bank)).toContain(role);
      DIFFICULTIES.forEach((difficulty) => {
        expect(bank[role][difficulty].length).toBeGreaterThan(0);
      });
    });
  });

  it('produces documents that satisfy the Question schema', () => {
    expect(documents.length).toBeGreaterThan(50);

    documents.forEach((document) => {
      const error = new Question(document).validateSync();
      expect(error).toBeUndefined();
    });
  });

  it('gives every MCQ exactly one correct option matching correctAnswer', () => {
    const mcqs = documents.filter((document) => document.type === 'MCQ');
    expect(mcqs.length).toBeGreaterThan(0);

    mcqs.forEach((mcq) => {
      const correct = mcq.options.filter((option) => option.isCorrect);
      expect(correct).toHaveLength(1);
      expect(correct[0].option).toBe(mcq.correctAnswer);
      expect(mcq.options.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('gives every text question expected keywords for ML scoring', () => {
    documents
      .filter((document) => document.type === 'Text')
      .forEach((document) => {
        expect(document.expectedKeywords.length).toBeGreaterThanOrEqual(3);
        expect(document.explanation).toBeTruthy();
      });
  });

  it('has no duplicate questions within a role and difficulty', () => {
    const seen = new Set();
    documents.forEach((document) => {
      const key = `${document.category}|${document.difficulty}|${document.question}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    });
  });
});
