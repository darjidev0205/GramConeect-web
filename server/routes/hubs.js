const express = require('express');
const router = express.Router();
const Hub = require('../models/Hub');
const auth = require('../middleware/auth');

// Get all hubs (public/user)
router.get('/', async (req, res) => {
  try {
    const hubs = await Hub.find();
    res.json(hubs);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create a hub (admin only)
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const newHub = new Hub(req.body);
    const hub = await newHub.save();
    res.json(hub);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
