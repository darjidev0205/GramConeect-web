const authMiddleware = require('./auth.middleware');

const auth = authMiddleware.authenticate;
auth.authenticate = authMiddleware.authenticate;
auth.authorize = authMiddleware.authorize;

module.exports = auth;
