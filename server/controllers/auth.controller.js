const bcrypt = require('bcryptjs');
const User = require('../models/User');
const jwtService = require('../services/jwt.service');

const register = async (req, res) => {
  const { name, email, phone, password, role, location, vehicle, profileImage, termsAccepted } = req.body;

  // 1. Basic validation
  if (!name || !email || !role || !termsAccepted) {
    return res.status(400).json({ message: 'Name, email, role, and terms acceptance are required.' });
  }

  // Prevent admin accounts from self-registering
  if (role === 'admin') {
    return res.status(403).json({ message: 'Administrative accounts cannot be self-registered.' });
  }

  // 2. Validate format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email address format.' });
  }

  if (phone) {
    const phoneRegex = /^[0-9]{10}$/;
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length !== 10) {
      return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
    }
  }

  try {
    // 3. Prevent duplicate accounts
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ message: 'An account with this email address already exists.' });
    }

    if (phone) {
      const existingPhone = await User.findOne({ phone });
      if (existingPhone) {
        return res.status(400).json({ message: 'An account with this phone number already exists.' });
      }
    }

    // Hash password if supplied
    let hashedPassword;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    // 4. Create User object
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone: phone || undefined,
      password: hashedPassword,
      role,
      location: location || { address: '', landmark: '', lat: 20.5937, lng: 78.9629 },
      vehicle: role === 'agent' ? vehicle : undefined,
      profileImage
    });

    await newUser.save();

    // 5. Generate Access & Refresh Tokens
    const { accessToken, refreshToken } = jwtService.generateTokens(newUser);
    
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      message: 'Account registered successfully.',
      token: accessToken,
      refreshToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        location: newUser.location,
        vehicle: newUser.vehicle,
        profileImage: newUser.profileImage
      }
    });

  } catch (err) {
    console.error('Error during registration:', err);
    res.status(500).json({ message: 'Server Error during registration.' });
  }
};

const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required.' });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    if (user.role !== role) {
      return res.status(400).json({ message: 'The selected role does not match this account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const { accessToken, refreshToken } = jwtService.generateTokens(user);
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        vehicle: user.vehicle,
        profileImage: user.profileImage
      }
    });
  } catch (err) {
    console.error('Password login error:', err);
    res.status(500).json({ message: 'Server Error during login.' });
  }
};

const refresh = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }

  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid or revoked refresh token.' });
    }

    const tokens = jwtService.generateTokens(user);
    user.refreshToken = tokens.refreshToken;
    await user.save();

    res.json({
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken
    });
  } catch (err) {
    console.error('Token refresh error:', err);
    res.status(403).json({ message: 'Refresh token is expired or invalid.' });
  }
};

const logout = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required for logging out.' });
  }

  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken);
    const user = await User.findById(decoded.id);
    
    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }
    
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    res.json({ message: 'Logged out successfully.' });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password -refreshToken');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    ).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server Error' });
  }
};

const updateProfile = async (req, res) => {
  const { name, email, phone, address, vehicle, password } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    
    if (phone) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
        return res.status(400).json({ message: 'Phone number must be exactly 10 digits.' });
      }
      user.phone = phone.replace(/\D/g, '');
    }

    if (address) {
      user.location = {
        ...user.location,
        address
      };
    }

    if (user.role === 'agent' && vehicle) {
      user.vehicle = {
        ...user.vehicle,
        ...vehicle
      };
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();

    // Log to Audit Log
    const { logAction } = require('../services/audit.service');
    await logAction('update_profile', user._id, 'Profile parameters updated in settings', req.ip);

    res.json({
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        location: user.location,
        vehicle: user.vehicle,
        profileImage: user.profileImage,
        settings: user.settings,
        availability: user.availability
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error updating profile.' });
  }
};

const updateSettings = async (req, res) => {
  const { settings, availability } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (settings !== undefined) {
      user.settings = {
        ...user.settings,
        ...settings
      };
    }

    if (availability !== undefined) {
      user.availability = availability;
    }

    await user.save();

    res.json({
      message: 'Settings updated successfully.',
      settings: user.settings,
      availability: user.availability
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving settings.' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    if (req.user.role !== 'user') {
      return res.status(403).json({ message: 'Only Villagers can self-delete their account.' });
    }
    const user = await User.findByIdAndDelete(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting account.' });
  }
};

const getAuditLogs = async (req, res) => {
  try {
    const AuditLog = require('../models/AuditLog');
    const logs = await AuditLog.find({})
      .populate('actor', 'name email role')
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching system audit logs.' });
  }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  getUsers,
  updateUser,
  deleteUser,
  updateProfile,
  updateSettings,
  deleteAccount,
  getAuditLogs
};
