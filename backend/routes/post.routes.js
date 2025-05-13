const express = require('express');
const { 
  createPost, 
  getPosts, 
  getPost,
  updatePost,
  deletePost,
  claimPost,
  updatePostStatus,
  getMapPosts
} = require('../controllers/post.controller');
const { getPostRatings } = require('../controllers/rating.controller');
const { protect, isAuthenticated, isPostOwner } = require('../middlewares/auth.middleware');

const router = express.Router();

// Public routes
router.get('/', isAuthenticated, getPosts);
router.get('/map', getMapPosts);
router.get('/:id', isAuthenticated, getPost);
router.get('/:postId/ratings', getPostRatings);

// Protected routes
router.post('/', protect, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/claim', protect, claimPost);
router.put('/:id/status', protect, updatePostStatus);

module.exports = router; 