import React, { useState, useEffect } from 'react';
import { useMovies } from '../context/MovieContext';
import { getBookingStats } from '../services/bookingApi';
import { useToast } from '../context/ToastContext';

const Admin = () => {
  const { movies, loading: moviesLoading, createMovie, updateMovie, deleteMovie } = useMovies();
  const [bookingStats, setBookingStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [movieForm, setMovieForm] = useState({
    title: '',
    year: '',
    genre: '',
    ratings: ''
  });
  const [editingMovie, setEditingMovie] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchBookingStats();
  }, []);

  const fetchBookingStats = async () => {
    try {
      setStatsLoading(true);
      const stats = await getBookingStats();
      setBookingStats(stats);
    } catch (error) {
      console.error('Error fetching booking stats:', error);
      toast.error('Failed to fetch booking statistics: ' + error.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMovie) {
        await updateMovie(editingMovie._id, movieForm);
        toast.success('Movie updated successfully');
        setEditingMovie(null);
      } else {
        await createMovie(movieForm);
        toast.success('Movie created successfully');
      }
      setMovieForm({ title: '', year: '', genre: '', ratings: '' });
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error('Error saving movie: ' + error.message);
    }
  };

  const handleEditMovie = (movie) => {
    setMovieForm({
      title: movie.title,
      year: movie.year.toString(),
      genre: movie.genre,
      ratings: movie.ratings.toString()
    });
    setEditingMovie(movie);
    setActiveTab('movies');
  };

  const handleDeleteMovie = async (movieId) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteMovie(movieId);
        toast.success('Movie deleted successfully');
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error('Error deleting movie: ' + error.message);
      }
    }
  };

  const resetForm = () => {
    setMovieForm({ title: '', year: '', genre: '', ratings: '' });
    setEditingMovie(null);
  };

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <p>Manage movies and view booking statistics</p>
        </div>

        <div className="admin-tabs">
          <button 
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            📊 Dashboard
          </button>
          <button 
            className={`tab-btn ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            🎬 Movies
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="dashboard-section">
            <h2>Booking Statistics</h2>
            {statsLoading ? (
              <div className="loading">Loading statistics...</div>
            ) : bookingStats ? (
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📊</div>
                  <div className="stat-content">
                    <h3>{bookingStats.totalBookings || 0}</h3>
                    <p>Total Bookings</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <h3>₹{bookingStats.totalRevenue || 0}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏰</div>
                  <div className="stat-content">
                    <h3>{bookingStats.upcomingBookings || 0}</h3>
                    <p>Upcoming Bookings</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <div className="stat-content">
                    <h3>{bookingStats.completedBookings || 0}</h3>
                    <p>Completed Bookings</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❌</div>
                  <div className="stat-content">
                    <h3>{bookingStats.cancelledBookings || 0}</h3>
                    <p>Cancelled Bookings</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🎬</div>
                  <div className="stat-content">
                    <h3>{movies.length}</h3>
                    <p>Total Movies</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-stats">No statistics available</div>
            )}
          </div>
        )}

        {activeTab === 'movies' && (
          <div className="movies-section">
            <div className="movie-form-section">
              <h2>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
              <form onSubmit={handleMovieSubmit} className="movie-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={movieForm.title}
                      onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year</label>
                    <input
                      type="number"
                      value={movieForm.year}
                      onChange={(e) => setMovieForm({...movieForm, year: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Genre</label>
                    <select
                      value={movieForm.genre}
                      onChange={(e) => setMovieForm({...movieForm, genre: e.target.value})}
                      required
                    >
                      <option value="">Select Genre</option>
                      <option value="Action">Action</option>
                      <option value="Comedy">Comedy</option>
                      <option value="Drama">Drama</option>
                      <option value="Horror">Horror</option>
                      <option value="Romance">Romance</option>
                      <option value="Sci-Fi">Sci-Fi</option>
                      <option value="Thriller">Thriller</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={movieForm.ratings}
                      onChange={(e) => setMovieForm({...movieForm, ratings: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingMovie ? 'Update Movie' : 'Add Movie'}
                  </button>
                  {editingMovie && (
                    <button type="button" onClick={resetForm} className="btn-secondary">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="movies-list-section">
              <h2>Manage Movies</h2>
              {moviesLoading ? (
                <div className="loading">Loading movies...</div>
              ) : (
                <div className="movies-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Year</th>
                        <th>Genre</th>
                        <th>Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movies.map(movie => (
                        <tr key={movie._id}>
                          <td>{movie.title}</td>
                          <td>{movie.year}</td>
                          <td>{movie.genre}</td>
                          <td>{movie.ratings}/10</td>
                          <td>
                            <button 
                              onClick={() => handleEditMovie(movie)}
                              className="btn-edit"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteMovie(movie._id)}
                              className="btn-delete"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;