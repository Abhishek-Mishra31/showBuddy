import React, { useState, useMemo } from 'react';
import { useMovies } from '../context/MovieContext';
import MovieCard from './MovieCard';
import MovieForm from './MovieForm';
import { MOVIE_GENRES, SORT_OPTIONS } from '../utils/constants';
import { debounce } from '../utils/helpers';

const MovieList = () => {
  const {
    movies,
    loading,
    error,
    searchTerm,
    filterGenre,
    sortOptions,
    setSearchTerm,
    setFilterGenre,
    setSortOptions,
    getFilteredMovies,
  } = useMovies();

  const [showForm, setShowForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);

  // Debounced search function
  // eslint-disable-next-line no-unused-vars
  const debouncedSearch = useMemo(
    () => debounce((term) => setSearchTerm(term), 300),
    [setSearchTerm]
  );

  const handleGenreFilter = (genre) => {
    setFilterGenre(genre === filterGenre ? '' : genre);
  };

  const handleSortChange = (field) => {
    const newOrder = sortOptions.field === field && sortOptions.order === 'asc' ? 'desc' : 'asc';
    setSortOptions({ field, order: newOrder });
  };

  const handleAddMovie = () => {
    setEditingMovie(null);
    setShowForm(true);
  };

  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMovie(null);
  };

  const handleFormSuccess = () => {
    // Form will close automatically, movies will be refetched by context
  };

  const filteredMovies = getFilteredMovies();

  if (error) {
    return (
      <div className="error-container">
        <div className="error-content">
          <div className="error-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="error-title">Error Loading Movies</h2>
          <p className="error-message">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="error-retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="movie-list-page">
      {/* Search and Filter Header */}
      <div className="movie-list-header">
        <div className="movie-list-container">
          {/* Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search movies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Filters and Sort */}
          <div className="filters-sort-section">
            {/* Genre Filters */}
            <div className="genre-filters">
              <button
                onClick={() => handleGenreFilter('')}
                className={`genre-btn ${
                  !filterGenre ? 'active' : 'inactive'
                }`}
              >
                All Genres
              </button>
              {MOVIE_GENRES.slice(0, 6).map(genre => (
                <button
                  key={genre}
                  onClick={() => handleGenreFilter(genre)}
                  className={`genre-btn ${
                    filterGenre === genre ? 'active' : 'inactive'
                  }`}
                >
                  {genre}
                </button>
              ))}
              
              {/* More Genres Dropdown */}
              <div className="genre-dropdown">
                <button className="genre-btn inactive">
                  More...
                </button>
                <div className="genre-dropdown-content">
                  <div className="genre-dropdown-grid">
                    {MOVIE_GENRES.slice(6).map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleGenreFilter(genre)}
                        className={`genre-dropdown-btn ${
                          filterGenre === genre ? 'active' : ''
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sort Options */}
            <div className="sort-section">
              <span className="sort-label">Sort by:</span>
              {SORT_OPTIONS.map(option => (
                <button
                  key={option.field}
                  onClick={() => handleSortChange(option.field)}
                  className={`sort-btn ${
                    sortOptions.field === option.field ? 'active' : 'inactive'
                  }`}
                >
                  {option.label}
                  {sortOptions.field === option.field && (
                    <svg
                      className={`sort-icon ${
                        sortOptions.order === 'desc' ? 'desc' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Results Summary */}
          <div className="results-summary">
            <p className="results-text">
              {loading ? (
                'Loading movies...'
              ) : (
                <>
                  Showing {filteredMovies.length} of {movies.length} movies
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterGenre && ` in ${filterGenre}`}
                </>
              )}
            </p>
            
          </div>
        </div>
      </div>

      {/* Movies Grid */}
      <div className="movies-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-content">
              <div className="loading-spinner">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <p className="loading-text">Loading movies...</p>
            </div>
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4zM6 6v12h12V6H6zm3 3a1 1 0 112 0v6a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V9z" />
              </svg>
            </div>
            <h3 className="empty-title">
              {searchTerm || filterGenre ? 'No movies found' : 'No movies yet'}
            </h3>
            <p className="empty-description">
              {searchTerm || filterGenre
                ? 'Try adjusting your search or filter criteria'
                : 'Start building your movie collection by adding your first movie'}
            </p>
            {!searchTerm && !filterGenre && (
              <button
                onClick={handleAddMovie}
                className="empty-action-btn"
              >
                <svg className="add-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Your First Movie
              </button>
            )}
          </div>
        ) : (
          <div className="movies-grid grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 md:gap-6">
            {filteredMovies.map(movie => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onEdit={handleEditMovie}
              />
            ))}
          </div>
        )}
      </div>

      {/* Movie Form Modal */}
      {showForm && (
        <MovieForm
          movie={editingMovie}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
};

export default MovieList;