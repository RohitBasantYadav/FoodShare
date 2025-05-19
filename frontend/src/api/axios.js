import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Determine if we're in production based on the hostname
// const isProduction = window.location.hostname !== 'localhost';

// // Set the base URL depending on environment
// const baseURL = isProduction 
//   ? 'https://your-backend-url.com/api' // Replace with your deployed backend URL
//   : 'http://localhost:5000/api';

const api = axios.create({
  baseURL,
  withCredentials: true, // Allow cookies for authentication
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 250000, // 4 minutes timeout
});

// Add a request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Check if there's no response at all (e.g., network error, timeout)
    if (!error.response) {
      console.error('Network error or timeout:', error.message);
      return Promise.reject({ 
        response: { 
          data: { 
            message: 'Network error. Please check your connection.' 
          } 
        } 
      });
    }
    
    // If error is 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Clear storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 