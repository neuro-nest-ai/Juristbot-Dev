
const express = require('express');
const router = express.Router();
const { q } = require('../services/ecourt/ecourtDb');

// Meta's one-time verification handshake
router.get('/', (req, res) => {
  if (req.query['hub.mode'] === 'subscribe' && req.query['hub.verify_token'] === process.env.WA_WEBHOOK_VERIFY_TOKEN) {
    return res.status(200).send(String(req.query['hub.challenge'] || ''));
  }
  return res.sendStatus(403);
});

const RANK = { sent: 1, delivered: 2, read: 3 };

router.post('/', express.raw({ type: 'application/json', limit: '1mb' }), async (req, res) => {
  // if (!verifySignature(req.body, req.get('x-hub-signature-256'))) return res.sendStatus(401);
  res.sendStatus(200); 
  try {
    const body = JSON.parse(Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '{}');
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        for (const st of (change.value && change.value.statuses) || []) {
          if (st.status === 'failed') {
            const title = (st.errors && st.errors[0] && st.errors[0].title) || 'failed';
            await q('UPDATE ecourt_alert_log SET status=?, error=? WHERE provider_msg_id=?', ['failed', String(title).slice(0, 255), st.id]);
          } else if (RANK[st.status]) {
            // never move backwards (read → delivered)
            await q(
              `UPDATE ecourt_alert_log SET status=? WHERE provider_msg_id=?
                 AND (CASE status WHEN 'read' THEN 3 WHEN 'delivered' THEN 2 WHEN 'sent' THEN 1 ELSE 0 END) < ?`,
              [st.status, st.id, RANK[st.status]],
            );
          }
        }
      }
    }
  } catch (e) {
    console.error('[wa-webhook]', e.message);
  }
});

module.exports = router;
