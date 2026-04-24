const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const auth = require('../middleware/auth');

// Get user orders or agent tasks
router.get('/', auth, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'agent') {
      // Agent sees orders assigned to them or unassigned
      query = { $or: [{ agent: req.user.id }, { agent: { $exists: false } }] };
    }
    const orders = await Order.find(query).populate('hub').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create Order (User)
router.post('/', auth, async (req, res) => {
  try {
    const trackingId = 'GC' + Math.floor(Math.random() * 100000000);
    const newOrder = new Order({
      ...req.body,
      user: req.user.id,
      trackingId,
      otp: Math.floor(1000 + Math.random() * 9000).toString()
    });
    const order = await newOrder.save();
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Update Order Status (Agent/Admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, agentId } = req.body;
    const orderFields = { status };
    if (agentId) orderFields.agent = agentId;
    if (status === 'delivered') orderFields.deliveredAt = Date.now();

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: orderFields },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
