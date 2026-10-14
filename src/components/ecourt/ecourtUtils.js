// Route root of the eCourts pages — keep in sync with App.js and Navbar.js
export const EC_ROOT = '/ecourt';
export const ecPath = (p) => (p ? `${EC_ROOT}/${p}` : EC_ROOT);
export const CNR_RE = /^[A-Z]{4}\d{12}$/;
export const normalizeCnr = (v) => String(v || '').trim().toUpperCase().replace(/\s+/g, '');
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function fmtDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return String(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function caseTitle(c) {
  const p = (c && c.petitioners && c.petitioners.join(', ')) || 'Unknown';
  const r = (c && c.respondents && c.respondents.join(', ')) || 'Unknown';
  return `${p} vs ${r}`;
}

export function statusBadge(status) {
  return String(status || '').toUpperCase() === 'PENDING' ? 'ec-badge ec-badge-blue' : 'ec-badge ec-badge-grey';
}

export function parseCnrText(text) {
  const seen = new Set();
  const valid = [];
  const invalid = [];
  let duplicates = 0;
  String(text || '').split(/[\s,]+/).forEach((item) => {
    const c = normalizeCnr(item);
    if (!c) return;
    if (seen.has(c)) { duplicates += 1; return; }
    seen.add(c);
    (CNR_RE.test(c) ? valid : invalid).push(c);
  });
  return { valid, invalid, duplicates };
}

export const ALERT_EVENTS = [
  { id: 'new_order', label: 'New order / judgment', hint: 'Link to the order' },
  { id: 'date_changed', label: 'Hearing date changed', hint: 'Old date → new date' },
  { id: 'ia_filed', label: 'IA filed', hint: 'Interim application on record' },
  { id: 'transferred', label: 'Case transferred', hint: 'New court or judge' },
  { id: 'disposed', label: 'Case disposed', hint: 'Final status reached' },
];