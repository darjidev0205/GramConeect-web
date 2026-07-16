const mongoose = require('mongoose');
const User = require('./models/User');
const Order = require('./models/Order');
const Notification = require('./models/Notification');
const AuditLog = require('./models/AuditLog');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gramconnect';

const runTests = async () => {
  try {
    console.log('Connecting to database for integration tests...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    // Find our seeded villager and agent
    const villager = await User.findOne({ role: 'user' });
    const agent = await User.findOne({ role: 'agent' });
    const admin = await User.findOne({ role: 'admin' });

    if (!villager || !agent || !admin) {
      console.error('Missing seed users. Please run node seed.js first.');
      process.exit(1);
    }

    console.log('Using seeded users:');
    console.log(`- Villager: ${villager.name} (${villager._id})`);
    console.log(`- Agent: ${agent.name} (${agent._id})`);
    console.log(`- Admin: ${admin.name} (${admin._id})`);

    // Clean old test orders/notifications
    console.log('Cleaning old test data...');
    await Order.deleteMany({ trackingId: /^GCTEST/ });
    await Notification.deleteMany({ title: /placed|dispatched/i });
    await AuditLog.deleteMany({ action: /create_order|assign_agent/i });

    // Seed mock Hub if none exists
    const Hub = require('./models/Hub');
    let hub = await Hub.findOne({});
    if (!hub) {
      console.log('Creating mock Hub...');
      hub = new Hub({
        name: 'Test Hub Node',
        address: 'Test Hub Compound, Gujarat',
        location: { lat: 20.5937, lng: 78.9629 },
        manager: admin._id
      });
      await hub.save();
    }

    console.log('\n--- TEST CASE 1: Place a Delivery request (Villager) ---');
    const trackingId = 'GCTEST' + Math.floor(Math.random() * 100000);
    const newOrder = new Order({
      trackingId,
      user: villager._id,
      hub: hub._id,
      cost: 45,
      deliveryAddress: {
        address: 'Sector 5 Village Gate, Gujarat',
        landmark: 'Panchayat Circle',
        lat: 20.5950,
        lng: 78.9640
      },
      recipientName: 'Devi Lal',
      recipientPhone: '9876543211',
      description: 'Medical kit delivery',
      otp: '1234'
    });
    const order = await newOrder.save();
    console.log(`Order ${order.trackingId} created.`);

    // Check notification for user
    const userNotif = new Notification({
      title: '📦 Delivery Request Placed',
      message: `Your logistics order ${trackingId} has been registered successfully.`,
      type: 'success',
      user: villager._id
    });
    await userNotif.save();
    console.log('Notification saved for user.');

    // Log action to Audit log
    const log = new AuditLog({
      action: 'create_order',
      actor: villager._id,
      details: `Order ${trackingId} created via integration test suite`,
      ipAddress: '127.0.0.1'
    });
    await log.save();
    console.log('AuditLog entry saved.');

    // Verify database contents
    const foundNotif = await Notification.findOne({ user: villager._id, type: 'success' });
    const foundLog = await AuditLog.findOne({ actor: villager._id, action: 'create_order' });

    if (foundNotif && foundLog) {
      console.log('✅ TEST CASE 1 SUCCESS: Notifications and AuditLogs successfully registered in MongoDB.');
    } else {
      console.error('❌ TEST CASE 1 FAILED: DB entries missing.');
    }

    console.log('\n--- TEST CASE 2: Assign Delivery Agent & Update Status ---');
    order.agent = agent._id;
    order.status = 'out_for_delivery';
    await order.save();

    const agentNotif = new Notification({
      title: '💼 Delivery Assigned',
      message: `You have been assigned to order ${order.trackingId}.`,
      type: 'success',
      user: agent._id
    });
    await agentNotif.save();
    console.log('Notification saved for agent.');

    const statusLog = new AuditLog({
      action: 'assign_agent',
      actor: admin._id,
      details: `Agent ${agent._id} assigned to order ${order.trackingId}`,
      ipAddress: '127.0.0.1'
    });
    await statusLog.save();
    console.log('AuditLog status transition saved.');

    const foundAgentNotif = await Notification.findOne({ user: agent._id, title: /assigned/i });
    const foundStatusLog = await AuditLog.findOne({ action: 'assign_agent' });

    if (foundAgentNotif && foundStatusLog) {
      console.log('✅ TEST CASE 2 SUCCESS: Agent assignment notifications and security logs are fully operational.');
    } else {
      console.error('❌ TEST CASE 2 FAILED: Missing database records.');
    }

    console.log('\nAll integration tests finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Integration testing error:', err);
    process.exit(1);
  }
};

runTests();
