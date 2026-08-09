const express = require('express');
const router = express.Router();
const {
  getUserPerformance,
  getPerformanceByCategory,
  getOverallStats
} = require('../controllers/performanceController');
const { protect } = require('../middlewares/auth');

router.route('/')
  .get(protect, getUserPerformance);

router.route('/:category')
  .get(protect, getPerformanceByCategory);

router.route('/stats/overview')
  .get(protect, getOverallStats);

module.exports = router;
