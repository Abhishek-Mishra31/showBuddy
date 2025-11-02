import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../services/bookingApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardInputChange = (field, value) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast.error('you need to login or register first to book any show');
      return;
    }
    setIsProcessing(true);
    
    try {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Prepare booking data for API
      const bookingPayload = {
        movieId: bookingData.movieId,
        movieTitle: bookingData.movieTitle,
        theater: bookingData.theater,
        date: bookingData.date,
        time: bookingData.time,
        seats: bookingData.seats,
        totalAmount: bookingData.totalAmount,
        paymentMethod
      };
      
      // Create booking via API
      const response = await createBooking(bookingPayload);
      
      // Create booking confirmation data
      const confirmationData = {
        ...bookingData,
        bookingId: response.booking.bookingId,
        paymentMethod,
        paymentStatus: 'success',
        bookingDate: response.booking.bookingDate
      };
      
      setIsProcessing(false);
      
      // Navigate to confirmation page
      navigate('/booking-confirmation', { state: confirmationData });
    } catch (error) {
      setIsProcessing(false);
      console.error('Payment failed:', error);
      toast.error('Payment failed: ' + error.message);
    }
  };

  if (!bookingData) {
    navigate('/');
    return null;
  }

  return (
    <div className="payment-page">
      <div className="container">
        <div className="payment-container">
          {/* Auth gating handled via toast and disabled actions */}
          {/* Booking Summary */}
          <div className="booking-summary-section">
            <h2 className="section-title">Booking Summary</h2>
            <div className="summary-card">
              <div className="movie-info">
                <h3 className="movie-title">{bookingData.movieTitle}</h3>
                <div className="booking-details">
                  <p><strong>Theater:</strong> {bookingData.theater.name}</p>
                  <p><strong>Location:</strong> {bookingData.theater.location}</p>
                  <p><strong>Date:</strong> {bookingData.date}</p>
                  <p><strong>Time:</strong> {bookingData.time}</p>
                  <p><strong>Seats:</strong> {bookingData.seats.map(seat => seat.id).join(', ')}</p>
                </div>
              </div>
              <div className="price-breakdown">
                <h4>Price Breakdown</h4>
                {bookingData.seats.map((seat, index) => (
                  <div key={index} className="price-item">
                    <span>{seat.id} ({seat.type})</span>
                    <span>₹{seat.price}</span>
                  </div>
                ))}
                <div className="price-item total">
                  <span><strong>Total Amount</strong></span>
                  <span><strong>₹{bookingData.totalAmount}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="payment-section">
            <h2 className="section-title">Payment Details</h2>
            
            {/* Payment Method Selection */}
            <div className="payment-methods">
              <div className="method-tabs">
                <button 
                  className={`method-tab ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  💳 Credit/Debit Card
                </button>
                <button 
                  className={`method-tab ${paymentMethod === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('upi')}
                >
                  📱 UPI
                </button>
                <button 
                  className={`method-tab ${paymentMethod === 'wallet' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  👛 Wallet
                </button>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => handleCardInputChange('number', e.target.value)}
                      maxLength="19"
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        maxLength="3"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label>UPI ID</label>
                    <input
                      type="text"
                      placeholder="yourname@upi"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Wallet Payment */}
              {paymentMethod === 'wallet' && (
                <div className="payment-form">
                  <div className="wallet-options">
                    <div className="wallet-option">
                      <span className="wallet-icon">💰</span>
                      <span>Paytm Wallet</span>
                      <span className="wallet-balance">Balance: ₹2,500</span>
                    </div>
                    <div className="wallet-option">
                      <span className="wallet-icon">📱</span>
                      <span>PhonePe Wallet</span>
                      <span className="wallet-balance">Balance: ₹1,200</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Button */}
            <button 
              className="pay-button"
              onClick={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <span className="spinner">⏳</span>
                  Processing Payment...
                </>
              ) : (
                `Pay ₹${bookingData.totalAmount}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;