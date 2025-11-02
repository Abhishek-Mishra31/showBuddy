import React, { useState, useEffect } from 'react';
import paymentAPI from '../services/paymentAPI';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const bookingData = location.state;
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [seatLayout, setSeatLayout] = useState([]);

  // Seat prices
  const seatPrices = {
    premium: 300,
    regular: 200,
    economy: 150
  };

  // Generate seat layout
  useEffect(() => {
    const generateSeatLayout = () => {
      const layout = [];
      const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
      const seatsPerRow = 12;
      
      rows.forEach((row, rowIndex) => {
        const rowSeats = [];
        for (let i = 1; i <= seatsPerRow; i++) {
          const seatId = `${row}${i}`;
          let type = 'regular';
          let isBooked = false;
          
          // Premium seats (first 3 rows)
          if (rowIndex < 3) type = 'premium';
          // Economy seats (last 3 rows)
          else if (rowIndex >= 7) type = 'economy';
          
          // Randomly book some seats (simulate existing bookings)
          if (Math.random() < 0.15) isBooked = true;
          
          rowSeats.push({
            id: seatId,
            row,
            number: i,
            type,
            isBooked,
            isSelected: false
          });
        }
        layout.push(rowSeats);
      });
      
      return layout;
    };

    setSeatLayout(generateSeatLayout());
  }, []);

  const handleSeatClick = (seatId) => {
    const seat = seatLayout.flat().find(s => s.id === seatId);
    if (seat.isBooked) return;

    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < 10) { // Max 10 seats
        setSelectedSeats([...selectedSeats, seatId]);
      } else {
        toast.error('You can select maximum 10 seats');
      }
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seatLayout.flat().find(s => s.id === seatId);
      return total + seatPrices[seat?.type || 'regular'];
    }, 0);
  };

  const handleProceedToPayment = async () => {
    if (!isAuthenticated) {
      toast.error('you need to login or register first to book any show');
      return;
    }
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    const selectedSeatDetails = selectedSeats.map(seatId => {
      const seat = seatLayout.flat().find(s => s.id === seatId);
      return {
        id: seatId,
        type: seat.type,
        price: seatPrices[seat.type]
      };
    });

    const paymentData = {
      ...bookingData,
      seats: selectedSeatDetails,
      totalAmount: calculateTotal(),
      numberOfSeats: selectedSeats.length
    };

    try {
      // 1. create order on backend
      const orderRes = await paymentAPI.createOrder(paymentData.totalAmount, { bookingId: bookingData.movieId });
      if (!orderRes.success) throw new Error('Order creation failed');

      const options = {
        key: orderRes.keyId,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: bookingData.movieTitle,
        description: `${bookingData.theater.name} | ${bookingData.date} ${bookingData.time}`,
        order_id: orderRes.orderId,
        handler: async function (response) {
          const verify = await paymentAPI.verifySignature(response);
          if (verify.success) {
            navigate('/confirmation', { state: { ...paymentData, payment: response } });
          } else {
            toast.error('Payment verification failed');
          }
        },
        theme: { color: '#ff6b6b' },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      console.error(err);
      toast.error('Payment initiation failed');
    }
  };

  if (!bookingData) {
    navigate('/');
    return null;
  }

  return (
    <div className="seat-selection">
      <div className="container">
        {/* Auth gating is handled via toasts and blocking actions */}
        {/* Booking Info Header */}
        <div className="booking-info-header">
          <h1 className="page-title">Select Your Seats</h1>
          <div className="booking-details">
            <span className="detail-item">
              <strong>{bookingData.movieTitle}</strong>
            </span>
            <span className="detail-item">
              {bookingData.theater.name} - {bookingData.theater.location}
            </span>
            <span className="detail-item">
              {bookingData.date} | {bookingData.time}
            </span>
          </div>
        </div>

        {/* Screen */}
        <div className="screen-section">
          <div className="screen">
            <span className="screen-text">SCREEN</span>
          </div>
        </div>

        {/* Seat Legend */}
        <div className="seat-legend">
          <div className="legend-item">
            <div className="seat-demo available"></div>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo selected"></div>
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo booked"></div>
            <span>Booked</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo premium"></div>
            <span>Premium ₹{seatPrices.premium}</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo regular"></div>
            <span>Regular ₹{seatPrices.regular}</span>
          </div>
          <div className="legend-item">
            <div className="seat-demo economy"></div>
            <span>Economy ₹{seatPrices.economy}</span>
          </div>
        </div>

        {/* Seat Layout */}
        <div className="seat-layout">
          {seatLayout.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              <div className="row-label">{row[0]?.row}</div>
            <div className="seats">
              {row.map((seat, seatIndex) => (
                <React.Fragment key={seat.id}>
                    <button
                      className={`seat ${seat.type} ${
                        seat.isBooked ? 'booked' : 
                        selectedSeats.includes(seat.id) ? 'selected' : 'available'
                      }`}
                      onClick={() => handleSeatClick(seat.id)}
                      disabled={seat.isBooked}
                      title={`${seat.id} - ${seat.type} - ₹${seatPrices[seat.type]}`}
                    >
                      {seat.number}
                    </button>
                    {/* Add gap in the middle */}
                    {seatIndex === 5 && <div className="seat-gap"></div>}
                  </React.Fragment>
                ))}
              </div>
              <div className="row-label">{row[0]?.row}</div>
            </div>
          ))}
        </div>

        {/* Booking Summary */}
        {selectedSeats.length > 0 && (
          <div className="booking-summary-fixed">
            <div className="summary-content">
              <div className="selected-seats-info">
                <h3>Selected Seats</h3>
                <div className="selected-seats-list">
                  {selectedSeats.map(seatId => {
                    const seat = seatLayout.flat().find(s => s.id === seatId);
                    return (
                      <span key={seatId} className="selected-seat-tag">
                        {seatId} (₹{seatPrices[seat?.type || 'regular']})
                      </span>
                    );
                  })}
                </div>
              </div>
              <div className="total-section">
                <div className="total-amount">
                  <span className="total-label">Total: </span>
                  <span className="total-value">₹{calculateTotal()}</span>
                </div>
                <button 
                  className="proceed-payment-btn"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SeatSelection;