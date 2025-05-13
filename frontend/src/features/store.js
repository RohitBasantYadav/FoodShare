import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import postReducer from './posts/postSlice';
import userReducer from './users/userSlice';
import notificationReducer from './notifications/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    users: userReducer,
    notifications: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false, // Allows non-serializable values for dates
    }),
});

export default store; 