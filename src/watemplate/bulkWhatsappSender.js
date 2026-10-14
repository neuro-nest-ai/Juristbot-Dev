require('dotenv').config();
const cron = require('node-cron');
const { getPool } = require('../database/db'); 
const sendWhatsAppTemplate = require('./freetrail'); 
const db = getPool();

const getEligibleUsers = async () => {
  try {
    const [rows] = await db.query('SELECT  mobile_no FROM chatsignup WHERE trial = 0');
    return rows;
  } catch (err) {
    console.error('❌ DB Query Error:', err);
    return [];
  }
};

const sendBulkWhatsAppTemplates = async () => {
  console.log(`[${new Date().toISOString()}] WhatsApp bulk send task started.`);
  const users = await getEligibleUsers();
  if (!users.length) {
    console.log('No eligible users found.');
    return;
  }

  for (const user of users) {
    try {
      await sendWhatsAppTemplate(user);
    } catch (err) {
      console.error(`❌ Failed for ${user.mobile_no}:`, err.message);
    }
  }
  console.log(`[${new Date().toISOString()}] WhatsApp bulk send task finished.`);
};
cron.schedule('0 9 */2 * *', sendBulkWhatsAppTemplates);



