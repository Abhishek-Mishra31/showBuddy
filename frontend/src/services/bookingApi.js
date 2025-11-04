const API_BASE_URL = process.env.REACT_APP_API_URL

// Get all bookings for a user
export const getUserBookings = async (userEmail, status = null) => {
  try {
    let url = `${API_BASE_URL}/api/bookings?userEmail=${encodeURIComponent(userEmail)}`;
    if (status) {
      url += `&status=${status}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    throw error;
  }
};

// Get booking by ID
export const getBookingById = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    throw error;
  }
};

// Create a new booking
export const createBooking = async (bookingData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'x-auth-token': token } : {})
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

// Update booking status
export const updateBookingStatus = async (bookingId, status) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Cancel booking
export const cancelBooking = async (bookingId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// Get booking statistics
export const getBookingStats = async (userEmail = null) => {
  try {
    let url = `${API_BASE_URL}/bookings/stats/summary`;
    if (userEmail) {
      url += `?userEmail=${encodeURIComponent(userEmail)}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching booking stats:', error);
    throw error;
  }
};