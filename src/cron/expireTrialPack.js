const cron = require('node-cron');
const { getPool } = require('../database/db');
const nodemailer = require('nodemailer');

// ── Mailer Setup ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_USERPASSWORD,
  },
});

// ── Email Templates ───────────────────────────────────────────────────────────
const getReminderTemplate = (user, daysLeft) => {
  const urgencyColor = daysLeft === 2 ? '#e53935' : '#f57c00';
  const urgencyText  = daysLeft === 2 ? '⚠️ Last Chance!' : '⏳ Reminder';

  return {
    subject: `${urgencyText} Your JuristBot Trial expires in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          
          <!-- Header -->
          <tr>
            <td style="background:${urgencyColor};padding:30px;text-align:center;">
              <h1 style="color:#ffffff;margin:0;font-size:26px;font-weight:700;">
                JuristBot AI
              </h1>
              <p style="color:#ffffff;margin:8px 0 0;font-size:14px;opacity:0.9;">
                Legal Intelligence Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="color:#222;margin:0 0 16px;font-size:22px;">
                Hello ${user.username || 'there'} 👋
              </h2>
              <p style="color:#555;font-size:16px;line-height:1.7;margin:0 0 20px;">
                Your <strong>JuristBot Trial Pack</strong> is expiring in 
                <strong style="color:${urgencyColor};">${daysLeft} day${daysLeft > 1 ? 's' : ''}</strong>.
                Don't lose access to your AI legal tools!
              </p>

              <!-- Expiry Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8f0;border:1px solid ${urgencyColor};border-radius:8px;margin:0 0 24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0;color:#888;font-size:13px;">Trial Expiry Date</p>
                    <p style="margin:4px 0 0;color:#222;font-size:18px;font-weight:700;">
                      ${new Date(user.sub_end).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- What you'll lose -->
              <p style="color:#333;font-size:15px;font-weight:700;margin:0 0 12px;">
                After expiry you will lose access to:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                ${[
                  'Scenario Solver',
                  'Legal Drafting',
                  'Cross Q&A',
                  'Relevant Judgement Finder',
                  'AI Legal Course Videos',
                ].map(item => `
                <tr>
                  <td style="padding:5px 0;">
                    <span style="color:${urgencyColor};font-size:16px;">✕</span>
                    <span style="color:#555;font-size:14px;margin-left:10px;">${item}</span>
                  </td>
                </tr>`).join('')}
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.CLIENT_URL}/Subscription"
                       style="display:inline-block;background:${urgencyColor};color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:16px;font-weight:700;">
                      Upgrade Now →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#999;font-size:13px;text-align:center;margin:20px 0 0;">
                Click the button above to choose a plan and continue using JuristBot.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #eee;text-align:center;">
              <p style="color:#aaa;font-size:12px;margin:0;">
                © ${new Date().getFullYear()} JuristBot AI. All rights reserved.
              </p>
              <p style="color:#aaa;font-size:12px;margin:6px 0 0;">
                You received this because you have an active trial on JuristBot.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `
  };
};

// ── Send Reminder Email ───────────────────────────────────────────────────────
const sendReminderEmail = async (user, daysLeft) => {
  try {
    const { subject, html } = getReminderTemplate(user, daysLeft);
    await transporter.sendMail({
      from: `"JuristBot AI" `,
      to: user.email,
      subject,
      html,
    });
    console.log(`📧 Reminder sent to ${user.email} (${daysLeft} days left)`);
  } catch (err) {
    console.error(`❌ Email failed for ${user.email}:`, err.message);
  }
};

// ── Helper: fetch users expiring in N days ────────────────────────────────────
const getUsersExpiringIn = async (db, days) => {
  const [rows] = await db.promise().query(`
    SELECT 
      c.id       AS user_id,
      c.sub_id,
      c.email,
      c.username,
      s.sub_end,
      s.plan_Name
    FROM chatsignup c
    INNER JOIN subscriptions s ON c.sub_id = s.id
    WHERE 
      s.plan_Name       = 'trialpack'
      AND s.sub_end      IS NOT NULL
      AND DATE(s.sub_end) = DATE(DATE_ADD(CURDATE(), INTERVAL ? DAY))
      AND c.sub_id       IS NOT NULL
      AND s.status       != 'expired'
  `, [days]);
  return rows;
};

// ── CRON: Every 6 hours ───────────────────────────────────────────────────────
cron.schedule('0 */6 * * *', async () => {
  const db = getPool();
  console.log('⏰ Running trialpack cron job...');

  try {

    // ── 1. Send 3-day reminder ────────────────────────────────────────────────
    const users3days = await getUsersExpiringIn(db, 3);
    console.log(`📋 3-day reminders: ${users3days.length} user(s)`);
    for (const user of users3days) {
      await sendReminderEmail(user, 3);
    }

    // ── 2. Send 2-day reminder ────────────────────────────────────────────────
    const users2days = await getUsersExpiringIn(db, 2);
    console.log(`📋 2-day reminders: ${users2days.length} user(s)`);
    for (const user of users2days) {
      await sendReminderEmail(user, 2);
    }

    // ── 3. Expire users whose sub_end <= today ────────────────────────────────
    const [expiredUsers] = await db.promise().query(`
      SELECT 
        c.id  AS user_id,
        c.sub_id,
        s.sub_end
      FROM chatsignup c
      INNER JOIN subscriptions s ON c.sub_id = s.id
      WHERE 
        s.plan_Name       = 'trialpack'
        AND s.sub_end      IS NOT NULL
        AND DATE(s.sub_end) <= CURDATE()
        AND c.sub_id       IS NOT NULL
        AND s.status       != 'expired'
    `);

    console.log(`🔍 Expiring: ${expiredUsers.length} user(s)`);

    for (const user of expiredUsers) {
      await db.promise().query(`
        UPDATE chatsignup 
        SET sub_id = NULL, plan_id = NULL, list_verify = 0, membership = 0
        WHERE id = ?
      `, [user.user_id]);

      await db.promise().query(`
        UPDATE subscriptions 
        SET status = 'expired'
        WHERE id = ?
      `, [user.sub_id]);

      console.log(`✅ Expired user ${user.user_id} — sub_end: ${user.sub_end}`);
    }

    console.log(`🎉 Cron done.`);

  } catch (error) {
    console.error('❌ Cron error:', error);
  }
});