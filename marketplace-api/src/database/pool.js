const env = require('../config/env');

const driver = env.db.client === 'sqlite'
  ? require('./driver-sqlite')
  : require('./driver-mysql');

module.exports = {
  client: driver.client,
  query: driver.query,
  init: driver.init,
  withTransaction: driver.withTransaction,
  close: driver.close,
};
