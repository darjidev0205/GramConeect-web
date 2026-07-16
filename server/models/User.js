const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, unique: true, sparse: true }, // unique and sparse so it can be optional but unique if provided
  password: { type: String }, // password optional for OTP-only authentication
  role: { type: String, enum: ['user', 'agent', 'admin'], default: 'user' },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String },
    landmark: { type: String }
  },
  vehicle: {
    type: { type: String }, // e.g. bicycle, motorcycle, auto, pickup
    number: { type: String },
    licenseNumber: { type: String }
  },
  profileImage: { type: String },
  refreshToken: { type: String },
  settings: { type: Object, default: {} },
  availability: { type: Boolean, default: true }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
