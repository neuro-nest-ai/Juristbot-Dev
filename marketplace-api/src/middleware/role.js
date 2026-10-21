const { forbidden } = require('../utils/http');

function requireRole(...roles) {
  const allowed = roles.flat();
  return (req, res, next) => {
    if (!req.user || !allowed.includes(req.user.role)) {
      return next(forbidden('You do not have permission to perform this action'));
    }
    return next();
  };
}

module.exports = { requireRole };
