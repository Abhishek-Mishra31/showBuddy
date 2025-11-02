const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true, lowercase: true },
  password: { type: String }, // hashed; empty for oauth users
  googleId: { type: String },
}, { timestamps: true });

userSchema.methods.generateAuthToken = function() {
  return jwt.sign(
    { id: this._id, email: this.email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '30d' }
  );
};

module.exports = mongoose.model('User', userSchema);
