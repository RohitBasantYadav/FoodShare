const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const ratingRoutes = require('./routes/rating.routes');
const notificationRoutes = require('./routes/notification.routes');

// Import error middleware
const errorHandler = require('./middlewares/error.middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'https://food-share-community.netlify.app', // Your frontend URL
  credentials: true // Allow credentials
}));
app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('FoodShare API is running');
});

// Error handler middleware
app.use(errorHandler);

// Task to check for expired posts and send notifications (run every hour)
const Post = require('./models/Post');
const Notification = require('./models/Notification');

const updateExpiredPosts = async () => {
  try {
    // Update expired posts
    const result = await Post.updateExpiredPosts();
    console.log(`Updated ${result.modifiedCount} expired posts`);
    
    // Create notifications for posts expiring soon
    const notificationCount = await Notification.createExpiringNotifications();
    console.log(`Created ${notificationCount} expiry notifications`);
  } catch (error) {
    console.error('Error in scheduled tasks:', error);
  }
};

// Run scheduled tasks immediately and then every hour
updateExpiredPosts();
setInterval(updateExpiredPosts, 60 * 60 * 1000);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
