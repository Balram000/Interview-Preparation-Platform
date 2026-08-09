const express = require('express');
const router = express.Router();
const {
  getHRQuestions,
  getPracticeQuestions,
  evaluateAnswer
} = require('../controllers/hrController');
const { protect } = require('../middlewares/auth');

router.route('/questions')
  .get(protect, getHRQuestions);

router.get('/practice', protect, getPracticeQuestions);
router.post('/evaluate', protect, evaluateAnswer);

module.exports = router;
