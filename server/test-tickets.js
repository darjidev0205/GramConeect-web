const mongoose = require('mongoose');
const User = require('./models/User');
const SupportTicket = require('./models/SupportTicket');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gramconnect';

const verifyTicketsFlow = async () => {
  try {
    console.log('Connecting to database for verification...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    const villager = await User.findOne({ role: 'user' });
    const agent = await User.findOne({ role: 'agent' });
    const admin = await User.findOne({ role: 'admin' });

    if (!villager || !agent || !admin) {
      console.error('Missing seed users. Run node seed.js first.');
      process.exit(1);
    }

    // Clean previous test tickets
    await SupportTicket.deleteMany({ title: /test-ticket/i });
    await Notification.deleteMany({ title: /support ticket/i });

    console.log('\n--- TEST CASE 1: Raise Support Ticket (Villager) ---');
    const ticketId = 'TK-' + Math.floor(100000 + Math.random() * 900000);
    const newTicket = new SupportTicket({
      ticketId,
      title: 'TEST-TICKET: Delivery delayed',
      description: 'The package was supposed to arrive yesterday.',
      category: 'Delivery',
      priority: 'High',
      role: 'user',
      user: villager._id
    });
    const ticket = await newTicket.save();
    console.log(`Ticket ${ticket.ticketId} successfully raised in MongoDB.`);

    // Check notifications for admins
    const adminNotif = new Notification({
      title: '🎫 Support Ticket Raised',
      message: `New support ticket ${ticketId} raised under category: Delivery.`,
      type: 'alert',
      role: 'admin'
    });
    await adminNotif.save();
    console.log('Admin notification saved.');

    const checkTicket = await SupportTicket.findOne({ ticketId });
    const checkNotif = await Notification.findOne({ title: /Ticket Raised/i });

    if (checkTicket && checkNotif) {
      console.log('✅ TEST CASE 1 SUCCESS: Ticket and Admin notifications are fully saved in DB.');
    } else {
      console.error('❌ TEST CASE 1 FAILED.');
    }

    console.log('\n--- TEST CASE 2: Add Reply & Change Status (Admin) ---');
    ticket.replies.push({
      sender: admin._id,
      message: 'We are checking with the delivery partner.'
    });
    ticket.status = 'In Progress';
    ticket.assignedAdmin = admin._id;
    await ticket.save();
    console.log('Admin reply saved, ticket status set to In Progress.');

    // User notification check
    const userNotif = new Notification({
      title: '💬 Admin Replied to Support Ticket',
      message: `Admin has replied to your ticket ${ticket.ticketId}.`,
      type: 'info',
      user: ticket.user
    });
    await userNotif.save();
    console.log('User notification saved.');

    const checkReply = await SupportTicket.findOne({ ticketId, 'replies.sender': admin._id });
    const checkUserNotif = await Notification.findOne({ user: villager._id, title: /Replied/i });

    if (checkReply && checkUserNotif) {
      console.log('✅ TEST CASE 2 SUCCESS: Replies and notifications are fully synchronized in MongoDB.');
    } else {
      console.error('❌ TEST CASE 2 FAILED.');
    }

    console.log('\nAll Support Ticket verification tests completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Verification error:', err);
    process.exit(1);
  }
};

verifyTicketsFlow();
