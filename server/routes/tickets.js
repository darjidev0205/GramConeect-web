const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const SupportTicket = require('../models/SupportTicket');
const Notification = require('../models/Notification');
const socketService = require('../services/socket.service');
const { logAction } = require('../services/audit.service');

// Configure upload storage for ticket screenshots/attachments
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'ticket-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/tickets - Create a new support ticket
router.post('/', authenticate, upload.array('attachments', 3), async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required.' });
  }

  try {
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const attachments = req.files ? req.files.map(f => `${baseUrl}/uploads/${f.filename}`) : [];

    const newTicket = new SupportTicket({
      ticketId,
      title,
      description,
      category: category || 'Other',
      priority: priority || 'Low',
      role: req.user.role,
      user: req.user.userId || req.user.id,
      attachments
    });

    const ticket = await newTicket.save();

    // 1. Create DB alert for admins
    const adminNotif = new Notification({
      title: '🎫 Support Ticket Raised',
      message: `New support ticket ${ticketId} raised under category: ${category}.`,
      type: 'alert',
      role: 'admin'
    });
    await adminNotif.save();

    // 2. Emit Socket
    socketService.notifyRole('admin', adminNotif);
    socketService.emitDashboardUpdate({ type: 'new_ticket', ticket });

    // 3. Log Audit action
    await logAction('create_ticket', req.user.userId, `Support ticket ${ticketId} created`, req.ip);

    res.status(201).json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error creating support ticket.' });
  }
});

// GET /api/tickets - Retrieve tickets (role-scoped)
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    const userId = req.user.userId || req.user.id;

    if (req.user.role !== 'admin') {
      // User or Agent only sees their own tickets
      query.user = userId;
    } else {
      // Admin sees everything, supports filters & search
      const { status, priority, category, search } = req.query;
      if (status) query.status = status;
      if (priority) query.priority = priority;
      if (category) query.category = category;
      if (search) {
        query.$or = [
          { ticketId: { $regex: search, $options: 'i' } },
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
    }

    const tickets = await SupportTicket.find(query)
      .populate('user', 'name email role phone')
      .populate('assignedAdmin', 'name email')
      .populate('replies.sender', 'name email role')
      .sort({ updatedAt: -1 });

    res.json(tickets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving support tickets.' });
  }
});

// GET /api/tickets/:id - Fetch single ticket details
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('user', 'name email role phone')
      .populate('assignedAdmin', 'name email')
      .populate('replies.sender', 'name email role');

    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    // Enforce authorization
    const userId = req.user.userId || req.user.id;
    if (req.user.role !== 'admin' && String(ticket.user?._id || ticket.user) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading ticket details.' });
  }
});

// POST /api/tickets/:id/replies - Add reply to support ticket
router.post('/:id/replies', authenticate, upload.single('attachment'), async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Reply message is required.' });

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const userId = req.user.userId || req.user.id;
    // Enforce authorization
    if (req.user.role !== 'admin' && String(ticket.user) !== String(userId)) {
      return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }

    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const attachmentUrl = req.file ? `${baseUrl}/uploads/${req.file.filename}` : undefined;

    ticket.replies.push({
      sender: userId,
      message,
      attachment: attachmentUrl
    });
    ticket.updatedAt = Date.now();
    await ticket.save();

    // Populate for response
    const populated = await SupportTicket.findById(ticket._id)
      .populate('user', 'name email role phone')
      .populate('assignedAdmin', 'name email')
      .populate('replies.sender', 'name email role');

    // Notify other party
    if (req.user.role === 'admin') {
      // Notify creator (Villager or Agent)
      const userNotif = new Notification({
        title: '💬 Admin Replied to Support Ticket',
        message: `Admin has replied to your ticket ${ticket.ticketId}.`,
        type: 'info',
        user: ticket.user
      });
      await userNotif.save();
      socketService.notifyUser(ticket.user, userNotif);
    } else {
      // Notify admins
      const adminNotif = new Notification({
        title: '💬 New Reply on Support Ticket',
        message: `User ${req.user.name} replied to support ticket ${ticket.ticketId}.`,
        type: 'info',
        role: 'admin'
      });
      await adminNotif.save();
      socketService.notifyRole('admin', adminNotif);
    }

    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding reply.' });
  }
});

// PUT /api/tickets/:id/status - Update ticket status
router.put('/:id/status', authenticate, async (req, res) => {
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Status parameter is required.' });

  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    const userId = req.user.userId || req.user.id;
    // Users can only Close their own tickets; Admins can transition to any status
    if (req.user.role !== 'admin') {
      if (String(ticket.user) !== String(userId) || status !== 'Closed') {
        return res.status(403).json({ message: 'Forbidden: Access denied.' });
      }
    }

    ticket.status = status;
    ticket.updatedAt = Date.now();
    if (status === 'Closed') {
      ticket.closedAt = Date.now();
    }
    await ticket.save();

    // Notify creator
    if (req.user.role === 'admin') {
      const userNotif = new Notification({
        title: `🎫 Ticket Status: ${status}`,
        message: `Your support ticket ${ticket.ticketId} status has changed to: ${status}.`,
        type: status === 'Closed' ? 'success' : 'info',
        user: ticket.user
      });
      await userNotif.save();
      socketService.notifyUser(ticket.user, userNotif);
    }

    await logAction('update_ticket_status', userId, `Support ticket ${ticket.ticketId} status changed to ${status}`, req.ip);

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating status.' });
  }
});

// PUT /api/tickets/:id/priority - Update ticket priority (Admin only)
router.put('/:id/priority', authenticate, authorize('admin'), async (req, res) => {
  const { priority } = req.body;
  try {
    const ticket = await SupportTicket.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { priority, updatedAt: Date.now() } },
      { new: true }
    );
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating priority.' });
  }
});

// PUT /api/tickets/:id/assign - Assign ticket to admin manager (Admin only)
router.put('/:id/assign', authenticate, authorize('admin'), async (req, res) => {
  const { adminId } = req.body;
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    ticket.assignedAdmin = adminId;
    ticket.status = 'Assigned';
    ticket.updatedAt = Date.now();
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error assigning ticket.' });
  }
});

// PUT /api/tickets/:id/rate - User rating resolution
router.put('/:id/rate', authenticate, async (req, res) => {
  const { rating } = req.body;
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found.' });

    if (String(ticket.user) !== String(req.user.userId || req.user.id)) {
      return res.status(403).json({ message: 'Forbidden: Access denied.' });
    }

    ticket.rating = rating;
    await ticket.save();
    res.json(ticket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error rating resolution.' });
  }
});

// DELETE /api/tickets/:id - Delete ticket (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await SupportTicket.deleteOne({ _id: req.params.id });
    res.json({ message: 'Support ticket deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting ticket.' });
  }
});

module.exports = router;
