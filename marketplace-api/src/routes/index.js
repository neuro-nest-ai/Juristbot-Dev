const express = require('express');
const authRoutes = require('./auth.routes');
const requestRoutes = require('./request.routes');
const orderRoutes = require('./order.routes');
const bidRoutes = require('./bid.routes');

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'marketplace-api', time: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/marketplace/requests', requestRoutes);
router.use('/marketplace/orders', orderRoutes);
router.use('/marketplace', bidRoutes);

module.exports = router;
