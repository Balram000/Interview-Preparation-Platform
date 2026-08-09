const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  deleteUser
} = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');

router.get('/stats', protect, authorize('admin'), getAdminStats);
router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

module.exports = router;
