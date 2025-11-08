import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import LoginPopup from './LoginPopup';
import SignupPopup from './SignupPopup';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  
  const closeLogin = () => setIsLoginOpen(false);
  const closeSignup = () => setIsSignupOpen(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
    toast.info('Logged out successfully');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🎬</span>
          <span className="logo-text">showBuddy</span>
        </Link>

        {/* Desktop Navigation */}
        <div className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link 
            to="/movies" 
            className={`nav-link ${isActive('/movies') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Movies
          </Link>
          <Link 
            to="/my-bookings" 
            className={`nav-link ${isActive('/my-bookings') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            My Bookings
          </Link>
          <Link 
            to="/admin" 
            className={`nav-link ${isActive('/admin') ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(false)}
          >
            Admin
          </Link>
        </div>


        {/* User Actions */}
        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="user-dropdown">
              <button
                className="welcome-btn"
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-haspopup="true"
                aria-expanded={isDropdownOpen}
                title="Account menu"
              >
                <span className="welcome-text">Welcome {currentUser?.name || currentUser?.email || 'User'}</span>
                <span className={`caret ${isDropdownOpen ? 'open' : ''}`}>▾</span>
              </button>
              {isDropdownOpen && (
                <div className="dropdown-menu" role="menu">
                  <button className="dropdown-item" onClick={handleLogout} role="menuitem">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button className="nav-btn login-btn" onClick={() => setIsLoginOpen(true)}>
                Sign In
              </button>
              <button className="nav-btn signup-btn" onClick={() => setIsSignupOpen(true)}>
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="nav-toggle" onClick={toggleMenu}>
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>
      </div>

      {/* Login Popup */}
      <LoginPopup 
        isOpen={isLoginOpen} 
        onClose={closeLogin} 
      />

      {/* Signup Popup */}
      <SignupPopup 
        isOpen={isSignupOpen} 
        onClose={closeSignup} 
      />
    </nav>
  );
};

export default Navbar;