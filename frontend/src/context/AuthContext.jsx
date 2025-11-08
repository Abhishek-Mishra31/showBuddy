import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set token in axios headers and localStorage
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
      api.defaults.headers.common['x-auth-token'] = token;
    } else {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['x-auth-token'];
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/users/register', userData);
      const { token, user } = response.data;
      
      setToken(token);
      setAuthToken(token);
      setCurrentUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
      return { success: false, error: error.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/users/login', credentials);
      const { token, user } = response.data;
      
      setToken(token);
      setAuthToken(token);
      setCurrentUser(user);
      
      return { success: true, data: user };
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    setToken(null);
    setAuthToken(null);
    setCurrentUser(null);
  };

  // Load user data
  const loadUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setAuthToken(token);
      const response = await api.get('/users/me');
      setCurrentUser(response.data.user);
    } catch (error) {
      console.error('Error loading user:', error);
      setToken(null);
      setAuthToken(null);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Clear error
  const clearError = () => setError(null);

  // Authenticate using an existing token (e.g., from OAuth redirect)
  const authenticateWithToken = async (incomingToken) => {
    try {
      setAuthToken(incomingToken);
      setToken(incomingToken);
      await loadUser();
      return { success: true };
    } catch (err) {
      console.error('Error authenticating with token:', err);
      return { success: false };
    }
  };

  // Load user on mount and token change
  useEffect(() => {
    loadUser();
    // eslint-disable-next-line
  }, []);

  const value = {
    currentUser,
    token,
    loading,
    error,
    register,
    login,
    logout,
    clearError,
    authenticateWithToken,
    isAuthenticated: !!currentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;