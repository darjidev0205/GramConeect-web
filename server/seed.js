const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const Hub = require('./models/Hub');

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gramconnect';

const seedDatabase = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Clean existing collections
    console.log('Clearing old collections...');
    await User.deleteMany({});
    await Hub.deleteMany({});
    console.log('Collections cleared.');

    // 2. Hash passwords
    console.log('Hashing passwords...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // 3. Seed Users
    console.log('Seeding users...');
    const villager = new User({
      name: 'Krishna Villager',
      email: 'villager@test.com',
      phone: '9974712552',
      password: hashedPassword,
      role: 'user',
      location: {
        address: 'Village Sector 3, Gujarat',
        landmark: 'Panchayat Gate',
        lat: 20.5937,
        lng: 78.9629
      }
    });

    const agent = new User({
      name: 'Rajesh Partner',
      email: 'agent@test.com',
      phone: '9876543210',
      password: hashedPassword,
      role: 'agent',
      location: {
        address: 'Hub Junction, Gujarat',
        landmark: 'Main Highway Circle',
        lat: 20.5980,
        lng: 78.9680
      },
      vehicle: {
        type: 'motorcycle',
        number: 'GJ-01-XX-9999',
        licenseNumber: 'DL-123456789'
      }
    });

    const admin = new User({
      name: 'System Administrator',
      email: 'admin@test.com',
      phone: '9000010000',
      password: hashedPassword,
      role: 'admin',
      location: {
        address: 'Logistics Headquarters, Ahmedabad',
        landmark: 'District Collector Office',
        lat: 23.0225,
        lng: 72.5714
      }
    });

    const savedVillager = await villager.save();
    const savedAgent = await agent.save();
    const savedAdmin = await admin.save();
    console.log('Users seeded successfully:');
    console.log(`- Villager: ${savedVillager.email} (pass: password123)`);
    console.log(`- Agent: ${savedAgent.email} (pass: password123)`);
    console.log(`- Admin: ${savedAdmin.email} (pass: password123)`);

    // 4. Seed Hubs
    console.log('Seeding regional hubs...');
    const hubsData = [
      {
        name: 'Main Panchayat Hub',
        address: 'Panchayat Office Road, Sector 1',
        location: { lat: 20.5937, lng: 78.9629 },
        manager: savedAdmin._id,
        isActive: true
      },
      {
        name: 'Primary School Hub',
        address: 'School Compound, Sector 4',
        location: { lat: 20.6050, lng: 78.9700 },
        manager: savedAdmin._id,
        isActive: true
      },
      {
        name: 'Rural Market Hub',
        address: 'Old Market Yard, Sector 2',
        location: { lat: 20.5800, lng: 78.9550 },
        manager: savedAdmin._id,
        isActive: true
      }
    ];

    const seededHubs = await Hub.insertMany(hubsData);
    console.log('Hubs seeded successfully:');
    seededHubs.forEach(h => console.log(`- Hub: ${h.name} at coordinates [${h.location.lat}, ${h.location.lng}]`));

    console.log('Database Seeding finished successfully.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding process error:', err);
    process.exit(1);
  }
};

seedDatabase();
