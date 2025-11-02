import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovies } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getStarRating, getPosterUrl } from '../utils/helpers';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { movies } = useMovies();
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [movie, setMovie] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTheater, setSelectedTheater] = useState('');
  

  // Mock data for theaters and showtimes
  const theaters = [
    { id: 1, name: 'PVR Cinemas', location: 'Mall Road' },
    { id: 2, name: 'INOX', location: 'City Center' },
    { id: 3, name: 'Cinepolis', location: 'Downtown' },
    { id: 4, name: 'Multiplex', location: 'Central Plaza' }
  ];

  const showtimes = ['10:00 AM', '1:00 PM', '4:00 PM', '7:00 PM', '10:00 PM'];

  // Generate next 7 days
  const getNext7Days = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        date: date.toISOString().split('T')[0],
        display: date.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric'
        })
      });
    }
    return dates;
  };

  const dates = getNext7Days();

  useEffect(() => {
    const foundMovie = movies.find(m => m._id === id);
    setMovie(foundMovie);

    // Set default selections
    if (dates.length > 0) setSelectedDate(dates[0].date);
    if (showtimes.length > 0) setSelectedTime(showtimes[0]);
    if (theaters.length > 0) setSelectedTheater(theaters[0].id);
  }, [id, movies]);

  const handleBooking = () => {
    if (!selectedDate || !selectedTime || !selectedTheater) {
      toast.error('Please select date, time, and theater');
      return;
    }

    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error('you need to login or register first to book any show');
      return;
    }

    const bookingData = {
      movieId: movie._id,
      movieTitle: movie.title,
      date: selectedDate,
      time: selectedTime,
      theater: theaters.find(t => t.id === parseInt(selectedTheater)),
    };

    // Navigate to seat selection
    navigate('/seat-selection', { state: bookingData });
  };

  if (!movie) {
    return (
      <div className="movie-details-loading">
        <div className="loading-spinner">🎬</div>
        <p>Loading movie details...</p>
      </div>
    );
  }

  return (
    <div className="movie-details">
      {/* Movie Hero Section */}
      <section className="movie-hero">
        <div className="movie-hero-background">
          <div className="movie-hero-overlay"></div>
          <div className="movie-hero-content">
            <div className="movie-poster-large">
              {movie.posterImage ? (
                <img
                  src={getPosterUrl(movie.posterImage)}
                  alt={`${movie.title} poster`}
                  className="poster-image-large w-40 sm:w-52 md:w-60 lg:w-72 xl:w-80 h-auto object-cover"
                />
              ) : (
                <div className="poster-placeholder-large">
                  <span className="movie-icon-large">🎬</span>
                </div>
              )}
            </div>
            <div className="movie-info-large">
              <h1 className="movie-title-large">{movie.title}</h1>
              <div className="movie-meta-large">
                <span className="movie-year-large">{movie.year}</span>
                <span className="movie-genre-large">{movie.genre}</span>
                <div className="movie-rating-large">
                  <span className="rating-stars-large">
                    {(() => {
                      const stars = getStarRating(movie.ratings);
                      return stars.filled + stars.empty;
                    })()}
                  </span>
                  <span className="rating-value-large">{movie.ratings}/10</span>
                </div>
              </div>
              <p className="movie-description">
                Experience the ultimate cinematic journey with {movie.title}.
                This {movie.genre.toLowerCase()} masterpiece from {movie.year} delivers
                an unforgettable story that will keep you on the edge of your seat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Section */}
      <section className="booking-section">
        <div className="container">
          
          <h2 className="booking-title">Book Your Tickets</h2>

          {/* Date Selection */}
          <div className="booking-step">
            <h3 className="step-title">Select Date</h3>
            <div className="date-grid">
              {dates.map((dateObj) => (
                <button
                  key={dateObj.date}
                  className={`date-btn ${selectedDate === dateObj.date ? 'active' : ''}`}
                  onClick={() => setSelectedDate(dateObj.date)}
                >
                  {dateObj.display}
                </button>
              ))}
            </div>
          </div>

          {/* Theater Selection */}
          <div className="booking-step">
            <h3 className="step-title">Select Theater</h3>
            <div className="theater-grid">
              {theaters.map((theater) => (
                <button
                  key={theater.id}
                  className={`theater-btn ${selectedTheater === theater.id.toString() ? 'active' : ''}`}
                  onClick={() => setSelectedTheater(theater.id.toString())}
                >
                  <div className="theater-name">{theater.name}</div>
                  <div className="theater-location">{theater.location}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection */}
          <div className="booking-step">
            <h3 className="step-title">Select Showtime</h3>
            <div className="time-grid">
              {showtimes.map((time) => (
                <button
                  key={time}
                  className={`time-btn ${selectedTime === time ? 'active' : ''}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
          {/* Booking Summary */}
          <div className="booking-summary">
            <h3 className="summary-title">Booking Summary</h3>
            <div className="summary-details">
              <div className="summary-item flex items-center space-x-3">
                {movie.posterImage ? (
                  <img
                    src={getPosterUrl(movie.posterImage)}
                    alt="poster"
                    className="object-cover rounded w-10 h-auto sm:w-12 md:w-16 lg:w-20 flex-shrink-0"
                  />
                ) : null}
                <div>
                  <span className="summary-label block">Movie:</span>
                  <span className="summary-value">{movie.title}</span>
                </div>
              </div>
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">
                  {dates.find(d => d.date === selectedDate)?.display}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Time:</span>
                <span className="summary-value">{selectedTime}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Theater:</span>
                <span className="summary-value">
                  {theaters.find(t => t.id === parseInt(selectedTheater))?.name}
                </span>
              </div>
            </div>
            <button className="proceed-btn" onClick={handleBooking}>
              Proceed to Seat Selection
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MovieDetails;