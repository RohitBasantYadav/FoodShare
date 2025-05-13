const Post = require('../models/Post');
const User = require('../models/User');
const Notification = require('../models/Notification');

// @desc    Create a new post (donation or request)
// @route   POST /api/posts
// @access  Private
exports.createPost = async (req, res, next) => {
  try {
    const { type, title, description, quantity, location, expiryDate, images } = req.body;
    
    // Validate required fields
    if (!type || !title || !description || !quantity || !location || !expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }
    
    // Validate expiry date (must be in the future)
    const expiry = new Date(expiryDate);
    if (expiry <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Expiry date must be in the future'
      });
    }
    
    // Create post
    const post = await Post.create({
      type,
      title,
      description,
      quantity,
      location,
      expiryDate,
      images: images || [],
      user: req.user._id
    });
    
    // Update user's donation/request count
    if (type === 'Donate') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { donationsMade: 1 }
      });
    }
    
    res.status(201).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts with filtering
// @route   GET /api/posts
// @access  Public
exports.getPosts = async (req, res, next) => {
  try {
    console.log('Filter request params:', req.query);
    
    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    
    // Build query
    let query = {};
    
    // Filter by type (Donate or Request)
    if (req.query.type && ['Donate', 'Request'].includes(req.query.type)) {
      query.type = req.query.type;
    }
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      // Default to show only active posts (not expired or completed)
      query.status = { $nin: ['Expired', 'Cancelled'] };
    }
    
    // Filter for posts that are expiring soon (within 24 hours)
    // Handle both string 'true' and boolean true cases
    if (req.query.expiringSoon === 'true' || req.query.expiringSoon === true) {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: now, $lt: in24Hours };
    }
    
    // Filter by location radius (if coordinates provided)
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseInt(req.query.radius, 10) || 10; // default 10km
      
      // Ensure we have valid coordinates
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        // Convert radius from km to radians (required by MongoDB)
        // Earth's radius is approximately 6378.1 km
        const radiusInRadians = radius / 6378.1;
        
        query['location.coordinates'] = {
          $geoWithin: {
            $centerSphere: [
              [lng, lat], // MongoDB uses [lng, lat] ordering
              radiusInRadians
            ]
          }
        };
      }
    }
    
    console.log('MongoDB query:', JSON.stringify(query));
    
    // Execute query with pagination
    const total = await Post.countDocuments(query);
    
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit)
      .populate('user', 'name profilePicture')
      .populate('claimedBy', 'name profilePicture');
    
    console.log(`Found ${posts.length} posts matching the criteria`);
    
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
    console.error('Error in getPosts:', error);
    next(error);
  }
};

// @desc    Get a single post
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'name profilePicture averageRating')
      .populate('claimedBy', 'name profilePicture')
      .populate({
        path: 'statusTimeline.updatedBy',
        select: 'name profilePicture'
      });
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a post
// @route   PUT /api/posts/:id
// @access  Private (post owner only)
exports.updatePost = async (req, res, next) => {
  try {
    const { title, description, quantity, location, expiryDate, images } = req.body;
    
    let post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post'
      });
    }
    
    // Don't allow update if post is already claimed or completed
    if (['Claimed', 'Picked Up', 'Completed'].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot update post that is in ${post.status} status`
      });
    }
    
    // Update fields
    if (title) post.title = title;
    if (description) post.description = description;
    if (quantity) post.quantity = quantity;
    if (location) post.location = location;
    if (images) post.images = images;
    
    // Validate and update expiry date if provided
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      if (expiry <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Expiry date must be in the future'
        });
      }
      post.expiryDate = expiry;
    }
    
    await post.save();
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post
// @route   DELETE /api/posts/:id
// @access  Private (post owner only)
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check ownership
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post'
      });
    }
    
    // Don't allow deletion if post is already claimed or completed
    if (['Claimed', 'Picked Up', 'Completed'].includes(post.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete post that is in ${post.status} status`
      });
    }
    
    await post.deleteOne();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Claim a post
// @route   PUT /api/posts/:id/claim
// @access  Private
exports.claimPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Cannot claim own post
    if (post.user.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot claim your own post'
      });
    }
    
    // Check if post is available to claim
    if (post.status !== 'Posted') {
      return res.status(400).json({
        success: false,
        message: `Cannot claim post that is in ${post.status} status`
      });
    }
    
    // Check if post is expired
    if (new Date(post.expiryDate) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'This post has expired'
      });
    }
    
    // Update post status to claimed
    post.updateStatus('Claimed', req.user._id);
    post.claimedBy = req.user._id;
    await post.save();
    
    // Notify post owner
    await Notification.createNotification({
      recipient: post.user,
      sender: req.user._id,
      post: post._id,
      type: 'claim_request',
      message: `${req.user.name} has claimed your post "${post.title}"`,
      redirectUrl: `/posts/${post._id}`
    });
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update post status
// @route   PUT /api/posts/:id/status
// @access  Private (post owner or claimer only)
exports.updatePostStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!status || !['Posted', 'Claimed', 'Picked Up', 'Completed', 'Cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status'
      });
    }
    
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }
    
    // Check authorization
    const isOwner = post.user.toString() === req.user._id.toString();
    const isClaimer = post.claimedBy && post.claimedBy.toString() === req.user._id.toString();
    
    if (!isOwner && !isClaimer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post status'
      });
    }
    
    // Only owner can mark as posted or cancelled
    if ((status === 'Posted' || status === 'Cancelled') && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the post owner can set this status'
      });
    }
    
    // Only claimer can mark as picked up
    if (status === 'Picked Up' && !isClaimer) {
      return res.status(403).json({
        success: false,
        message: 'Only the claimer can mark as picked up'
      });
    }
    
    // Only post owner can mark as completed
    if (status === 'Completed' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Only the post owner can mark as completed'
      });
    }
    
    // Validate status transitions
    const validTransitions = {
      'Posted': ['Claimed', 'Cancelled'],
      'Claimed': ['Picked Up', 'Posted', 'Cancelled'],
      'Picked Up': ['Completed', 'Claimed'],
      'Completed': [],
      'Cancelled': ['Posted'],
      'Expired': ['Posted']
    };
    
    if (!validTransitions[post.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${post.status} to ${status}`
      });
    }
    
    // Update post status
    post.updateStatus(status, req.user._id);
    
    // If reverting from claimed back to posted, remove claimer
    if (status === 'Posted' && post.claimedBy) {
      post.claimedBy = null;
    }
    
    await post.save();
    
    // Create notification based on status
    let notificationType, recipient, message;
    
    if (status === 'Claimed') {
      notificationType = 'claim_approved';
      recipient = post.claimedBy;
      message = `Your claim on "${post.title}" has been approved`;
    } else if (status === 'Posted' && isClaimer) {
      notificationType = 'claim_rejected';
      recipient = post.user;
      message = `${req.user.name} has cancelled their claim on "${post.title}"`;
    } else if (status === 'Picked Up') {
      notificationType = 'pickup_confirmed';
      recipient = post.user;
      message = `${req.user.name} has picked up "${post.title}"`;
    } else if (status === 'Completed') {
      notificationType = 'post_completed';
      recipient = post.claimedBy;
      message = `Your transaction for "${post.title}" has been marked complete`;
    }
    
    if (notificationType && recipient) {
      await Notification.createNotification({
        recipient,
        sender: req.user._id,
        post: post._id,
        type: notificationType,
        message,
        redirectUrl: `/posts/${post._id}`
      });
    }
    
    // Update user stats if completed
    if (status === 'Completed') {
      if (post.type === 'Donate') {
        await User.findByIdAndUpdate(post.claimedBy, {
          $inc: { donationsReceived: 1 }
        });
      }
    }
    
    res.status(200).json({
      success: true,
      data: post
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get map view data
// @route   GET /api/posts/map
// @access  Public
exports.getMapPosts = async (req, res, next) => {
  try {
    console.log('Map filter request params:', req.query);
    
    // Query active posts for map view
    const query = {};
    
    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    } else {
      // Default to show only active posts (not expired or completed)
      query.status = { $nin: ['Expired', 'Cancelled', 'Completed'] };
    }
    
    // Filter by type if specified
    if (req.query.type && ['Donate', 'Request'].includes(req.query.type)) {
      query.type = req.query.type;
    }
    
    // Filter for posts that are expiring soon (within 24 hours)
    if (req.query.expiringSoon === 'true' || req.query.expiringSoon === true) {
      const now = new Date();
      const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      query.expiryDate = { $gt: now, $lt: in24Hours };
    }
    
    // Filter by location radius (if coordinates provided)
    if (req.query.lat && req.query.lng && req.query.radius) {
      const lat = parseFloat(req.query.lat);
      const lng = parseFloat(req.query.lng);
      const radius = parseInt(req.query.radius, 10) || 10; // default 10km
      
      // Ensure we have valid coordinates
      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        // Convert radius from km to radians (required by MongoDB)
        // Earth's radius is approximately 6378.1 km
        const radiusInRadians = radius / 6378.1;
        
        query['location.coordinates'] = {
          $geoWithin: {
            $centerSphere: [
              [lng, lat], // MongoDB uses [lng, lat] ordering
              radiusInRadians
            ]
          }
        };
      }
    } else {
      // Only return posts with valid coordinates if no specific location filter
      query['location.coordinates'] = { $exists: true, $ne: [] };
    }
    
    console.log('MongoDB map query:', JSON.stringify(query));
    
    // Limit fields for map view (only need id, type, coordinates, title)
    const posts = await Post.find(query)
      .select('title type location status user')
      .populate('user', 'name');
    
    console.log(`Found ${posts.length} posts for map view`);
    
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error in getMapPosts:', error);
    next(error);
  }
}; 