const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth.middleware');
const User = require('../models/User');
const socketService = require('../services/socket.service');
const { logAction } = require('../services/audit.service');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only web image files (.jpg, .jpeg, .png, .webp) are allowed!'));
  }
});

// GET /api/profile - Fetch current profile
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId || req.user.id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving profile' });
  }
});

// POST /api/profile/upload - Handle file upload and return URL
router.post('/upload', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }
    const baseUrl = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Error uploading file' });
  }
});

// PUT /api/profile - Update full profile info
router.put('/', authenticate, async (req, res) => {
  const { 
    name, email, phone, avatar, address, village, vehicle, 
    emergencyContact, notificationPreferences, language, theme 
  } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required fields.' });
  }

  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Validate duplicate email
    const duplicateEmail = await User.findOne({ 
      email: email.toLowerCase(), 
      _id: { $ne: userId } 
    });
    if (duplicateEmail) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    // Validate duplicate phone
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const duplicatePhone = await User.findOne({ 
        phone: cleanPhone, 
        _id: { $ne: userId } 
      });
      if (duplicatePhone) {
        return res.status(400).json({ message: 'An account with this phone number already exists.' });
      }
      user.phone = cleanPhone;
    }

    // Update Core Fields
    user.name = name;
    user.email = email.toLowerCase();
    if (avatar !== undefined) user.profileImage = avatar;
    
    // Update Address & Village Location
    user.location = {
      ...user.location,
      address: address || user.location?.address,
      landmark: village || user.location?.landmark
    };

    // Update Agent Vehicle
    if (user.role === 'agent' && vehicle) {
      user.vehicle = {
        ...user.vehicle,
        ...vehicle
      };
    }

    // Update settings preferences
    user.settings = {
      ...user.settings,
      emergencyContact,
      notificationPreferences,
      language,
      theme
    };

    await user.save();

    const responseUser = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      vehicle: user.vehicle,
      profileImage: user.profileImage,
      settings: user.settings,
      availability: user.availability
    };

    // 1. Broadcast real-time profile sync across all open socket instances for this user
    socketService.notifyUser(userId, {
      type: 'profile_sync',
      user: responseUser
    });

    // 2. Log Action
    await logAction('update_profile', userId, 'Profile updated via /api/profile PUT endpoint', req.ip);

    res.json(responseUser);
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
});

// DELETE /api/profile/avatar - Remove profile image
router.delete('/avatar', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.profileImage = undefined;
    await user.save();

    const responseUser = {
      id: user._id,
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      vehicle: user.vehicle,
      profileImage: null,
      settings: user.settings,
      availability: user.availability
    };

    socketService.notifyUser(userId, {
      type: 'profile_sync',
      user: responseUser
    });

    res.json(responseUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting avatar' });
  }
});

module.exports = router;
