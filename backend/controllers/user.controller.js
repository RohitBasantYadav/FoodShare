const User = require('../models/User');
const Post = require('../models/Post');
const Rating = require('../models/Rating');

// @desc    Get user profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, location, bio } = req.body;
    
    // Build update object
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (location) updateData.location = location;
    if (bio) updateData.bio = bio;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Donations made (posts of type 'Donate')
    const donationsMade = await Post.countDocuments({
      user: userId,
      type: 'Donate'
    });
    
    // Donations received (posts user has claimed and completed)
    const donationsReceived = await Post.countDocuments({
      claimedBy: userId,
      status: 'Completed',
      type: 'Donate'
    });
    
    // Requests made
    const requestsMade = await Post.countDocuments({
      user: userId,
      type: 'Request'
    });
    
    // Requests fulfilled
    const requestsFulfilled = await Post.countDocuments({
      claimedBy: userId,
      status: 'Completed',
      type: 'Request'
    });
    
    // Average rating received
    const userDetails = await User.findById(userId).select('averageRating totalRatings');
    
    // Recent activity (last 5 posts or claims)
    const recentPosts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title type status createdAt');
    
    const recentClaims = await Post.find({ claimedBy: userId })
      .sort({ claimedAt: -1 })
      .limit(5)
      .select('title type status claimedAt');
    
    res.status(200).json({
      success: true,
      data: {
        donationsMade,
        donationsReceived,
        requestsMade,
        requestsFulfilled,
        averageRating: userDetails.averageRating,
        totalRatings: userDetails.totalRatings,
        recentPosts,
        recentClaims
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's history (all posts and claims)
// @route   GET /api/users/history
// @access  Private
exports.getUserHistory = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const type = req.query.type; // 'posts' or 'claims'
    
    let query = {};
    
    if (type === 'posts') {
      query = { user: req.user._id };
    } else if (type === 'claims') {
      query = { claimedBy: req.user._id };
    } else {
      // If no type specified, get both
      query = {
        $or: [
          { user: req.user._id },
          { claimedBy: req.user._id }
        ]
      };
    }
    
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name profilePicture')
      .populate('claimedBy', 'name profilePicture');
    
    res.status(200).json({
      success: true,
      count: posts.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: posts
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's ratings
// @route   GET /api/users/:id/ratings
// @access  Public
exports.getUserRatings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const userId = req.params.id;
    
    // Find the user to confirm they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const total = await Rating.countDocuments({ recipient: userId });
    
    const ratings = await Rating.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('giver', 'name profilePicture')
      .populate('post', 'title type');
    
    res.status(200).json({
      success: true,
      count: ratings.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: ratings
    });
  } catch (error) {
    next(error);
  }
}; 