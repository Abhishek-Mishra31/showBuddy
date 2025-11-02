import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserBookings, cancelBooking } from '../services/bookingApi';
import { useToast } from '../context/ToastContext';

const MyBookings = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, past

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        // In a real app, this would come from auth context
        const userEmail = 'user@example.com';
        const response = await getUserBookings(userEmail);
        
        // Transform API response to match component expectations
        const transformedBookings = response.bookings.map(booking => ({
          id: booking.bookingId,
          movieTitle: booking.movieTitle,
          theater: booking.theater,
          date: booking.date,
          time: booking.time,
          seats: booking.seats.map(seat => seat.id),
          totalAmount: booking.totalAmount,
          status: booking.status === 'confirmed' ? 'upcoming' : booking.status,
          bookingDate: new Date(booking.bookingDate).toLocaleDateString()
        }));
        
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        // Fallback to empty array if API fails
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    if (filter === 'upcoming') return booking.status === 'upcoming';
    if (filter === 'past') return booking.status === 'completed';
    return true;
  });

  const handleCancelBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await cancelBooking(bookingId);
        setBookings(bookings.filter(booking => booking.id !== bookingId));
        toast.success('Booking cancelled successfully!');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        toast.error('Failed to cancel booking: ' + error.message);
      }
    }
  };

  const handleDownloadTicket = (booking) => {
    toast.info(`Downloading ticket for ${booking.movieTitle}`);
  };

  if (loading) {
    return (
      <div className="my-bookings-page">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading your bookings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-bookings-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Bookings</h1>
          <p className="page-subtitle">Manage your movie tickets and booking history</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Bookings ({bookings.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'upcoming' ? 'active' : ''}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming ({bookings.filter(b => b.status === 'upcoming').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'past' ? 'active' : ''}`}
            onClick={() => setFilter('past')}
          >
            Past ({bookings.filter(b => b.status === 'completed').length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <div className="no-bookings-icon">🎬</div>
              <h3>No bookings found</h3>
              <p>You haven't made any bookings yet. Start exploring movies!</p>
              <button className="browse-movies-btn" onClick={() => navigate('/')}>
                Browse Movies
              </button>
            </div>
          ) : (
            filteredBookings.map(booking => (
              <div key={booking.id} className={`booking-card ${booking.status}`}>
                <div className="booking-header">
                  <div className="booking-id">
                    <span className="label">Booking ID:</span>
                    <span className="value">{booking.id}</span>
                  </div>
                  <div className={`status-badge ${booking.status}`}>
                    {booking.status === 'upcoming' ? '🎫 Upcoming' : '✅ Completed'}
                  </div>
                </div>

                <div className="booking-content">
                  <div className="movie-info">
                    <h3 className="movie-title">{booking.movieTitle}</h3>
                    <div className="show-details">
                      <div className="detail-item">
                        <span className="icon">🏢</span>
                        <span>{booking.theater.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">📍</span>
                        <span>{booking.theater.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">📅</span>
                        <span>{new Date(booking.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">🕐</span>
                        <span>{booking.time}</span>
                      </div>
                      <div className="detail-item">
                        <span className="icon">💺</span>
                        <span>Seats: {booking.seats.join(', ')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="booking-summary">
                    <div className="amount">
                      <span className="label">Total Amount</span>
                      <span className="value">₹{booking.totalAmount}</span>
                    </div>
                    <div className="booking-date">
                      <span className="label">Booked on</span>
                      <span className="value">
                        {new Date(booking.bookingDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="booking-actions">
                  <button 
                    className="action-btn download"
                    onClick={() => handleDownloadTicket(booking)}
                  >
                    📥 Download Ticket
                  </button>
                  {booking.status === 'upcoming' && (
                    <button 
                      className="action-btn cancel"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      ❌ Cancel Booking
                    </button>
                  )}
                  <button 
                    className="action-btn details"
                    onClick={() => navigate(`/booking-details/${booking.id}`)}
                  >
                    👁️ View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyBookings;