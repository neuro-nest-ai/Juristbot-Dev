require('dotenv').config();
const jwt = require('jsonwebtoken');

/**
 * Main authorization middleware
 */
module.exports = async (req, res, next) => {
  try {
    // Skip authorization for specific routes
    const publicPaths = ['/payment', '/health', '/'];
    if (publicPaths.includes(req.path)) {
      return next();
    }

    // ************************************************************
    // **************** AUTHORIZATION ****************************
    // ************************************************************

    const header_key = req.header('Authorization');
    const jwtToken = header_key?.split(' ')[1]; 
    
    if (!jwtToken) {
      return res.status(403).json({ 
        status: 'failure', 
        message: 'Access denied. No token provided.' 
      });
    }

    // Verify the token - if verification fails goes to catch block
    const payload = jwt.verify(jwtToken, process.env.JWT_SECRET_KEY);

    // Attach user details to request object
    req.userId = payload.id;
    req.username = payload.username;
    req.mobile_no = payload.mobile_no;
    req.role = payload.role;
    req.email = payload.email;
    req.state = payload.state;
    req.town = payload.town;
    req.sub_status = payload.sub_status;
    req.sub_end = payload.sub_end;
    req.sub_id = payload.sub_id;
    req.short_url = payload.short_url;
    req.plan_id = payload.plan_id;
    req.rp_sub_id = payload.rp_sub_id;
    req.trial = payload.trial;

    // Parse features if it's a JSON string
    try {
      req.features = typeof payload.features === 'string' 
        ? JSON.parse(payload.features) 
        : payload.features;
    } catch (e) {
      req.features = payload.features;
    }

    req.user = {
      id: req.userId,
      username: req.username,
      mobile_no: req.mobile_no,
      role: req.role,
      email: req.email,
      state: req.state,
      town: req.town,
      sub_status: req.sub_status,
      sub_end: req.sub_end,
      sub_id: req.sub_id,
      short_url: req.short_url,
      plan_id: req.plan_id,
      features: req.features,
      rp_sub_id: req.rp_sub_id,
      trial: req.trial
    };

    next();
  } catch (error) {
    console.error('Authorization error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        status: 'failure', 
        message: 'Token expired. Please login again.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        status: 'failure', 
        message: 'Invalid token.' 
      });
    }

    return res.status(401).json({ 
      status: 'failure', 
      message: 'Authentication failed.', 
      error: error.message 
    });
  }
};