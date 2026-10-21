const express = require('express');
const controller = require('../controllers/bid.controller');
const { authenticate } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

const router = express.Router();
router.use(authenticate);

router.get('/requests/:requestId/bids', controller.listForRequest);
router.post('/requests/:requestId/bids', requireRole('advocate'), controller.create);
router.get('/bids/my', requireRole('advocate'), controller.mine);
router.post('/bids/:id/reject', requireRole('buyer', 'admin'), controller.reject);
router.post('/bids/:id/withdraw', requireRole('advocate'), controller.withdraw);
router.post('/bids/:id/accept', requireRole('buyer', 'admin'), controller.accept);

module.exports = router;
