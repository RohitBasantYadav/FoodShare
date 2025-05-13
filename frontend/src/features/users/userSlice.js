import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const initialState = {
  profile: null,
  userStats: null,
  userHistory: [],
  historyPagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  ratings: [],
  ratingsPagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  isLoading: false,
  error: null,
};

// Get user profile by ID
export const getUserProfile = createAsyncThunk(
  'users/getProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

// Get current user's stats
export const getUserStats = createAsyncThunk(
  'users/getStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user statistics';
      console.error('Error fetching user stats:', error);
      return rejectWithValue(message);
    }
  }
);

// Get user's history (posts and claims)
export const getUserHistory = createAsyncThunk(
  'users/getHistory',
  async (params, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const page = params?.page || state.users.historyPagination.page;
      const queryParams = {
        page,
        ...params,
      };
      
      const response = await api.get('/users/history', { params: queryParams });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch user history';
      console.error('Error fetching user history:', error);
      return rejectWithValue(message);
    }
  }
);

// Get user's ratings
export const getUserRatings = createAsyncThunk(
  'users/getRatings',
  async ({ userId, page }, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const currentPage = page || state.users.ratingsPagination.page;
      
      const response = await api.get(`/users/${userId}/ratings`, { 
        params: { page: currentPage } 
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user ratings');
    }
  }
);

// Get ratings for a specific post
export const getPostRatings = createAsyncThunk(
  'users/getPostRatings',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${postId}/ratings`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post ratings');
    }
  }
);

// Rate a user
export const rateUser = createAsyncThunk(
  'users/rateUser',
  async (ratingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/ratings', ratingData);
      toast.success('Rating submitted successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update a rating
export const updateRating = createAsyncThunk(
  'users/updateRating',
  async ({ id, ratingData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/ratings/${id}`, ratingData);
      toast.success('Rating updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete a rating
export const deleteRating = createAsyncThunk(
  'users/deleteRating',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/ratings/${id}`);
      toast.success('Rating deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete rating';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.profile = null;
      state.userStats = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get user profile cases
      .addCase(getUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload.data;
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get user stats cases
      .addCase(getUserStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStats = action.payload.data;
      })
      .addCase(getUserStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get user history cases
      .addCase(getUserHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userHistory = action.payload.data;
        state.historyPagination = action.payload.pagination;
      })
      .addCase(getUserHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get user ratings cases
      .addCase(getUserRatings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getUserRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = action.payload.data;
        state.ratingsPagination = action.payload.pagination;
      })
      .addCase(getUserRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get post ratings cases
      .addCase(getPostRatings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPostRatings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = action.payload.data;
        state.ratingsPagination = action.payload.pagination || {
          total: action.payload.data.length,
          page: 1,
          pages: 1,
        };
      })
      .addCase(getPostRatings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Rate user cases
      .addCase(rateUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rateUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(rateUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Update rating cases
      .addCase(updateRating.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = state.ratings.map((rating) =>
          rating._id === action.payload.data._id ? action.payload.data : rating
        );
      })
      .addCase(updateRating.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete rating cases
      .addCase(deleteRating.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteRating.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ratings = state.ratings.filter(
          (rating) => rating._id !== action.payload
        );
      })
      .addCase(deleteRating.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUserState } = userSlice.actions;
export default userSlice.reducer; 