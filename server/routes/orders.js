const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Get user orders, agent tasks, or all orders for admin
router.get('/', authenticate, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'user') {
      query.user = req.user.id;
    } else if (req.user.role === 'agent') {
      // Agent sees orders assigned to them or unassigned/pending
      query = { $or: [{ agent: req.user.id }, { agent: { $exists: false }, status: 'pending' }] };
    }
    // Admin sees everything (query remains empty)
    
    const orders = await Order.find(query)
      .populate('hub')
      .populate('user')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Create Order (Villager/User and Admin only)
router.post('/', authenticate, authorize('user', 'admin'), async (req, res) => {
  try {
    const trackingId = 'GC' + Math.floor(Math.random() * 100000000);
    const newOrder = new Order({
      ...req.body,
      user: req.user.id || req.user.userId,
      trackingId,
      cost: req.body.price || req.body.cost || 50,
      otp: Math.floor(1000 + Math.random() * 9000).toString()
    });
    const order = await newOrder.save();

    // Populate order details for socket emit
    const populatedOrder = await Order.findById(order._id).populate('hub').populate('user');

    // 1. Create database notifications
    const Notification = require('../models/Notification');
    const userNotif = new Notification({
      title: '📦 Delivery Request Placed',
      message: `Your logistics order ${trackingId} has been registered successfully. Pickup at: ${populatedOrder.hub?.name || 'Local Hub'}.`,
      type: 'success',
      user: order.user
    });
    await userNotif.save();

    const adminNotif = new Notification({
      title: '🚨 New Logistics Order',
      message: `Logistics order ${trackingId} has been placed. Waiting for Agent assignment.`,
      type: 'info',
      role: 'admin'
    });
    await adminNotif.save();

    const agentNotif = new Notification({
      title: '🚲 New Task in Pool',
      message: `A new order ${trackingId} is available in your delivery zone.`,
      type: 'info',
      role: 'agent'
    });
    await agentNotif.save();

    // 2. Emit Socket.io notifications
    const socketService = require('../services/socket.service');
    socketService.notifyUser(order.user, userNotif);
    socketService.notifyRole('admin', adminNotif);
    socketService.notifyRole('agent', agentNotif);
    socketService.emitOrderUpdate(populatedOrder);

    // 3. Log Audit action
    const { logAction } = require('../services/audit.service');
    await logAction('create_order', req.user.userId, `Order ${trackingId} created`, req.ip);

    res.json(order);
  } catch (err) {
    console.error('Order creation error:', err);
    res.status(500).send('Server Error');
  }
});

// Update Order Status (Agent and Admin only)
router.put('/:id', authenticate, authorize('agent', 'admin'), async (req, res) => {
  try {
    const { status, agentId } = req.body;
    const orderFields = {};
    if (status !== undefined) orderFields.status = status;
    if (agentId !== undefined) orderFields.agent = agentId;
    if (status === 'delivered') orderFields.deliveredAt = Date.now();

    const oldOrder = await Order.findById(req.params.id);
    if (!oldOrder) return res.status(404).json({ message: 'Order not found' });

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: orderFields },
      { new: true }
    ).populate('hub').populate('user').populate('agent');

    const Notification = require('../models/Notification');
    const socketService = require('../services/socket.service');
    const { logAction } = require('../services/audit.service');

    // Trigger status transition updates
    if (agentId && agentId !== String(oldOrder.agent)) {
      // Agent assigned!
      const agentNotif = new Notification({
        title: '💼 Delivery Assigned',
        message: `You have been assigned to order ${order.trackingId}. Destination address: ${order.deliveryAddress?.address || 'N/A'}.`,
        type: 'success',
        user: agentId
      });
      await agentNotif.save();
      socketService.notifyUser(agentId, agentNotif);

      const userNotif = new Notification({
        title: '🚲 Agent Dispatched',
        message: `Delivery agent ${order.agent?.name || 'Partner'} has been assigned to transport your package ${order.trackingId}.`,
        type: 'info',
        user: order.user?._id
      });
      await userNotif.save();
      socketService.notifyUser(order.user?._id, userNotif);

      await logAction('assign_agent', req.user.userId, `Agent ${agentId} assigned to order ${order.trackingId}`, req.ip);
    }

    if (status && status !== oldOrder.status) {
      let title = '📦 Order Update';
      let message = `Your package ${order.trackingId} status has changed to: ${status.replace('_', ' ')}.`;
      let type = 'info';

      if (status === 'out_for_delivery') {
        title = '🚚 Out for Delivery';
        message = `Your package ${order.trackingId} is out for delivery. Keep your confirmation OTP ready: ${order.otp}.`;
        type = 'alert';
      } else if (status === 'delivered') {
        title = '✅ Package Delivered';
        message = `Your package ${order.trackingId} has been successfully delivered. Thank you!`;
        type = 'success';
      } else if (status === 'cancelled') {
        title = '❌ Order Cancelled';
        message = `Your order ${order.trackingId} has been cancelled.`;
        type = 'alert';
      }

      const statusNotif = new Notification({ title, message, type, user: order.user?._id });
      await statusNotif.save();
      socketService.notifyUser(order.user?._id, statusNotif);

      await logAction('update_order_status', req.user.userId, `Order ${order.trackingId} status changed to ${status}`, req.ip);
    }

    // Emit live socket order update
    socketService.emitOrderUpdate(order);

    res.json(order);
  } catch (err) {
    console.error('Order update error:', err);
    res.status(500).send('Server Error');
  }
});

// Delete Order (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Order.deleteOne({ _id: req.params.id });

    // Log & Emit
    const { logAction } = require('../services/audit.service');
    const socketService = require('../services/socket.service');
    await logAction('delete_order', req.user.userId, `Deleted order ${order.trackingId}`, req.ip);
    socketService.emitOrderUpdate({ _id: req.params.id, deleted: true });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

module.exports = router;
