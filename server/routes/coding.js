const express = require('express');
const router = express.Router();
const {
  getCodingQuestions,
  getCodingQuestion,
  submitCode
} = require('../controllers/codingController');
const { protect } = require('../middlewares/auth');

router.route('/questions')
  .get(protect, getCodingQuestions);

router.route('/questions/:id')
  .get(protect, getCodingQuestion);

router.post('/submit', protect, submitCode);

module.exports = router;
