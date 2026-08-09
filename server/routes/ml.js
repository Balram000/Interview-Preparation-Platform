const express = require('express');
const router = express.Router();
const {
  scoreAnswer,
  matchResume,
  getReadiness,
  getRecommendations,
  getStudyPlan
} = require('../controllers/mlController');
const { protect } = require('../middlewares/auth');

router.post('/score-answer', protect, scoreAnswer);
router.post('/resume-match', protect, matchResume);
router.get('/readiness', protect, getReadiness);
router.get('/recommendations', protect, getRecommendations);
router.get('/study-plan', protect, getStudyPlan);

module.exports = router;
