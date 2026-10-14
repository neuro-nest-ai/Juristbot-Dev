
const cron = require('node-cron');
const { q } = require('../services/ecourt/ecourtDb');
const { ecourts, P } = require('../services/ecourt/ecourtsClient');
const { upsertCase, readSnapshot, writeSnapshot, snapshotOf } = require('../services/ecourt/caseStore');
const { diffSnapshots } = require('../services/ecourt/caseNormalize');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const chunk = (arr, n) => Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));
let running = false;

async function notifyTrackers(caseRow, events, userId) {
  const trackers = await q(
    `SELECT t.id, t.events, t.notify_whatsapp, c.phone_e164, c.wa_opt_in_at
       FROM ecourt_tracked_cases t LEFT JOIN ecourt_clients c ON c.id = t.client_id
      WHERE t.cnr=? AND t.active=1 ${userId ? 'AND t.user_id=?' : ''}`,
    userId ? [caseRow.cnr, String(userId)] : [caseRow.cnr],
  );
  let sent = 0;
  for (const t of trackers) {
    const wanted = (typeof t.events === 'string' ? JSON.parse(t.events) : t.events) || [];
    for (const ev of events) {
      if (!t.notify_whatsapp || !wanted.includes(ev.type)) continue;
      await deliverWhatsApp({ trackedId: t.id, client: t, caseRow, event: ev });
      sent++;
    }
  }
  return sent;
}

async function runEcourtSync({ userId = null, log = console.log } = {}) {
  if (running) return { skipped: true, reason: 'ALREADY_RUNNING' };
  running = true;
  const stats = { cnrs: 0, refreshed: 0, failed: 0, changed: 0, alerts: 0 };
  try {
    const rows = await q(
      `SELECT DISTINCT cnr FROM ecourt_tracked_cases WHERE active=1 ${userId ? 'AND user_id=?' : ''}`,
      userId ? [String(userId)] : [],
    );
    const cnrs = rows.map((r) => r.cnr);
    stats.cnrs = cnrs.length;

    for (const batch of chunk(cnrs, 50)) {
      // 1. queue the refresh
      let ready = [];
      if (batch.length === 1) {
        await ecourts('POST', `${P}/case/${batch[0]}/refresh`);
      } else {
        const r = await ecourts('POST', `${P}/case/bulk-refresh`, { data: { cnrs: batch } });
        ready = (r.data && r.data.refreshed) || [];
      }
      if (batch.length) {
        // CNRs upstream reports as already fresh need no polling
        await q('INSERT INTO ecourt_refresh_requests (cnr, source, status) VALUES ?',
          [batch.map((c) => [c, 'nightly', ready.includes(c) ? 'COMPLETED' : 'PENDING'])]);
      }

      // 2. poll status (free)
      const done = new Set(ready);
      let pending = batch.filter((c) => !done.has(c));
      for (let i = 0; i < 30 && pending.length; i++) {
        await sleep(10000);
        const s = await ecourts('POST', `${P}/case/bulk-refresh-status`, { data: { cnrs: pending } });
        const results = (s.data && s.data.results) || [];
        for (const it of results) {
          if (it.status === 'COMPLETED') done.add(it.cnr);
          if (it.status === 'FAILED') stats.failed++;
          if (it.status === 'COMPLETED' || it.status === 'FAILED') {
            await q(
              `UPDATE ecourt_refresh_requests SET status=?, credits=?, refunded=?, failure_reason=?, completed_at=NOW()
                WHERE cnr=? AND source='nightly' AND status='PENDING' ORDER BY id DESC LIMIT 1`,
              [it.status, it.creditsCharged != null ? it.creditsCharged : null, it.refunded ? 1 : 0, it.failureReason || null, it.cnr],
            );
          }
        }
        pending = results.filter((it) => it.status === 'PENDING').map((it) => it.cnr);
      }

      // 3 + 4. fetch, diff, alert
      for (const cnr of done) {
        try {
          const r = await ecourts('GET', `${P}/case/${cnr}`);
          const norm = await upsertCase(r.data);
          stats.refreshed++;
          const next = snapshotOf(norm);
          const prev = await readSnapshot(cnr);
          const events = diffSnapshots(prev, next);
          await writeSnapshot(next);
          if (!events.length) continue;
          stats.changed++;
          stats.alerts += await notifyTrackers(norm.row, events, userId);
        } catch (e) {
          stats.failed++;
          log(`[ecourt-sync] ${cnr}: ${e.code || ''} ${e.message}`);
        }
      }
    }
    return stats;
  } finally {
    running = false;
    log(`[ecourt-sync] done ${JSON.stringify(stats)}`);
  }
}

function startEcourtCron() {
  const expr = process.env.ECOURT_SYNC_CRON || '0 2 * * *';
  if (process.env.ECOURT_SYNC_ENABLED === 'false') return null;
  return cron.schedule(expr, () => {
    runEcourtSync().catch((e) => console.error('[ecourt-sync]', e));
  }, { timezone: process.env.ECOURT_SYNC_TZ || 'Asia/Kolkata' });
}

module.exports = { runEcourtSync, startEcourtCron };