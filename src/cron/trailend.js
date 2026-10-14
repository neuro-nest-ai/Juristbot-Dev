const cron = require('node-cron');
const { getPool } = require('../database/db');

function startTrialCron() {
  cron.schedule('0 * * * *', async () => {
    try {
      const pool = await getPool();

      const [result] = await pool.query(`
        UPDATE chatsignup
        SET trial_period = 0
        WHERE trial_period = 1
          AND trail_pack_date IS NOT NULL
          AND trail_pack_date <= DATE_SUB(NOW(), INTERVAL 6 HOUR)
      `);

      console.log(`Trial cron updated: ${result.affectedRows}`);
    } catch (error) {
      console.error('Trial cron error:', error);
    }
  }, {
    timezone: 'Asia/Kolkata'
  });
}

module.exports = { startTrialCron };