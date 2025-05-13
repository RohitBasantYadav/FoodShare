const express = require('express');
const { 
  createRating, 
  updateRating, 
  deleteRating
} = require('../controllers/rating.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// All rating routes require authentication
router.post('/', protect, createRating);
router.put('/:id', protect, updateRating);
router.delete('/:id', protect, deleteRating);

module.exports = router; 