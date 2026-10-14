const { q, tx, parseJson } = require('./ecourtDb');
const { ecourts, P } = require('./ecourtsClient');
const { normalizeCaseDetail, snapshotOf } = require('./caseNormalize');

const CASE_COLS = [
  'cnr', 'title', 'court_name', 'court_code', 'court_no', 'state', 'district', 'case_type', 'case_type_label',
  'case_status', 'disposal_type', 'contested_status', 'category_path', 'filing_number', 'filing_date',
  'registration_number', 'registration_date', 'first_hearing_date', 'last_hearing_date', 'next_hearing_date',
  'decision_date', 'case_duration_days', 'order_count', 'interim_order_count', 'judgment_count', 'hearing_count',
  'ia_count', 'fir_number', 'fir_police_station', 'fir_year', 'upstream_modified_at',
];

/** Save one Case Detail response (child rows replaced). Returns the normalised object. */
async function upsertCase(data) {
  const norm = normalizeCaseDetail(data);
  const { row, parties, hearings, business, orders } = norm;

  await tx(async (conn) => {
    const cols = [...CASE_COLS, 'raw_json'];
    const updates = cols.filter((c) => c !== 'cnr').map((c) => `${c}=VALUES(${c})`).join(', ');
    await conn.query(
      `INSERT INTO ecourt_cases (${cols.join(', ')}) VALUES (?)
       ON DUPLICATE KEY UPDATE ${updates}, fetched_at=NOW()`,
      [[...CASE_COLS.map((c) => row[c]), JSON.stringify(data)]],
    );

    await conn.query('DELETE FROM ecourt_case_parties WHERE cnr=?', [row.cnr]);
    await conn.query('DELETE FROM ecourt_case_hearings WHERE cnr=?', [row.cnr]);
    await conn.query('DELETE FROM ecourt_case_business WHERE cnr=?', [row.cnr]);

    if (parties.length) {
      await conn.query('INSERT INTO ecourt_case_parties (cnr, side, name) VALUES ?', [parties.map((p) => [row.cnr, p.side, p.name])]);
    }
    if (hearings.length) {
      await conn.query('INSERT INTO ecourt_case_hearings (cnr, business_on, hearing_date, purpose, judge) VALUES ?',
        [hearings.map((h) => [row.cnr, h.business_on, h.hearing_date, h.purpose, h.judge])]);
    }
    if (business.length) {
      await conn.query('INSERT INTO ecourt_case_business (cnr, entry_date, court_of, business, next_purpose, next_hearing_date) VALUES ?',
        [business.map((b) => [row.cnr, b.entry_date, b.court_of, b.business, b.next_purpose, b.next_hearing_date])]);
    }
    if (orders.length) {
      await conn.query(
        `INSERT INTO ecourt_case_orders (cnr, filename, kind, order_date, description) VALUES ?
         ON DUPLICATE KEY UPDATE kind=VALUES(kind), order_date=VALUES(order_date), description=VALUES(description)`,
        [orders.map((o) => [row.cnr, o.filename, o.kind, o.order_date, o.description])],
      );
    }
  });
  return norm;
}

/** Case Detail from cache when younger than maxAgeMs, else from eCourts (and cached). */
async function getCase(cnr, { userId, maxAgeMs = 6 * 3600 * 1000, force = false } = {}) {
  if (!force) {
    const rows = await q(
      `SELECT raw_json, DATE_FORMAT(fetched_at, '%Y-%m-%d %H:%i') AS fetched_at,
              TIMESTAMPDIFF(SECOND, fetched_at, NOW()) AS age_s
         FROM ecourt_cases WHERE cnr=?`,
      [cnr],
    );
    if (rows[0] && Number(rows[0].age_s) * 1000 < maxAgeMs) {
      return { data: parseJson(rows[0].raw_json), cached: true, fetchedAt: rows[0].fetched_at };
    }
  }
  const r = await ecourts('GET', `${P}/case/${cnr}`, { userId });
  await upsertCase(r.data);
  return { data: r.data, cached: false, fetchedAt: null, requestId: r.meta && r.meta.request_id };
}

/** Dates are formatted in SQL so a DATE never shifts a day through JS timezones. */
async function readSnapshot(cnr) {
  const rows = await q(
    `SELECT cnr, DATE_FORMAT(next_hearing_date, '%Y-%m-%d') AS next_hearing_date, order_count, ia_count,
            case_status, court_code, last_order_file, DATE_FORMAT(last_order_date, '%Y-%m-%d') AS last_order_date
       FROM ecourt_case_snapshots WHERE cnr=?`,
    [cnr],
  );
  return rows[0] || null;
}

async function writeSnapshot(s) {
  await q(
    `INSERT INTO ecourt_case_snapshots (cnr, next_hearing_date, order_count, ia_count, case_status, court_code, last_order_file, last_order_date)
     VALUES (?,?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE next_hearing_date=VALUES(next_hearing_date), order_count=VALUES(order_count), ia_count=VALUES(ia_count),
       case_status=VALUES(case_status), court_code=VALUES(court_code), last_order_file=VALUES(last_order_file),
       last_order_date=VALUES(last_order_date), snapshot_at=NOW()`,
    [s.cnr, s.next_hearing_date, s.order_count, s.ia_count, s.case_status, s.court_code, s.last_order_file, s.last_order_date],
  );
}

/** Case row for alert messages (dates as YYYY-MM-DD strings). */
async function readCaseRow(cnr) {
  const rows = await q(
    `SELECT cnr, title, court_name, case_status, disposal_type,
            DATE_FORMAT(next_hearing_date, '%Y-%m-%d') AS next_hearing_date
       FROM ecourt_cases WHERE cnr=?`,
    [cnr],
  );
  return rows[0] || null;
}

module.exports = { upsertCase, getCase, readSnapshot, writeSnapshot, readCaseRow, snapshotOf };
