const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./src/config/env');
const db = require('./src/database/pool');
const routes = require('./src/routes');
const { notFoundHandler, errorHandler } = require('./src/middleware/error');

const app = express();

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigin.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(env.port, () => {
  console.log(`marketplace-api listening on http://localhost:${env.port} (${env.nodeEnv})`);
});

async function bootstrap() {
  try {
    await db.init();
    console.log(`Database ready (client: ${db.client})`);
  } catch (err) {
    console.warn(`Database init skipped: ${err.message}`);
  }
}

bootstrap();

module.exports = { app, server };
