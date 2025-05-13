const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Donate', 'Request']
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  quantity: {
    type: String,
    required: [true, 'Please specify the quantity'],
    trim: true
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide a pickup location']
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please provide an expiry date']
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Posted', 'Claimed', 'Picked Up', 'Completed', 'Expired', 'Cancelled'],
    default: 'Posted'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  claimedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  claimedAt: {
    type: Date,
    default: null
  },
  pickedUpAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  statusTimeline: [{
    status: {
      type: String,
      enum: ['Posted', 'Claimed', 'Picked Up', 'Completed', 'Expired', 'Cancelled']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for searching and filtering
postSchema.index({ 'location.coordinates': '2dsphere' });
postSchema.index({ expiryDate: 1 });
postSchema.index({ status: 1 });
postSchema.index({ type: 1 });

// Virtual property for ratings related to this post
postSchema.virtual('ratings', {
  ref: 'Rating',
  localField: '_id',
  foreignField: 'post',
  justOne: false
});

// Pre-save hook to add status to timeline when post is created
postSchema.pre('save', function(next) {
  if (this.isNew) {
    this.statusTimeline.push({
      status: 'Posted',
      timestamp: new Date(),
      updatedBy: this.user
    });
  }
  next();
});

// Method to update status and add to timeline
postSchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'Claimed':
      this.claimedAt = new Date();
      break;
    case 'Picked Up':
      this.pickedUpAt = new Date();
      break;
    case 'Completed':
      this.completedAt = new Date();
      break;
  }
  
  this.statusTimeline.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: userId
  });
};

// Static method to check and update expired posts
postSchema.statics.updateExpiredPosts = async function() {
  const now = new Date();
  return this.updateMany(
    { 
      expiryDate: { $lt: now },
      status: { $nin: ['Completed', 'Expired', 'Cancelled'] }
    },
    { 
      $set: { status: 'Expired' },
      $push: { 
        statusTimeline: {
          status: 'Expired',
          timestamp: now
        }
      }
    }
  );
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post; 