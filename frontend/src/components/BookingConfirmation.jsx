import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const BookingConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const confirmationData = location.state;
  const toast = useToast();

  if (!confirmationData) {
    navigate('/');
    return null;
  }

  const handleDownloadTicket = () => {
    // Simulate ticket download
    toast.success('Ticket downloaded successfully!');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-container">
          {/* Success Animation */}
          <div className="success-animation">
            <div className="checkmark">✓</div>
            <h1 className="success-title">Booking Confirmed!</h1>
            <p className="success-subtitle">Your tickets have been booked successfully</p>
          </div>

          {/* Ticket Details */}
          <div className="ticket-card">
            <div className="ticket-header">
              <h2 className="booking-id">Booking ID: {confirmationData.bookingId}</h2>
              <div className="qr-code">
                <div className="qr-placeholder">
                  <span className="qr-icon">📱</span>
                  <span className="qr-text">QR Code</span>
                </div>
              </div>
            </div>

            <div className="ticket-body">
              <div className="movie-details">
                <h3 className="movie-title">{confirmationData.movieTitle}</h3>
                <div className="show-details">
                  <div className="detail-row">
                    <span className="label">Theater:</span>
                    <span className="value">{confirmationData.theater.name}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Location:</span>
                    <span className="value">{confirmationData.theater.location}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Date:</span>
                    <span className="value">{new Date(confirmationData.date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Time:</span>
                    <span className="value">{confirmationData.time}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Seats:</span>
                    <span className="value">
                      {confirmationData.seats.map(seat => seat.id).join(', ')}
                    </span>
                  </div>
                  <div className="detail-row total">
                    <span className="label">Total Amount:</span>
                    <span className="value">₹{confirmationData.totalAmount}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ticket-footer">
              <div className="payment-info">
                <span className="payment-status success">✓ Payment Successful</span>
                <span className="payment-method">
                  Paid via {confirmationData.paymentMethod.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button className="download-btn" onClick={handleDownloadTicket}>
              📥 Download Ticket
            </button>
            <button className="home-btn" onClick={handleGoHome}>
              🏠 Go to Home
            </button>
          </div>

          {/* Important Notes */}
          <div className="important-notes">
            <h4>Important Notes:</h4>
            <ul>
              <li>Please arrive at the theater at least 15 minutes before the show time</li>
              <li>Carry a valid ID proof along with this ticket</li>
              <li>Outside food and beverages are not allowed</li>
              <li>Tickets once booked cannot be cancelled or refunded</li>
              <li>Show the QR code at the theater entrance for entry</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;