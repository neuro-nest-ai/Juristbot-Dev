const { HttpError } = require('../utils/http');

function notFoundHandler(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const uploadError = err.code === 'LIMIT_FILE_SIZE'
    ? 'File is too large. Maximum allowed size is 25 MB.'
    : err.code === 'LIMIT_FILE_COUNT'
      ? 'Too many files. Maximum 5 files are allowed.'
      : err.message;
  const status = err instanceof HttpError ? err.status : err.code?.startsWith('LIMIT_') ? 400 : err.status || 500;
  const message = status >= 500 ? 'Internal server error' : uploadError;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };
