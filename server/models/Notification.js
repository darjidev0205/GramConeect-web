const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, default: 'info' }, // 'info', 'success', 'alert', 'announcement'
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null means global/announcement
  role: { type: String }, // target role (e.g. 'agent', 'admin', 'user')
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);
