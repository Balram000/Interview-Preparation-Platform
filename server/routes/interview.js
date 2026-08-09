const express = require('express');
const router = express.Router();
const {
  createInterview,
  startInterview,
  submitAnswer,
  completeInterview,
  getInterview,
  getUserInterviews
} = require('../controllers/interviewController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(protect, getUserInterviews)
  .post(protect, createInterview);

router.route('/:id')
  .get(protect, getInterview);

router.route('/:id/start')
  .put(protect, startInterview);

router.route('/:id/questions/:questionId')
  .put(protect, submitAnswer);

router.route('/:id/complete')
  .put(protect, completeInterview);

module.exports = router;
