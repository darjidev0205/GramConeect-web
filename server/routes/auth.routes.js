const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Public Auth Endpoints
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// Profile & settings management endpoints
router.put('/profile', authenticate, authController.updateProfile);
router.put('/settings', authenticate, authController.updateSettings);
router.delete('/account', authenticate, authController.deleteAccount);
router.get('/audit-logs', authenticate, authorize('admin'), authController.getAuditLogs);

// Admin-Only User Management Endpoints
router.get('/users', authenticate, authorize('admin'), authController.getUsers);
router.put('/users/:id', authenticate, authorize('admin'), authController.updateUser);
router.delete('/users/:id', authenticate, authorize('admin'), authController.deleteUser);

module.exports = router;
