const { query } = require('../database/pool');
const { badRequest, notFound, forbidden } = require('../utils/http');

const STATUSES = ['open', 'bidding', 'awarded', 'in_progress', 'delivered', 'completed', 'cancelled'];

function toIntOrNull(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = Number(value);
  if (Number.isNaN(n)) return NaN;
  return Math.trunc(n);
}

async function create(req, res, next) {
  try {
    const { title, description, category, jurisdiction, budget_min, budget_max, deadline } = req.body || {};
    if (!title) throw badRequest('title is required');

    const min = toIntOrNull(budget_min);
    const max = toIntOrNull(budget_max);
    if (Number.isNaN(min) || Number.isNaN(max)) {
      throw badRequest('budget_min and budget_max must be numbers (paise)');
    }
    if (min !== null && max !== null && min > max) {
      throw badRequest('budget_min cannot be greater than budget_max');
    }

    const result = await query(
      `INSERT INTO marketplace_requests
        (client_id, title, description, category, jurisdiction, budget_min, budget_max, deadline, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
      [
        req.user.id,
        title.trim(),
        description || null,
        category || null,
        jurisdiction || null,
        min,
        max,
        deadline || null,
      ]
    );
    const [row] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [result.insertId]);
    res.status(201).json({ request: row });
  } catch (err) {
    next(err);
  }
}

async function listMine(req, res, next) {
  try {
    const rows = await query(
      'SELECT * FROM marketplace_requests WHERE client_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ requests: rows });
  } catch (err) {
    next(err);
  }
}

// Advocate feed: open requests, excluding own.
async function feed(req, res, next) {
  try {
    const { category, jurisdiction, status } = req.query;
    const clauses = ['r.client_id <> ?'];
    const params = [req.user.id];
    const statusFilter = status && STATUSES.includes(status) ? status : 'open';
    clauses.push('r.status = ?');
    params.push(statusFilter);
    if (category) {
      clauses.push('r.category = ?');
      params.push(category);
    }
    if (jurisdiction) {
      clauses.push('r.jurisdiction = ?');
      params.push(jurisdiction);
    }
    const rows = await query(
      `SELECT r.*, u.name AS client_name
         FROM marketplace_requests r
         JOIN marketplace_users u ON u.id = r.client_id
        WHERE ${clauses.join(' AND ')}
        ORDER BY r.created_at DESC
        LIMIT 200`,
      params
    );
    res.json({ requests: rows });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const [request] = await query(
      `SELECT r.*, u.name AS client_name
         FROM marketplace_requests r
         JOIN marketplace_users u ON u.id = r.client_id
        WHERE r.id = ?`,
      [req.params.id]
    );
    if (!request) throw notFound('Request not found');

    const bids = await query(
      `SELECT b.*, u.name AS advocate_name
         FROM marketplace_bids b
         JOIN marketplace_users u ON u.id = b.advocate_id
        WHERE b.request_id = ?
        ORDER BY b.created_at DESC`,
      [req.params.id]
    );

    const isOwner = request.client_id === req.user.id;
    res.json({
      request,
      bids: isOwner ? bids : bids.filter((b) => b.advocate_id === req.user.id),
    });
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const [request] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [req.params.id]);
    if (!request) throw notFound('Request not found');
    if (request.client_id !== req.user.id) throw forbidden('You can only edit your own requests');
    if (['completed', 'cancelled'].includes(request.status)) {
      throw badRequest('Cannot edit a completed or cancelled request');
    }

    const fields = ['title', 'description', 'category', 'jurisdiction', 'deadline'];
    const updates = [];
    const params = [];
    for (const field of fields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(req.body[field]);
      }
    }
    for (const field of ['budget_min', 'budget_max']) {
      if (req.body[field] !== undefined) {
        const val = toIntOrNull(req.body[field]);
        if (Number.isNaN(val)) throw badRequest(`${field} must be a number (paise)`);
        updates.push(`${field} = ?`);
        params.push(val);
      }
    }
    if (!updates.length) throw badRequest('No fields to update');

    params.push(req.params.id);
    await query(`UPDATE marketplace_requests SET ${updates.join(', ')} WHERE id = ?`, params);
    const [updated] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [req.params.id]);
    res.json({ request: updated });
  } catch (err) {
    next(err);
  }
}

async function cancel(req, res, next) {
  try {
    const [request] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [req.params.id]);
    if (!request) throw notFound('Request not found');
    if (request.client_id !== req.user.id) throw forbidden('You can only cancel your own requests');
    if (request.status === 'cancelled') throw badRequest('Request is already cancelled');
    if (request.status === 'completed') throw badRequest('Cannot cancel a completed request');

    await query("UPDATE marketplace_requests SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    const [updated] = await query('SELECT * FROM marketplace_requests WHERE id = ?', [req.params.id]);
    res.json({ request: updated });
  } catch (err) {
    next(err);
  }
}

module.exports = { create, listMine, feed, getOne, update, cancel };
