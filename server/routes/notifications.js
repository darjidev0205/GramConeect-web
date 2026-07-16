const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');
const Notification = require('../models/Notification');

// GET all notifications for the authenticated user
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    const notifications = await Notification.find({
      $or: [
        { user: userId },
        { role: role },
        { user: null, role: { $exists: false } },
        { user: null, role: null }
      ]
    }).sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

// PUT mark all notifications as read for current user (Route must precede :id match)
router.put('/read-all', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const role = req.user.role;

    await Notification.updateMany(
      {
        $or: [
          { user: userId },
          { role: role }
        ],
        read: false
      },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating notifications status' });
  }
});

// PUT mark notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.json(notification);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating notification status' });
  }
});

// DELETE a notification
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await Notification.deleteOne({ _id: req.params.id });
    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting notification' });
  }
});

module.exports = router;
