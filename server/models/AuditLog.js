const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { type: String, required: true }, // e.g. 'login', 'logout', 'create_order', 'accept_order', 'complete_delivery', 'update_profile'
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  details: { type: String },
  ipAddress: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
