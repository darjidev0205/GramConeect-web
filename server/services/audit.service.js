const AuditLog = require('../models/AuditLog');

const logAction = async (action, actorId, details, ipAddress = '') => {
  try {
    if (!actorId) return;
    const log = new AuditLog({
      action,
      actor: actorId,
      details: typeof details === 'object' ? JSON.stringify(details) : details,
      ipAddress
    });
    await log.save();
    console.log(`[AuditLog] Action '${action}' registered for actor ${actorId}`);
  } catch (err) {
    console.error('AuditLog registration error:', err);
  }
};

module.exports = { logAction };
