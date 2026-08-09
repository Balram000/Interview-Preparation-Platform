const express = require('express');
const router = express.Router();
const {
  getQuestions,
  createQuestion
} = require('../controllers/questionController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(protect, getQuestions)
  .post(protect, authorize('admin'), createQuestion);

module.exports = router;
