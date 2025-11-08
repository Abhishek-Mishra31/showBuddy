import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPopup = ({ isOpen, onClose }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(formData);
      if (result.success) {
        // Reset form
        setFormData({ email: '', password: '' });
        // Close popup
        onClose();
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="popup-header">
          <h2>Sign In</h2>
          <button type="button" className="close-btn" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="popup-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
           
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>
          <div className="form-group">
           
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>
          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          </div>
          
          <div className="or-divider">
            <span>OR</span>
          </div>
          
          <button
            type="button"
            className="google-btn"
            onClick={() => {
              window.location.href = "https://showbuddy.onrender.com/api/users/google";
            }}
          >
            <span>🔍</span> Sign in with Google
          </button>
          
          <div className="form-link">
            <a href="/" onClick={(e) => {
              e.preventDefault();

            }}>Forgot Password?</a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPopup;