const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Movie = require('../models/Movie');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const { userEmail, status } = req.query;
    let query = {};
    
    if (userEmail) {
      query.userEmail = userEmail;
    }
    
    if (status) {
      query.status = status;
    }
    
    const bookings = await Booking.find(query)
      .populate('movieId', 'title genre year ratings')
      .sort({ bookingDate: -1 });
    
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ 
      message: 'Error fetching bookings', 
      error: error.message 
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOne({ 
      $or: [
        { _id: req.params.id },
        { bookingId: req.params.id }
      ]
    }).populate('movieId', 'title genre year ratings');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ 
      message: 'Error fetching booking', 
      error: error.message 
    });
  }
});

// Create new booking
// Create new booking (protected)
router.post('/', auth, async (req, res) => {
  try {
    const {
      movieId,
      movieTitle,
      theater,
      date,
      time,
      seats,
      totalAmount,
      paymentMethod
    } = req.body;

    // Validate required fields
    if (!movieId || !movieTitle || !theater || !date || !time || !seats || !totalAmount || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        required: ['movieId', 'movieTitle', 'theater', 'date', 'time', 'seats', 'totalAmount', 'paymentMethod']
      });
    }

    // Verify movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // Get user details from auth token
    const user = await User.findById(req.user.id).select('name email');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }

    // Create new booking
    const booking = new Booking({
      movieId,
      movieTitle,
      theater,
      date: new Date(date),
      time,
      seats,
      totalAmount,
      paymentMethod,
      userEmail: user.email,
      userName: user.name || 'User'
    });

    const savedBooking = await booking.save();
    
    // Populate movie details
    await savedBooking.populate('movieId', 'title genre year ratings');
    
    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ 
      message: 'Error creating booking', 
      error: error.message 
    });
  }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['upcoming', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status. Must be: upcoming, completed, or cancelled' 
      });
    }
    
    const booking = await Booking.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { bookingId: req.params.id }
        ]
      },
      { status },
      { new: true }
    ).populate('movieId', 'title genre year ratings');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({
      message: 'Booking status updated successfully',
      booking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ 
      message: 'Error updating booking status', 
      error: error.message 
    });
  }
});

// Cancel booking
router.delete('/:id', async (req, res) => {
  try {
    const booking = await Booking.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { bookingId: req.params.id }
        ]
      },
      { 
        status: 'cancelled',
        paymentStatus: 'refunded'
      },
      { new: true }
    ).populate('movieId', 'title genre year ratings');
    
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ 
      message: 'Error cancelling booking', 
      error: error.message 
    });
  }
});

// Get booking statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { userEmail } = req.query;
    let matchQuery = {};
    
    if (userEmail) {
      matchQuery.userEmail = userEmail;
    }
    
    const stats = await Booking.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          upcomingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'upcoming'] }, 1, 0] }
          },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
          }
        }
      }
    ]);
    
    res.json(stats[0] || {
      totalBookings: 0,
      totalRevenue: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0
    });
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    res.status(500).json({ 
      message: 'Error fetching booking statistics', 
      error: error.message 
    });
  }
});

module.exports = router;