const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Technical', 'Delivery', 'Payment', 'Account', 'Profile', 'Bug Report', 'Feature Request', 'Other'],
    default: 'Other'
  },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  status: { 
    type: String, 
    enum: ['Open', 'Assigned', 'In Progress', 'Resolved', 'Closed'],
    default: 'Open'
  },
  role: { type: String, required: true }, // creator's role ('user' or 'agent')
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // creator
  assignedAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  replies: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    attachment: { type: String }, // optional reply attachment
    createdAt: { type: Date, default: Date.now }
  }],
  attachments: [{ type: String }], // files/screenshots list
  rating: { type: Number, min: 1, max: 5 }, // resolution satisfaction rating
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  closedAt: { type: Date }
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
