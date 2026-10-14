// Pure: event + case row → WhatsApp template params and a plain-text copy for the log.

function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

/**
 * WhatsApp template (category UTILITY), body with 5 variables:
 *   {{1}} · {{2}}
 *   CNR: {{3}}
 *   {{4}}
 *   Next hearing: {{5}}
 */
function buildAlert(event, c) {
  const map = {
    tracking_started: ['Case tracking started', 'You will get a message here when this case has a new order, date or filing.'],
    new_order: ['New court order', `Order dated ${fmtDate(event.orderDate)} uploaded.`],
    date_changed: ['Hearing date changed', `Moved from ${fmtDate(event.from)} to ${fmtDate(event.to)}.`],
    ia_filed: ['Interim application filed', `${event.count || 1} new IA on record.`],
    transferred: ['Case transferred', `Now in ${c.court_name || event.to || 'another court'}.`],
    disposed: ['Case disposed', `Final status: ${c.disposal_type || c.case_status || 'Disposed'}.`],
  };
  const [headline, details] = map[event.type] || ['Case update', ''];
  const next = event.type === 'disposed' ? '—' : fmtDate(c.next_hearing_date);
  const params = [headline, c.title, c.cnr, details, next];
  const text = `${headline} · ${c.title}\nCNR: ${c.cnr}\n${details}\nNext hearing: ${next}`;
  return { params, text };
}

module.exports = { fmtDate, buildAlert };
