const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  },
  type: {
    type: String,
    required: true,
    enum: [
      'claim_request', 
      'claim_approved', 
      'claim_rejected', 
      'post_expiring_soon', 
      'post_expired',
      'pickup_confirmed',
      'post_completed',
      'new_rating'
    ]
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  redirectUrl: {
    type: String
  }
}, {
  timestamps: true
});

// Index to improve performance for finding a user's notifications
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

// Static method to create a notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    const notification = await this.create(notificationData);
    
    // In a real app, you might emit a socket event here to push 
    // real-time notifications to the client
    
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method for creating expiring soon notifications
notificationSchema.statics.createExpiringNotifications = async function() {
  const Post = mongoose.model('Post');
  const now = new Date();
  const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  try {
    // Find posts expiring in the next 24 hours
    const expiringPosts = await Post.find({
      expiryDate: { $gt: now, $lt: in24Hours },
      status: { $in: ['Posted', 'Claimed'] }
    }).populate('user');
    
    // Create notifications for each post owner
    const notifications = [];
    for (const post of expiringPosts) {
      const notificationExists = await this.findOne({
        recipient: post.user._id,
        post: post._id,
        type: 'post_expiring_soon'
      });
      
      if (!notificationExists) {
        notifications.push({
          recipient: post.user._id,
          post: post._id,
          type: 'post_expiring_soon',
          message: `Your post "${post.title}" is expiring in less than 24 hours`,
          redirectUrl: `/posts/${post._id}`
        });
      }
    }
    
    if (notifications.length > 0) {
      await this.insertMany(notifications);
    }
    
    return notifications.length;
  } catch (error) {
    console.error('Error creating expiring notifications:', error);
    throw error;
  }
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 