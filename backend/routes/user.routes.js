const express = require('express');
const { 
  getUserProfile, 
  updateProfile, 
  getUserStats, 
  getUserHistory, 
  getUserRatings
} = require('../controllers/user.controller');
const { protect, isAuthenticated } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes
router.put('/profile', protect, updateProfile);
router.get('/stats', protect, getUserStats);
router.get('/history', protect, getUserHistory);

// Public routes
router.get('/:id', isAuthenticated, getUserProfile);
router.get('/:id/ratings', isAuthenticated, getUserRatings);

module.exports = router; 