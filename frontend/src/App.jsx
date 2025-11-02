import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MovieProvider } from './context/MovieContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import HomePage from './components/HomePage';
import MovieList from './components/MovieList';
import MovieDetails from './components/MovieDetails';
import SeatSelection from './components/SeatSelection';
import Payment from './components/Payment';
import BookingConfirmation from './components/BookingConfirmation';
import MyBookings from './components/MyBookings';
import Admin from './components/Admin';
import './App.css';
import './responsive.css';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MovieProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movies" element={<MovieList />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/seat-selection" element={<SeatSelection />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/booking-confirmation" element={<BookingConfirmation />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/admin" element={<Admin />} />
              </Routes>
            </div>
          </Router>
        </MovieProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;