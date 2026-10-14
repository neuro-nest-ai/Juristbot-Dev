// logger.js

const winston = require('winston');
require('winston-daily-rotate-file');
const { serializeError } = require('serialize-error');
// Helper: Filter logs to include only a specific level
const filterOnly = (level) =>
  winston.format((log) => (log.level === level.toUpperCase() ? log : false))();

// Log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, errors }) => {
    let format = ` ${timestamp} [${level}]: ${JSON.stringify(message)}`;
    if (level === 'ERROR') {
      if (stack) format += `\nStack: ${JSON.stringify(stack)}`;
      if (errors) format += `\nErrors: ${JSON.stringify(errors)}`;
    }
    return format;
  })
);

// Winston logger instance
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format((log) => {
    log.level = log.level.toUpperCase();
    return log;
  })(),
  transports: [
    new winston.transports.DailyRotateFile({
      filename: 'logs/info-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '10d',
      format: winston.format.combine(filterOnly('INFO'), logFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/warn-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '10d',
      format: winston.format.combine(filterOnly('WARN'), logFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '10d',
      format: winston.format.combine(filterOnly('ERROR'), logFormat),
    }),
    new winston.transports.DailyRotateFile({
      filename: 'logs/debug-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxFiles: '10d',
      format: winston.format.combine(filterOnly('DEBUG'), logFormat),
    }),
    ...(process.env.NODE_ENV === 'local'
      ? [
          new winston.transports.Console({
            format: winston.format.combine(
              winston.format.colorize(),
              logFormat
            ),
          }),
        ]
      : []),
  ],
});

// Exception handler
logger.exceptions.handle(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf((info) => `Exception: ${JSON.stringify(info.message)}`)
    ),
  }),
  new winston.transports.DailyRotateFile({
    filename: 'logs/exceptions-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxFiles: '10d',
  })
);

// Ensure the logger does not exit on handled exceptions
logger.exitOnError = false;

// Express Middleware: Request/Response Logging
const logRequestResponse = (req, res, next) => {
  const start = Date.now();
  let appendContentType = req.get('Content-Type')?.includes('form')
    ? `Content-Type: ${req.get('Content-Type')} `
    : '';
  logger.info(`[${req.method}] ${req.originalUrl} - ${appendContentType}`);

  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    let logType = 'info';
    if (status >= 400 && status < 500) logType = 'warn';
    // You can add custom logic for 5xx errors here if needed
    logger[logType](
      `[${req.method}] ${req.originalUrl} - Status: ${status} - Duration: ${duration}ms`
    );
  });

  next();
};

// Express Error Handler
const errorHandler = (err, req, res, _next) => {
  const serialized = serializeError(err);
  const errorType = serialized.name?.toLowerCase().includes('sequelize')
    ? 'DATABASE'
    : 'API';
  logger.error(
    `[${errorType} Error] [${req.method}] ${req.originalUrl} - ${serialized.message}`,
    {
      errors: serialized.errors || serialized.error,
      stack: serialized.stack,
    }
  );
  const statusCode =
    serialized.message?.includes('Duplicate') || serialized.code === 11000
      ? 409
      : 500;
  return res.status(serialized.statusCode || statusCode).json({
    status: 'errored',
    msg: serialized.message || serialized.original?.message || 'Internal Server Error',
    errors: serialized.errors || serialized.error,
  });
};

module.exports = { errorHandler, logRequestResponse, logger };
