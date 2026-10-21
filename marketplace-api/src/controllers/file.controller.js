const fs = require('fs');
const path = require('path');
const { query } = require('../database/pool');
const { uploadsRoot } = require('../middleware/upload');
const { forbidden, notFound } = require('../utils/http');

async function canAccessRequest(requestId, user) {
  const [request] = await query('SELECT client_id FROM marketplace_requests WHERE id = ?', [requestId]);
  if (!request) throw notFound('Request not found');
  if (request.client_id === user.id || user.role === 'admin') return true;
  const access = await query(
    'SELECT id FROM marketplace_bids WHERE request_id = ? AND advocate_id = ? LIMIT 1',
    [requestId, user.id]
  );
  if (!access.length) throw forbidden('You do not have access to these files');
  return true;
}

async function uploadFiles(req, res, next) {
  try {
    const [request] = await query('SELECT client_id FROM marketplace_requests WHERE id = ?', [req.params.requestId]);
    if (!request) throw notFound('Request not found');
    if (request.client_id !== req.user.id && req.user.role !== 'admin') throw forbidden('Only the request owner can upload files');

    const files = req.files || [];
    const rows = [];
    for (const file of files) {
      const relativePath = path.relative(path.join(__dirname, '..', '..'), file.path).replace(/\\/g, '/');
      const result = await query(
        `INSERT INTO marketplace_request_files
         (request_id, original_name, storage_key, mime_type, file_size)
         VALUES (?, ?, ?, ?, ?)`,
        [req.params.requestId, file.originalname, relativePath, file.mimetype, file.size]
      );
      rows.push({ id: result.insertId, original_name: file.originalname, mime_type: file.mimetype, file_size: file.size });
    }
    res.status(201).json({ files: rows });
  } catch (err) {
    next(err);
  }
}

async function listFiles(req, res, next) {
  try {
    await canAccessRequest(req.params.requestId, req.user);
    const files = await query(
      `SELECT id, original_name, mime_type, file_size, created_at
       FROM marketplace_request_files WHERE request_id = ? ORDER BY created_at DESC`,
      [req.params.requestId]
    );
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

async function downloadFile(req, res, next) {
  try {
    await canAccessRequest(req.params.requestId, req.user);
    const [file] = await query(
      'SELECT original_name, storage_key FROM marketplace_request_files WHERE id = ? AND request_id = ?',
      [req.params.fileId, req.params.requestId]
    );
    if (!file) throw notFound('File not found');
    const absolutePath = path.resolve(path.join(__dirname, '..', '..', file.storage_key));
    if (!absolutePath.startsWith(path.resolve(uploadsRoot))) throw forbidden('Invalid file path');
    if (!fs.existsSync(absolutePath)) throw notFound('Stored file not found');
    res.download(absolutePath, file.original_name);
  } catch (err) {
    next(err);
  }
}

async function canAccessOrder(orderId, user) {
  const [order] = await query('SELECT client_id, advocate_id FROM marketplace_orders WHERE id = ?', [orderId]);
  if (!order) throw notFound('Order not found');
  if (order.client_id !== user.id && order.advocate_id !== user.id && user.role !== 'admin') {
    throw forbidden('You do not have access to this order');
  }
  return order;
}

async function uploadOrderFiles(req, res, next) {
  try {
    const order = await canAccessOrder(req.params.orderId, req.user);
    if (order.advocate_id !== req.user.id && req.user.role !== 'admin') {
      throw forbidden('Only the assigned advocate can upload completed drafts');
    }
    const rows = [];
    for (const file of req.files || []) {
      const relativePath = path.relative(path.join(__dirname, '..', '..'), file.path).replace(/\\/g, '/');
      const result = await query(
        `INSERT INTO marketplace_order_files
         (order_id, original_name, storage_key, mime_type, file_size, file_type)
         VALUES (?, ?, ?, ?, ?, 'completed_draft')`,
        [req.params.orderId, file.originalname, relativePath, file.mimetype, file.size]
      );
      rows.push({ id: result.insertId, original_name: file.originalname, mime_type: file.mimetype, file_size: file.size });
    }
    res.status(201).json({ files: rows });
  } catch (err) {
    next(err);
  }
}

async function listOrderFiles(req, res, next) {
  try {
    await canAccessOrder(req.params.orderId, req.user);
    const files = await query(
      `SELECT id, original_name, mime_type, file_size, file_type, created_at
       FROM marketplace_order_files WHERE order_id = ? ORDER BY created_at DESC`,
      [req.params.orderId]
    );
    res.json({ files });
  } catch (err) {
    next(err);
  }
}

async function downloadOrderFile(req, res, next) {
  try {
    await canAccessOrder(req.params.orderId, req.user);
    const [file] = await query(
      'SELECT original_name, storage_key FROM marketplace_order_files WHERE id = ? AND order_id = ?',
      [req.params.fileId, req.params.orderId]
    );
    if (!file) throw notFound('File not found');
    const absolutePath = path.resolve(path.join(__dirname, '..', '..', file.storage_key));
    if (!absolutePath.startsWith(path.resolve(uploadsRoot))) throw forbidden('Invalid file path');
    if (!fs.existsSync(absolutePath)) throw notFound('Stored file not found');
    res.download(absolutePath, file.original_name);
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadFiles, listFiles, downloadFile, uploadOrderFiles, listOrderFiles, downloadOrderFile };
