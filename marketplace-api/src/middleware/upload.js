const fs = require('fs');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');

const uploadsRoot = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination(req, file, callback) {
    const requestDirectory = path.join(uploadsRoot, 'requests', String(req.params.requestId));
    fs.mkdirSync(requestDirectory, { recursive: true });
    callback(null, requestDirectory);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const allowedTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024, files: 5 },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) {
      return callback(new Error('Only PDF, DOC and DOCX files are allowed'));
    }
    return callback(null, true);
  },
});

const orderStorage = multer.diskStorage({
  destination(req, file, callback) {
    const orderDirectory = path.join(uploadsRoot, 'orders', String(req.params.orderId));
    fs.mkdirSync(orderDirectory, { recursive: true });
    callback(null, orderDirectory);
  },
  filename(req, file, callback) {
    const extension = path.extname(file.originalname).toLowerCase();
    callback(null, `${crypto.randomUUID()}${extension}`);
  },
});

const orderUpload = multer({
  storage: orderStorage,
  limits: { fileSize: 25 * 1024 * 1024, files: 5 },
  fileFilter(req, file, callback) {
    if (!allowedTypes.has(file.mimetype)) return callback(new Error('Only PDF, DOC and DOCX files are allowed'));
    return callback(null, true);
  },
});

module.exports = { upload, orderUpload, uploadsRoot };
