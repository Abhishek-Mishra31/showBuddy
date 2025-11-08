import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          throw new Error(data.message || 'Bad request');
        case 404:
          throw new Error(data.message || 'Resource not found');
        case 500:
          throw new Error(data.message || 'Internal server error');
        default:
          throw new Error(data.message || `HTTP Error: ${status}`);
      }
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check if the server is running.');
    } else {
      throw new Error('An unexpected error occurred');
    }
  }
);

// API URL
// eslint-disable-next-line no-unused-vars
const API_URL = process.env.REACT_APP_API_URL;

// Auth API functions
export const authAPI = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await api.post('/users/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post('/users/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
};

// Movie API functions
export const movieAPI = {
  // Get all movies
  getAllMovies: async () => {
    try {
      const response = await api.get('/movies');
      return response.data; // Backend returns { success: true, count: number, data: movies[] }
    } catch (error) {
      console.error('Error fetching movies:', error);
      throw error;
    }
  },

  // Get movie by ID
  getMovieById: async (id) => {
    try {
      const response = await api.get(`/movies/${id}`);
      return response.data; // Backend returns { success: true, data: movie }
    } catch (error) {
      console.error(`Error fetching movie with ID ${id}:`, error);
      throw error;
    }
  },

  // Create new movie
  createMovie: async (movieData) => {
    try {
      // Backend expects: { title, year, genre, ratings }
      const backendData = {
        title: movieData.title,
        year: parseInt(movieData.year),
        genre: movieData.genre,
        ratings: parseFloat(movieData.rating || movieData.ratings)
      };
      const response = await api.post('/movies', backendData);
      return response.data; // Backend returns { success: true, message: string, data: movie }
    } catch (error) {
      console.error('Error creating movie:', error);
      throw error;
    }
  },

  // Update movie
  updateMovie: async (id, movieData) => {
    try {
      // Backend expects: { title, year, genre, ratings }
      const backendData = {
        title: movieData.title,
        year: parseInt(movieData.year),
        genre: movieData.genre,
        ratings: parseFloat(movieData.rating || movieData.ratings)
      };
      const response = await api.put(`/movies/${id}`, backendData);
      return response.data; // Backend returns { success: true, message: string, data: movie }
    } catch (error) {
      console.error(`Error updating movie with ID ${id}:`, error);
      throw error;
    }
  },

  // Delete movie
  deleteMovie: async (id) => {
    try {
      const response = await api.delete(`/movies/${id}`);
      return response.data; // Backend returns { success: true, message: string }
    } catch (error) {
      console.error(`Error deleting movie with ID ${id}:`, error);
      throw error;
    }
  },

  // Search movies (client-side filtering for now)
  searchMovies: async (query) => {
    try {
      const response = await api.get('/movies');
      const movies = response.data.data || [];
      
      if (!query) return { success: true, data: movies };
      
      const searchTerm = query.toLowerCase();
      const filteredMovies = movies.filter(movie => 
        movie.title.toLowerCase().includes(searchTerm) ||
        movie.genre.toLowerCase().includes(searchTerm)
      );
      
      return { success: true, data: filteredMovies };
    } catch (error) {
      console.error('Error searching movies:', error);
      throw error;
    }
  },

  // Get movies by genre (client-side filtering for now)
  getMoviesByGenre: async (genre) => {
    try {
      const response = await api.get('/movies');
      const movies = response.data.data || [];
      
      if (!genre) return { success: true, data: movies };
      
      const filteredMovies = movies.filter(movie => movie.genre === genre);
      return { success: true, data: filteredMovies };
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
      throw error;
    }
  }
};

// Health check function
export const healthCheck = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

export default api;