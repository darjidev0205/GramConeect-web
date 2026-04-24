const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // We will use this since user didn't explicitly mandate Firebase alone, but JWT in backend requirements.
  role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
  phone: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    landmark: { type: String }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
