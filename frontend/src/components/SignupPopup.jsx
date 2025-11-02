import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

const SignupPopup = ({ isOpen, onClose }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    setLoading(true);

    try {
      // Remove confirmPassword before sending to API
      const { ...userData } = formData;

      const result = await register(userData);
      if (result.success) {
        // Reset form
        setFormData({ name: "", email: "", password: "" });
        // Close popup
        onClose();
      } else {
        setError(result.error || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred during registration");
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
          <h2>Sign Up</h2>
          <button type="button" className="close-btn" onClick={onClose}>
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="popup-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
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
              placeholder="Create a password"
            />
          </div>

          <div className="form-footer">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="or-divider">
            <span>OR</span>
          </div>

          <button
            type="button"
            className="google-btn"
            onClick={() => {
              window.location.href = "http://localhost:1000/api/users/google";
            }}
          >
            <span>🔍</span> Sign up with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignupPopup;