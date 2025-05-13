import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { toast } from 'react-toastify';

const initialState = {
  posts: [],
  post: null,
  mapPosts: [],
  pagination: {
    total: 0,
    page: 1,
    pages: 1,
  },
  filters: {
    type: '',
    status: '',
    expiringSoon: false,
    radius: 10,
    lat: null,
    lng: null,
  },
  isLoading: false,
  error: null,
};

// Create a new post
export const createPost = createAsyncThunk(
  'posts/create',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts', postData);
      toast.success('Post created successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get all posts with filtering
export const getPosts = createAsyncThunk(
  'posts/getAll',
  async (params, { rejectWithValue, getState }) => {
    try {
      // Get current filters from state if not provided
      const { filters, pagination } = getState().posts;
      const page = params?.page || pagination.page;
      const queryParams = { 
        page,
        ...filters,
        ...params 
      };
      
      const response = await api.get('/posts', { params: queryParams });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts');
    }
  }
);

// Get post details by ID
export const getPostById = createAsyncThunk(
  'posts/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post details');
    }
  }
);

// Update a post
export const updatePost = createAsyncThunk(
  'posts/update',
  async ({ id, postData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${id}`, postData);
      toast.success('Post updated successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Delete a post
export const deletePost = createAsyncThunk(
  'posts/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/${id}`);
      toast.success('Post deleted successfully');
      return id;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Claim a post
export const claimPost = createAsyncThunk(
  'posts/claim',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${id}/claim`);
      toast.success('Post claimed successfully');
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to claim post';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Update post status
export const updatePostStatus = createAsyncThunk(
  'posts/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/posts/${id}/status`, { status });
      
      let message;
      switch (status) {
        case 'Picked Up':
          message = 'Post marked as picked up';
          break;
        case 'Completed':
          message = 'Post marked as completed';
          break;
        case 'Cancelled':
          message = 'Post cancelled';
          break;
        default:
          message = `Post status updated to ${status}`;
      }
      
      toast.success(message);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update post status';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

// Get posts for map view
export const getMapPosts = createAsyncThunk(
  'posts/getMapPosts',
  async (params, { rejectWithValue, getState }) => {
    try {
      // Get current filters from state if not provided
      const { filters } = getState().posts;
      const queryParams = { 
        ...filters,
        ...params 
      };
      
      console.log('Fetching map posts with filters:', queryParams);
      const response = await api.get('/posts/map', { params: queryParams });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch map data';
      console.error('Error fetching map data:', error);
      return rejectWithValue(message);
    }
  }
);

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset to first page when filters change
      state.pagination.page = 1;
    },
    resetFilters: (state) => {
      state.filters = {
        type: '',
        status: '',
        expiringSoon: false,
        radius: 10,
        lat: null,
        lng: null,
      };
    },
    resetPostState: (state) => {
      state.post = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create post cases
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get all posts cases
      .addCase(getPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get post by ID cases
      .addCase(getPostById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPostById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.post = action.payload.data;
      })
      .addCase(getPostById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update post cases
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.post && state.post._id === action.payload.data._id) {
          state.post = action.payload.data;
        }
        state.posts = state.posts.map((post) =>
          post._id === action.payload.data._id ? action.payload.data : post
        );
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete post cases
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.posts = state.posts.filter((post) => post._id !== action.payload);
        if (state.post && state.post._id === action.payload) {
          state.post = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Claim post cases
      .addCase(claimPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(claimPost.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.post && state.post._id === action.payload.data._id) {
          state.post = action.payload.data;
        }
        state.posts = state.posts.map((post) =>
          post._id === action.payload.data._id ? action.payload.data : post
        );
      })
      .addCase(claimPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update post status cases
      .addCase(updatePostStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePostStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.post && state.post._id === action.payload.data._id) {
          state.post = action.payload.data;
        }
        state.posts = state.posts.map((post) =>
          post._id === action.payload.data._id ? action.payload.data : post
        );
      })
      .addCase(updatePostStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Map posts cases
      .addCase(getMapPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getMapPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.mapPosts = action.payload.data;
      })
      .addCase(getMapPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { setFilters, resetFilters, resetPostState } = postSlice.actions;
export default postSlice.reducer; 