import React from 'react';
import { useMovies } from '../context/MovieContext';
import { getPosterUrl } from '../utils/helpers';
import { useNavigate } from 'react-router-dom';
import { getStarRating } from '../utils/helpers';

const HomePage = () => {
  const { movies, loading } = useMovies();
  const navigate = useNavigate();

  // Hero movie is the first fetched movie
  const heroMovie = movies[0];
  // Show the rest of the movies (exclude hero)
  const featuredMovies = movies.slice(1);

  const handleBookNow = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleViewDetails = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  if (loading) {
    return (
      <section className="hero-section">
        <div className="flex flex-col items-center justify-center z-10">
          <div className="spinner"></div>
          <p className="text-xl font-medium text-white mt-4">Fetching awesome movies for you...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="homepage">
      {/* Hero Section */}
      {heroMovie && (
        <section className="hero-section">
          <div
            className="hero-background bg-cover bg-center"
            style={{
              backgroundImage: heroMovie.posterImage
                ? `url(${getPosterUrl(heroMovie.posterImage)})`
                : 'none',
            }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">{heroMovie.title}</h1>
                <div className="hero-meta">
                  <span className="hero-year">{heroMovie.year}</span>
                  <span className="hero-genre">{heroMovie.genre}</span>
                  <div className="hero-rating">
                    <span className="rating-stars">
                      {(() => {
                        const stars = getStarRating(heroMovie.ratings);
                        return stars.filled + stars.empty;
                      })()}
                    </span>
                    <span className="rating-value">{heroMovie.ratings}/10</span>
                  </div>
                </div>
                <div className="hero-actions">
                  <button 
                    className="btn-primary book-now-btn"
                    onClick={() => handleBookNow(heroMovie._id)}
                  >
                    Book Now
                  </button>
                  <button 
                    className="btn-secondary view-details-btn"
                    onClick={() => handleViewDetails(heroMovie._id)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Movies Section */}
      <section className="featured-section">
        <div className="container">
          <h2 className="section-title">Featured Movies</h2>
          <div className="movies-grid">
            {featuredMovies.map((movie) => (
              <div key={movie._id} className="movie-card-home">
                <div className="movie-poster">
                  {movie.posterImage ? (
                    <img
                      src={getPosterUrl(movie.posterImage)}
                      alt={`${movie.title} poster`}
                      className="poster-image w-full h-64 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className={`poster-placeholder ${movie.posterImage ? 'hidden' : ''}`}>
                    <span className="movie-icon">🎬</span>
                  </div>
                  <div className="movie-overlay">
                    <button 
                      className="overlay-btn book-btn"
                      onClick={() => handleBookNow(movie._id)}
                    >
                      Book Now
                    </button>
                    <button 
                      className="overlay-btn details-btn"
                      onClick={() => handleViewDetails(movie._id)}
                    >
                      Details
                    </button>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <div className="movie-meta">
                    <span className="movie-genre">{movie.genre}</span>
                    <span className="movie-year">{movie.year}</span>
                  </div>
                  <div className="movie-rating">
                    <span className="stars">
                      {(() => {
                        const stars = getStarRating(movie.ratings);
                        return stars.filled + stars.empty;
                      })()}
                    </span>
                    <span className="rating">{movie.ratings}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Browse by Genre</h2>
          <div className="categories-grid">
            {['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi'].map((genre) => (
              <div key={genre} className="category-card" onClick={() => navigate(`/movies?genre=${genre}`)}>
                <div className="category-icon">
                  {genre === 'Action' && '💥'}
                  {genre === 'Comedy' && '😂'}
                  {genre === 'Drama' && '🎭'}
                  {genre === 'Horror' && '👻'}
                  {genre === 'Romance' && '💕'}
                  {genre === 'Sci-Fi' && '🚀'}
                </div>
                <h3 className="category-name">{genre}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;