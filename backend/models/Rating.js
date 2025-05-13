const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  giver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  score: {
    type: Number,
    required: [true, 'Please provide a rating score'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [200, 'Comment cannot exceed 200 characters']
  }
}, {
  timestamps: true
});

// Each user can only rate once per post
ratingSchema.index({ post: 1, giver: 1 }, { unique: true });

// Middleware to update user's average rating
ratingSchema.post('save', async function() {
  const Rating = this.constructor;
  const User = mongoose.model('User');
  
  const recipientId = this.recipient;
  
  try {
    // Calculate new average rating
    const ratings = await Rating.find({ recipient: recipientId });
    const totalScore = ratings.reduce((acc, rating) => acc + rating.score, 0);
    const ratingCount = ratings.length;
    const averageRating = ratingCount > 0 ? totalScore / ratingCount : 0;
    
    // Update user with new rating statistics
    await User.findByIdAndUpdate(recipientId, {
      averageRating: averageRating.toFixed(1),
      totalRatings: ratingCount
    });
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
});

// Also update average when rating is deleted
ratingSchema.post('deleteOne', { document: true }, async function() {
  const Rating = this.constructor;
  const User = mongoose.model('User');
  
  const recipientId = this.recipient;
  
  try {
    // Recalculate average rating
    const ratings = await Rating.find({ recipient: recipientId });
    const totalScore = ratings.reduce((acc, rating) => acc + rating.score, 0);
    const ratingCount = ratings.length;
    const averageRating = ratingCount > 0 ? totalScore / ratingCount : 0;
    
    // Update user
    await User.findByIdAndUpdate(recipientId, {
      averageRating: averageRating.toFixed(1),
      totalRatings: ratingCount
    });
  } catch (error) {
    console.error('Error updating user rating after deletion:', error);
  }
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating; 