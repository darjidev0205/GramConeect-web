const jwt = require('jsonwebtoken');

const getPermissionsForRole = (role) => {
  if (role === 'admin') {
    return [
      'dashboard', 'users', 'agents', 'orders', 'hubs', 'analytics', 'revenue', 
      'settings', 'notifications', 'reports', 'create_agent', 'delete_agent', 
      'suspend_user', 'approve_agents', 'manage_hubs', 'manage_orders', 
      'system_configuration', 'everything'
    ];
  } else if (role === 'agent') {
    return [
      'accept_delivery', 'reject_delivery', 'pickup_package', 'verify_otp', 
      'complete_delivery', 'view_tasks', 'delivery_history', 'performance', 
      'wallet', 'route_navigation', 'call_customer', 'notifications', 
      'support', 'profile'
    ];
  } else {
    return [
      'create_delivery', 'track_package', 'view_hubs', 'delivery_history', 
      'profile', 'notifications', 'support', 'settings', 'logout'
    ];
  }
};

const generateTokens = (user) => {
  const payload = { 
    userId: user.id || user._id, 
    id: user.id || user._id, // compatibility
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: getPermissionsForRole(user.role),
    createdAt: user.createdAt
  };
  
  // Access token: valid for 15 minutes
  const accessToken = jwt.sign(
    payload, 
    process.env.JWT_SECRET || 'supersecret12345', 
    { expiresIn: '15m' }
  );

  // Refresh token: valid for 7 days
  const refreshToken = jwt.sign(
    payload, 
    process.env.REFRESH_TOKEN_SECRET || 'supersecret_refresh_12345', 
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'supersecret12345');
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET || 'supersecret_refresh_12345');
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  getPermissionsForRole
};
