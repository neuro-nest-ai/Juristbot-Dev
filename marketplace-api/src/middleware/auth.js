const { verifyToken } = require('../utils/jwt');
const { unauthorized } = require('../utils/http');

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw unauthorized('Missing or invalid Authorization header');
    }
    const decoded = verifyToken(token);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    next(err.status ? err : unauthorized('Invalid or expired token'));
  }
}

module.exports = { authenticate };
