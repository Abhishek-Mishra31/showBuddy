import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { movieAPI } from '../services/api';

// Initial state
const initialState = {
  movies: [],
  loading: false,
  error: null,
  selectedMovie: null,
  searchTerm: '',
  filterGenre: '',
  sortBy: 'title',
  sortOrder: 'desc',
};

// Action types
export const MOVIE_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_MOVIES: 'SET_MOVIES',
  ADD_MOVIE: 'ADD_MOVIE',
  UPDATE_MOVIE: 'UPDATE_MOVIE',
  DELETE_MOVIE: 'DELETE_MOVIE',
  SET_SELECTED_MOVIE: 'SET_SELECTED_MOVIE',
  SET_SEARCH_TERM: 'SET_SEARCH_TERM',
  SET_FILTER_GENRE: 'SET_FILTER_GENRE',
  SET_SORT: 'SET_SORT',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
const movieReducer = (state, action) => {
  switch (action.type) {
    case MOVIE_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case MOVIE_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case MOVIE_ACTIONS.SET_MOVIES:
      return {
        ...state,
        movies: action.payload,
        loading: false,
        error: null,
      };

    case MOVIE_ACTIONS.ADD_MOVIE:
      return {
        ...state,
        movies: [action.payload, ...state.movies],
        loading: false,
        error: null,
      };

    case MOVIE_ACTIONS.UPDATE_MOVIE:
      return {
        ...state,
        movies: state.movies.map(movie =>
          movie._id === action.payload._id ? action.payload : movie
        ),
        selectedMovie: action.payload,
        loading: false,
        error: null,
      };

    case MOVIE_ACTIONS.DELETE_MOVIE:
      return {
        ...state,
        movies: state.movies.filter(movie => movie._id !== action.payload),
        selectedMovie: null,
        loading: false,
        error: null,
      };

    case MOVIE_ACTIONS.SET_SELECTED_MOVIE:
      return {
        ...state,
        selectedMovie: action.payload,
      };

    case MOVIE_ACTIONS.SET_SEARCH_TERM:
      return {
        ...state,
        searchTerm: action.payload,
      };

    case MOVIE_ACTIONS.SET_FILTER_GENRE:
      return {
        ...state,
        filterGenre: action.payload,
      };

    case MOVIE_ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder,
      };

    case MOVIE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const MovieContext = createContext();

// Custom hook to use movie context
export const useMovies = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovies must be used within a MovieProvider');
  }
  return context;
};

// Movie provider component
export const MovieProvider = ({ children }) => {
  const [state, dispatch] = useReducer(movieReducer, initialState);

  // Action creators
  const setLoading = (loading) => {
    dispatch({ type: MOVIE_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: MOVIE_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: MOVIE_ACTIONS.CLEAR_ERROR });
  };

  // Fetch all movies
  const fetchMovies = async () => {
    try {
      setLoading(true);
      const response = await movieAPI.getAllMovies();
      // Backend returns { success: true, count: number, data: movies[] }
      dispatch({ type: MOVIE_ACTIONS.SET_MOVIES, payload: response.data || [] });
    } catch (error) {
      setError(error.message || 'Failed to fetch movies');
    }
  };

  // Fetch movie by ID
  const fetchMovieById = async (id) => {
    try {
      setLoading(true);
      const response = await movieAPI.getMovieById(id);
      // Backend returns { success: true, data: movie }
      dispatch({ type: MOVIE_ACTIONS.SET_SELECTED_MOVIE, payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to fetch movie');
      throw error;
    }
  };

  // Create new movie
  const createMovie = async (movieData) => {
    try {
      setLoading(true);
      const response = await movieAPI.createMovie(movieData);
      // Backend returns { success: true, message: string, data: movie }
      dispatch({ type: MOVIE_ACTIONS.ADD_MOVIE, payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to create movie');
      throw error;
    }
  };

  // Update movie
  const updateMovie = async (id, movieData) => {
    try {
      setLoading(true);
      const response = await movieAPI.updateMovie(id, movieData);
      // Backend returns { success: true, message: string, data: movie }
      dispatch({ type: MOVIE_ACTIONS.UPDATE_MOVIE, payload: response.data });
      return response.data;
    } catch (error) {
      setError(error.message || 'Failed to update movie');
      throw error;
    }
  };

  // Delete movie
  const deleteMovie = async (id) => {
    try {
      setLoading(true);
      await movieAPI.deleteMovie(id);
      dispatch({ type: MOVIE_ACTIONS.DELETE_MOVIE, payload: id });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Set selected movie
  const setSelectedMovie = (movie) => {
    dispatch({ type: MOVIE_ACTIONS.SET_SELECTED_MOVIE, payload: movie });
  };

  // Set search term
  const setSearchTerm = (term) => {
    dispatch({ type: MOVIE_ACTIONS.SET_SEARCH_TERM, payload: term });
  };

  // Set filter genre
  const setFilterGenre = (genre) => {
    dispatch({ type: MOVIE_ACTIONS.SET_FILTER_GENRE, payload: genre });
  };

  // Set sort options
  const setSortOptions = (options) => {
    dispatch({ 
      type: MOVIE_ACTIONS.SET_SORT, 
      payload: { 
        sortBy: options.field, 
        sortOrder: options.order 
      } 
    });
  };

  // Get filtered and sorted movies
  const getFilteredMovies = () => {
    let filtered = [...state.movies];

    // Apply search filter
    if (state.searchTerm) {
      filtered = filtered.filter(movie =>
        movie.title.toLowerCase().includes(state.searchTerm.toLowerCase()) ||
        movie.genre.toLowerCase().includes(state.searchTerm.toLowerCase())
      );
    }

    // Apply genre filter
    if (state.filterGenre) {
      filtered = filtered.filter(movie =>
        movie.genre.toLowerCase() === state.filterGenre.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (state.sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'year':
          aValue = a.year;
          bValue = b.year;
          break;
        case 'rating':
          // Backend uses 'ratings' field
          aValue = a.ratings || 0;
          bValue = b.ratings || 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt || 0);
          bValue = new Date(b.createdAt || 0);
          break;
        default:
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
      }

      if (state.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // Load movies on component mount
  useEffect(() => {
    fetchMovies();
    // eslint-disable-next-line
  }, []);

  const value = {
    ...state,
    
    // Computed values
    filteredMovies: getFilteredMovies(),
    
    // Provide sortOptions in expected format
    sortOptions: {
      field: state.sortBy,
      order: state.sortOrder,
    },
    
    // Actions
    fetchMovies,
    fetchMovieById,
    createMovie,
    updateMovie,
    deleteMovie,
    setSelectedMovie,
    setSearchTerm,
    setFilterGenre,
    setSortOptions,
    clearError,
    getFilteredMovies,
  };

  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );
};

export default MovieContext;