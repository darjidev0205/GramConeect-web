const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  trackingId: { type: String, required: true, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  hub: { type: mongoose.Schema.Types.ObjectId, ref: 'Hub', required: true },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  packageDetails: {
    weight: { type: Number },
    description: { type: String },
  },
  deliveryAddress: {
    address: { type: String },
    landmark: { type: String },
    lat: { type: Number },
    lng: { type: Number }
  },
  status: { 
    type: String, 
    enum: ['pending', 'at_hub', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  otp: { type: String }, // For delivery confirmation
  cost: { type: Number },
  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date }
});

module.exports = mongoose.model('Order', orderSchema);
