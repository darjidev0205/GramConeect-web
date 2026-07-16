const express = require('express');
const router = express.Router();
const Hub = require('../models/Hub');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get all hubs (public/user/agent/admin)
router.get('/', async (req, res) => {
  try {
    const hubs = await Hub.find();
    res.json(hubs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create a hub (admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const newHub = new Hub(req.body);
    const hub = await newHub.save();
    res.json(hub);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update a hub (admin only)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hub = await Hub.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!hub) return res.status(404).json({ message: 'Hub not found' });
    res.json(hub);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Delete a hub (admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const hub = await Hub.findByIdAndDelete(req.params.id);
    if (!hub) return res.status(404).json({ message: 'Hub not found' });
    res.json({ message: 'Hub deleted successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
