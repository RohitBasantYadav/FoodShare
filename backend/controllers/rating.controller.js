const Rating = require('../models/Rating');
const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new rating
// @route   POST /api/ratings
// @access  Private
exports.createRating = async (req, res, next) => {
  try {
    const { postId, recipientId, score, comment } = req.body;
    
    // Validate required fields
    if (!postId || !recipientId || !score) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Check if score is valid (1-5)
    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating score must be between 1 and 5'
      });
    }
    
    // Check if post exists and is completed
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    if (post.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only rate completed posts'
      });
    }
    
    // Check if user is authorized to rate (must be post owner or claimer)
    const isPostOwner = post.user.toString() === req.user._id.toString();
    const isClaimer = post.claimedBy && post.claimedBy.toString() === req.user._id.toString();
    
    if (!isPostOwner && !isClaimer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this post'
      });
    }
    
    // Check if recipient is valid (either post owner or claimer, but not self)
    if (recipientId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot rate yourself'
      });
    }
    
    // Make sure recipient is either post owner or claimer
    const isRecipientPostOwner = post.user.toString() === recipientId.toString();
    const isRecipientClaimer = post.claimedBy && post.claimedBy.toString() === recipientId.toString();
    
    if (!isRecipientPostOwner && !isRecipientClaimer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid recipient'
      });
    }
    
    // Check if user already rated this post
    const existingRating = await Rating.findOne({
      post: postId,
      giver: req.user._id
    });
    
    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this post'
      });
    }
    
    // Create the rating
    const rating = await Rating.create({
      post: postId,
      giver: req.user._id,
      recipient: recipientId,
      score,
      comment: comment || ''
    });
    
    // Create notification
    await Notification.createNotification({
      recipient: recipientId,
      sender: req.user._id,
      post: postId,
      type: 'new_rating',
      message: `${req.user.name} has rated you ${score} stars`,
      redirectUrl: `/profile/ratings`
    });
    
    // The Rating post-save middleware will update user averageRating
    
    res.status(201).json({
      success: true,
      data: rating
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a rating
// @route   PUT /api/ratings/:id
// @access  Private (rating owner only)
exports.updateRating = async (req, res, next) => {
  try {
    const { score, comment } = req.body;
    
    // Find rating
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Check if user is the rating giver
    if (rating.giver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this rating'
      });
    }
    
    // Update fields
    if (score) {
      if (score < 1 || score > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating score must be between 1 and 5'
        });
      }
      rating.score = score;
    }
    
    if (comment !== undefined) {
      rating.comment = comment;
    }
    
    await rating.save();
    
    res.status(200).json({
      success: true,
      data: rating
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a rating
// @route   DELETE /api/ratings/:id
// @access  Private (rating owner only)
exports.deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findById(req.params.id);
    
    if (!rating) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found'
      });
    }
    
    // Check if user is the rating giver
    if (rating.giver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this rating'
      });
    }
    
    await rating.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ratings for a specific post
// @route   GET /api/posts/:postId/ratings
// @access  Public
exports.getPostRatings = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    
    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    const ratings = await Rating.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate('giver', 'name profilePicture')
      .populate('recipient', 'name profilePicture');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    next(error);
  }
}; 