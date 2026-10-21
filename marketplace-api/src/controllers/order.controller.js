const { query } = require('../database/pool');
const { notFound, forbidden } = require('../utils/http');

// Phase 1: read-only order tracking. Orders are created in Phase 2 (bid accept).
async function listMine(req, res, next) {
  try {
    const rows = await query(
       `SELECT o.*, r.title, r.deadline, u.name AS advocate_name
         FROM marketplace_orders o
         JOIN marketplace_requests r ON r.id = o.request_id
         JOIN marketplace_users u ON u.id = o.advocate_id
        WHERE o.client_id = ? OR o.advocate_id = ?
        ORDER BY o.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json({ orders: rows });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const [order] = await query(
      `SELECT o.*, r.title, r.description, r.category, r.jurisdiction, r.deadline, u.name AS advocate_name
         FROM marketplace_orders o
         JOIN marketplace_requests r ON r.id = o.request_id
         JOIN marketplace_users u ON u.id = o.advocate_id
        WHERE o.id = ?`,
      [req.params.id]
    );
    if (!order) throw notFound('Order not found');
    if (order.client_id !== req.user.id && order.advocate_id !== req.user.id) {
      throw forbidden('You are not a party to this order');
    }
    res.json({ order });
  } catch (err) {
    next(err);
  }
}

module.exports = { listMine, getOne };
