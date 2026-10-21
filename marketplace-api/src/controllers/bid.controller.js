const { query, withTransaction } = require('../database/pool');
const { badRequest, conflict, forbidden, notFound } = require('../utils/http');

function integer(value, label) {
  const result = Number(value);
  if (!Number.isInteger(result) || result <= 0) throw badRequest(`${label} must be a positive integer`);
  return result;
}

async function create(req, res, next) {
  try {
    const { amount, timeline_days, message } = req.body || {};
    const amountPaise = integer(amount, 'amount');
    const timeline = timeline_days == null || timeline_days === '' ? null : integer(timeline_days, 'timeline_days');
    const [request] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [req.params.requestId]);
    if (!request) throw notFound('Request not found');
    if (request.client_id === req.user.id) throw forbidden('You cannot bid on your own request');
    if (!['open', 'bidding'].includes(request.status)) throw badRequest('This request is no longer accepting bids');

    try {
      const result = await query(
        `INSERT INTO marketplace_bids (request_id, advocate_id, amount, timeline_days, message)
         VALUES (?, ?, ?, ?, ?)`,
        [request.id, req.user.id, amountPaise, timeline, message || null]
      );
      await query("UPDATE marketplace_requests SET status = 'bidding' WHERE id = ? AND status = 'open'", [request.id]);
      const [bid] = await query(
        `SELECT b.*, u.name AS advocate_name FROM marketplace_bids b
         JOIN marketplace_users u ON u.id = b.advocate_id WHERE b.id = ?`,
        [result.insertId]
      );
      return res.status(201).json({ bid });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        throw conflict('You have already submitted a bid for this request');
      }
      throw error;
    }
  } catch (err) {
    next(err);
  }
}

async function listForRequest(req, res, next) {
  try {
    const [request] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [req.params.requestId]);
    if (!request) throw notFound('Request not found');
    if (request.client_id !== req.user.id && req.user.role !== 'admin') {
      const rows = await query(
        `SELECT b.*, u.name AS advocate_name FROM marketplace_bids b
         JOIN marketplace_users u ON u.id = b.advocate_id
         WHERE b.request_id = ? AND b.advocate_id = ? ORDER BY b.created_at DESC`,
        [request.id, req.user.id]
      );
      return res.json({ bids: rows });
    }
    const rows = await query(
      `SELECT b.*, u.name AS advocate_name FROM marketplace_bids b
       JOIN marketplace_users u ON u.id = b.advocate_id
       WHERE b.request_id = ? ORDER BY b.created_at DESC`,
      [request.id]
    );
    return res.json({ bids: rows });
  } catch (err) {
    next(err);
  }
}

async function mine(req, res, next) {
  try {
    const rows = await query(
      `SELECT b.*, r.title, r.category, r.jurisdiction, r.status AS request_status
       FROM marketplace_bids b JOIN marketplace_requests r ON r.id = b.request_id
       WHERE b.advocate_id = ? ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ bids: rows });
  } catch (err) {
    next(err);
  }
}

async function reject(req, res, next) {
  try {
    const [bid] = await query(
      `SELECT b.*, r.client_id, r.status AS request_status FROM marketplace_bids b
       JOIN marketplace_requests r ON r.id = b.request_id WHERE b.id = ?`,
      [req.params.id]
    );
    if (!bid) throw notFound('Bid not found');
    if (bid.client_id !== req.user.id && req.user.role !== 'admin') throw forbidden('Only the request owner can reject bids');
    if (bid.status !== 'pending') throw badRequest('Only pending bids can be rejected');
    await query("UPDATE marketplace_bids SET status = 'rejected' WHERE id = ?", [bid.id]);
    res.json({ message: 'Bid rejected' });
  } catch (err) {
    next(err);
  }
}

async function withdraw(req, res, next) {
  try {
    const [bid] = await query('SELECT * FROM marketplace_bids WHERE id = ?', [req.params.id]);
    if (!bid) throw notFound('Bid not found');
    if (bid.advocate_id !== req.user.id) throw forbidden('You can only withdraw your own bid');
    if (bid.status !== 'pending') throw badRequest('Only pending bids can be withdrawn');
    await query("UPDATE marketplace_bids SET status = 'withdrawn' WHERE id = ?", [bid.id]);
    res.json({ message: 'Bid withdrawn' });
  } catch (err) {
    next(err);
  }
}

async function accept(req, res, next) {
  try {
    const result = await withTransaction(async (connection) => {
      const [bid] = await connection.query(
        `SELECT b.*, r.client_id, r.status AS request_status, r.title
         FROM marketplace_bids b JOIN marketplace_requests r ON r.id = b.request_id
         WHERE b.id = ?`,
        [req.params.id]
      );
      if (!bid) throw notFound('Bid not found');
      if (bid.client_id !== req.user.id && req.user.role !== 'admin') throw forbidden('Only the request owner can accept bids');
      if (bid.status !== 'pending') throw badRequest('Only pending bids can be accepted');
      if (!['open', 'bidding'].includes(bid.request_status)) throw badRequest('This request is no longer accepting bids');

      const update = await connection.query(
        "UPDATE marketplace_requests SET status = 'awarded' WHERE id = ? AND status IN ('open', 'bidding')",
        [bid.request_id]
      );
      if (!update.affectedRows) throw conflict('This request has already been awarded');

      await connection.query("UPDATE marketplace_bids SET status = 'rejected' WHERE request_id = ? AND status = 'pending' AND id <> ?", [bid.request_id, bid.id]);
      await connection.query("UPDATE marketplace_bids SET status = 'accepted' WHERE id = ?", [bid.id]);
      const orderNumber = `MK-${Date.now()}-${Math.floor(Math.random() * 900 + 100)}`;
      const order = await connection.query(
        `INSERT INTO marketplace_orders
         (order_number, request_id, bid_id, client_id, advocate_id, amount, status, escrow_status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', 'none')`,
        [orderNumber, bid.request_id, bid.id, bid.client_id, bid.advocate_id, bid.amount]
      );
      return { orderId: order.insertId, orderNumber, requestId: bid.request_id };
    });
    res.status(201).json({ order: result });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listForRequest, mine, reject, withdraw, accept };
