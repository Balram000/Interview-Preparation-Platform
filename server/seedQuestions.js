require('dotenv').config();
const mongoose = require('mongoose');
const config = require('./config/config');
const Question = require('./models/Question');
const { buildQuestionDocuments } = require('./data/questionBank');

/**
 * Idempotent seed: upserts every curated question by (category, difficulty,
 * question), so re-running never duplicates rows and always refreshes content.
 */
const seedQuestions = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('MongoDB Connected');

    const documents = buildQuestionDocuments();

    const result = await Question.bulkWrite(
      documents.map((document) => ({
        updateOne: {
          filter: {
            category: document.category,
            difficulty: document.difficulty,
            question: document.question
          },
          update: { $set: document },
          upsert: true
        }
      }))
    );

    console.log(`Seeded ${documents.length} questions (${result.upsertedCount} new, ${result.modifiedCount} updated)`);

    const counts = await Question.aggregate([
      { $group: { _id: { category: '$category', type: '$type' }, count: { $sum: 1 } } },
      { $sort: { '_id.category': 1, '_id.type': 1 } }
    ]);
    counts.forEach(({ _id, count }) => console.log(`  ${_id.category} · ${_id.type}: ${count}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding questions:', error.message);
    process.exit(1);
  }
};

seedQuestions();
