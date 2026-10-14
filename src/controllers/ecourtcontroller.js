
require('dotenv').config();
const crypto = require('crypto');
const { q, parseJson } = require('../services/ecourt/ecourtDb');
const { ecourts, P, LEGAL_CHECK_PATHS: LC } = require('../services/ecourt/ecourtsClient');
const { EcourtError, assertCnr, assertOrderFile, parseCnrList, pickDefined } = require('../services/ecourt/validate');
const { getCase, readSnapshot, writeSnapshot, readCaseRow } = require('../services/ecourt/caseStore');
const { normalizeCaseDetail, snapshotOf } = require('../services/ecourt/caseNormalize');
const { nameMatchScore } = require('../services/ecourt/names');
const { runEcourtSync } = require('../cron/Ecourtsync');


const handle = (fn) => async (req, res) => {
  try {
    await fn(req, res);
  } catch (err) {
    const known = err instanceof EcourtError;
    const status = known && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) console.error('[ecourt]', err);
    if (err.retryAfter) res.set('Retry-After', String(err.retryAfter));
    res.status(status).json({
      error: {
        code: known ? err.code : 'INTERNAL',
        message: known ? err.message : 'Something went wrong',
        ...(err.requestId ? { requestId: err.requestId } : {}),
      },
    });
  }
};


function userId(req) {
  const u = req.user || {};
  const id = u.id || u.userId || u.user_id || u._id;
  if (id) return String(id);
  if (process.env.NODE_ENV !== 'production' && process.env.ECOURT_DEV_HEADER_AUTH === 'true' && req.get('x-user-id')) {
    return String(req.get('x-user-id'));
  }
  throw new EcourtError(401, 'UNAUTHENTICATED', 'Please sign in again');
}

const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const seg = (v) => encodeURIComponent(String(v).slice(0, 40));
const asArray = (v) => (v === undefined ? undefined : (Array.isArray(v) ? v : [v]));

const memo = new Map();
async function cached(key, ttlMs, fn) {
  const hit = memo.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value;
  const value = await fn();
  memo.set(key, { at: Date.now(), value });
  return value;
}


exports.getSearchCapabilities = handle(async (req, res) => {
  const uid = userId(req);
  const data = await cached('capabilities', 3600e3, async () => (await ecourts('GET', `${P}/search/capabilities`, { userId: uid })).data);
  res.json(data);
});

// GET /api/ecourt/enums?types=caseStatus,caseType
exports.getEnums = handle(async (req, res) => {
  userId(req);
  const types = String(req.query.types || '').replace(/[^A-Za-z,]/g, '');
  const data = await cached(`enums:${types}`, 3600e3, async () => (await ecourts('GET', `${P}/enums`, { params: { types }, auth: false })).data);
  res.json(data);
});



const SEARCH_SCALARS = ['query', 'nameMatchMode', 'filingDateFrom', 'filingDateTo', 'page', 'pageSize'];

const SEARCH_ARRAYS = ['litigants', 'petitioners', 'respondents', 'advocates', 'judges',
  'courtCodes', 'caseTypes', 'caseStatuses', 'stateCodes', 'courtLevels'];


exports.searchCases = handle(async (req, res) => {
  const uid = userId(req);
  const params = {};
  for (const k of SEARCH_SCALARS) if (req.query[k] !== undefined && req.query[k] !== '') params[k] = String(req.query[k]).slice(0, 200);
  for (const k of SEARCH_ARRAYS) {
    const v = asArray(req.query[k]);
    if (v) params[k] = v.map((x) => String(x).trim().slice(0, 120)).filter(Boolean).slice(0, 20);
  }
  if (params.pageSize) params.pageSize = String(Math.min(200, Math.max(1, Number(params.pageSize) || 20)));
  const hasCriterion = Object.keys(params).some((k) => !['page', 'pageSize', 'nameMatchMode'].includes(k) && params[k].length !== 0);
  if (!hasCriterion) throw new EcourtError(400, 'MISSING_SEARCH_CRITERIA', 'Add a keyword, a name or a filter');
  const r = await ecourts('GET', `${P}/search`, { params, userId: uid });
  res.json(r.data);
});

// GET /api/ecourt/cases/:cnr?fresh=1
exports.getCaseDetail = handle(async (req, res) => {
  const uid = userId(req);
  const cnr = assertCnr(req.params.cnr);
  const out = await getCase(cnr, { userId: uid, force: req.query.fresh === '1' });
  res.json(out);
});

// GET /api/ecourt/cases/:cnr/orders/:file/ai   → 200 ready | 202 processing (retry in ~20 s, max 3)
exports.getOrderAi = handle(async (req, res) => {
  const uid = userId(req);
  const cnr = assertCnr(req.params.cnr);
  const file = assertOrderFile(req.params.file);
  const rows = await q('SELECT extracted_text, ai_json FROM ecourt_order_ai WHERE cnr=? AND filename=? AND ai_json IS NOT NULL', [cnr, file]);
  if (rows[0]) {
    return res.json({ status: 'ready', cached: true, extractedText: rows[0].extracted_text, aiAnalysis: parseJson(rows[0].ai_json) });
  }
  const r = await ecourts('GET', `${P}/case/${cnr}/order-ai/${encodeURIComponent(file)}`, { userId: uid });
  if (!r.data || !r.data.aiAnalysis) return res.status(202).json({ status: 'processing', retryAfterSeconds: 20 });
  await q(
    `INSERT INTO ecourt_order_ai (cnr, filename, extracted_text, ai_json) VALUES (?,?,?,?)
     ON DUPLICATE KEY UPDATE extracted_text=VALUES(extracted_text), ai_json=VALUES(ai_json)`,
    [cnr, file, r.data.extractedText || null, JSON.stringify(r.data.aiAnalysis)],
  );
  res.json({ status: 'ready', cached: false, extractedText: r.data.extractedText, aiAnalysis: r.data.aiAnalysis });
});

async function fetchOrderMd(cnr, file, signed, uid) {
  const r = await ecourts('GET', `${P}/case/${cnr}/order-md/${encodeURIComponent(file)}`, { params: { signed: String(signed) }, userId: uid });
  return r.data || {};
}

// GET /api/ecourt/cases/:cnr/orders/:file/markdown
exports.getOrderMarkdown = handle(async (req, res) => {
  const uid = userId(req);
  const cnr = assertCnr(req.params.cnr);
  const file = assertOrderFile(req.params.file);
  const rows = await q('SELECT markdown FROM ecourt_order_ai WHERE cnr=? AND filename=? AND markdown IS NOT NULL', [cnr, file]);
  if (rows[0]) return res.json({ markdown: rows[0].markdown, cached: true });
  const data = await fetchOrderMd(cnr, file, true, uid);
  if (data.markdownContent) {
    await q('INSERT INTO ecourt_order_ai (cnr, filename, markdown) VALUES (?,?,?) ON DUPLICATE KEY UPDATE markdown=VALUES(markdown)',
      [cnr, file, data.markdownContent]);
  }
  res.json({ markdown: data.markdownContent || null, cached: false });
});

// GET /api/ecourt/cases/:cnr/orders/:file/pdf?signed=true|false
// (/order/{file} returns metadata only, so the bytes come from order-md's pdfBase64)
exports.downloadOrderPdf = handle(async (req, res) => {
  const uid = userId(req);
  const cnr = assertCnr(req.params.cnr);
  const file = assertOrderFile(req.params.file);
  const signed = req.query.signed !== 'false';
  const data = await fetchOrderMd(cnr, file, signed, uid);
  if (!data.pdfBase64) throw new EcourtError(502, 'NO_PDF', 'The PDF could not be produced, try again later');
  res.set('Content-Type', 'application/pdf');
  res.set('Content-Disposition', `attachment; filename="ecourtsindia-${signed ? 'truecopy' : 'unsigned'}-${cnr}-${file}"`);
  res.send(Buffer.from(data.pdfBase64, 'base64'));
});

/* ========================================================== 3. Refresh */

// POST /api/ecourt/cases/:cnr/refresh  → 202 QUEUED, fetch detail with ?fresh=1 after 5–10 s
exports.refreshCase = handle(async (req, res) => {
  const uid = userId(req);
  const cnr = assertCnr(req.params.cnr);
  const r = await ecourts('POST', `${P}/case/${cnr}/refresh`, { userId: uid });
  await q('INSERT INTO ecourt_refresh_requests (user_id, cnr, source, status) VALUES (?,?,?,?)', [uid, cnr, 'single', (r.data && r.data.status) || 'QUEUED']);
  res.status(202).json(r.data);
});

// POST /api/ecourt/cases/bulk-refresh   { cnrs: [...] | "text" }
exports.bulkRefresh = handle(async (req, res) => {
  const uid = userId(req);
  const { valid, invalid, duplicates } = parseCnrList(req.body && req.body.cnrs, 50);
  if (!valid.length) throw new EcourtError(400, 'INVALID_CNR', 'No valid CNRs in the list');
  let data;
  if (valid.length === 1) {
    // upstream bulk needs 2–50
    await ecourts('POST', `${P}/case/${valid[0]}/refresh`, { userId: uid });
    data = { refreshed: [], queued: [valid[0]], invalid: [] };
  } else {
    data = (await ecourts('POST', `${P}/case/bulk-refresh`, { data: { cnrs: valid }, userId: uid })).data || {};
  }
  await q('INSERT INTO ecourt_refresh_requests (user_id, cnr, source, status) VALUES ?', [valid.map((c) => [uid, c, 'bulk', 'PENDING'])]);
  res.json({
    refreshed: data.refreshed || [],
    queued: data.queued || [],
    invalid: [...new Set([...(data.invalid || []), ...invalid])],
    duplicatesRemoved: duplicates,
  });
});

// POST /api/ecourt/cases/bulk-refresh-status   { cnrs: [...] }   (free upstream)
exports.bulkRefreshStatus = handle(async (req, res) => {
  const uid = userId(req);
  const { valid, invalid } = parseCnrList(req.body && req.body.cnrs, 50);
  const extra = invalid.map((cnr) => ({ cnr, status: 'INVALID' }));
  if (!valid.length) return res.json({ results: extra });
  const r = await ecourts('POST', `${P}/case/bulk-refresh-status`, { data: { cnrs: valid }, userId: uid });
  const results = (r.data && r.data.results) || [];
  for (const it of results) {
    if (it.status !== 'COMPLETED' && it.status !== 'FAILED') continue;
    await q(
      `UPDATE ecourt_refresh_requests SET status=?, credits=?, refunded=?, failure_reason=?, completed_at=NOW()
        WHERE cnr=? AND user_id=? AND status='PENDING' ORDER BY id DESC LIMIT 1`,
      [it.status, it.creditsCharged != null ? it.creditsCharged : null, it.refunded ? 1 : 0, it.failureReason || null, it.cnr, uid],
    );
  }
  res.json({ results: [...results, ...extra] });
});

/* ======================================================== 4. Cause list */

// Court structure: State → District → Complex → Court (free, cached 12 h)
exports.getStates = handle(async (req, res) => {
  const uid = userId(req);
  res.json(await cached('cs:states', 12 * 3600e3, async () => (await ecourts('GET', `${P}/causelist/court-structure/states`, { userId: uid })).data));
});

exports.getDistricts = handle(async (req, res) => {
  const uid = userId(req);
  const p = `${P}/causelist/court-structure/states/${seg(req.params.state)}/districts`;
  res.json(await cached(`cs:${p}`, 12 * 3600e3, async () => (await ecourts('GET', p, { userId: uid })).data));
});

exports.getComplexes = handle(async (req, res) => {
  const uid = userId(req);
  const p = `${P}/causelist/court-structure/states/${seg(req.params.state)}/districts/${seg(req.params.district)}/complexes`;
  res.json(await cached(`cs:${p}`, 12 * 3600e3, async () => (await ecourts('GET', p, { userId: uid })).data));
});

exports.getCourts = handle(async (req, res) => {
  const uid = userId(req);
  const p = `${P}/causelist/court-structure/states/${seg(req.params.state)}/districts/${seg(req.params.district)}/complexes/${seg(req.params.complex)}/courts`;
  res.json(await cached(`cs:${p}`, 12 * 3600e3, async () => (await ecourts('GET', p, { userId: uid })).data));
});

const LOCATION_KEYS = ['state', 'districtCode', 'courtComplexCode', 'courtNo', 'court'];

// GET /api/ecourt/causelist/available-dates?state=&districtCode=&courtComplexCode=
exports.getAvailableDates = handle(async (req, res) => {
  const uid = userId(req);
  const params = pickDefined(req.query, LOCATION_KEYS);
  if (!Object.keys(params).length) throw new EcourtError(400, 'MISSING_LOCATION', 'Pick at least a state');
  res.json((await ecourts('GET', `${P}/causelist/available-dates`, { params, userId: uid })).data);
});

const CAUSE_KEYS = ['q', 'date', 'startDate', 'endDate', 'judge', 'advocate', 'litigant', 'listType', 'bench', 'limit', 'offset', 'includeCourtroom', ...LOCATION_KEYS];

// GET /api/ecourt/causelist/search?...
exports.searchCauseList = handle(async (req, res) => {
  const uid = userId(req);
  const params = pickDefined(req.query, CAUSE_KEYS);
  const filters = Object.keys(params).filter((k) => !['limit', 'offset', 'includeCourtroom'].includes(k));
  if (!filters.length) throw new EcourtError(400, 'MISSING_SEARCH_CRITERIA', 'Add at least one filter');
  params.limit = String(Math.min(200, Number(params.limit) || 50));
  res.json((await ecourts('GET', `${P}/causelist/search`, { params, userId: uid })).data);
});

// POST /api/ecourt/causelist/cnr-batch   { cnrs: [...] }  (≤100, charged per distinct CNR)
exports.checkCnrBatch = handle(async (req, res) => {
  const uid = userId(req);
  const { valid, invalid } = parseCnrList(req.body && req.body.cnrs, 100);
  if (!valid.length) throw new EcourtError(400, 'INVALID_CNR', 'No valid CNRs in the list');
  const r = await ecourts('POST', `${P}/causelist/cnr/batch`, { data: { cnrs: valid }, userId: uid });
  res.json({ results: r.data || [], invalid });
});

/* ======================================================== 5. LegalCheck */

const LC_PURPOSES = ['vendor_onboarding', 'employment_screening', 'tenant_verification', 'partnership_due_diligence', 'litigation_research'];

async function ownCheck(uid, code) {
  if (!/^LC-[A-Z0-9]{4,20}$/.test(String(code))) throw new EcourtError(400, 'INVALID_CODE', 'Unknown check code');
  const rows = await q('SELECT * FROM ecourt_legal_checks WHERE code=? AND user_id=?', [code, uid]);
  if (!rows[0]) throw new EcourtError(404, 'NOT_FOUND', 'Check not found');
  return rows[0];
}

exports.getLegalCheckModels = handle(async (req, res) => {
  const uid = userId(req);
  res.json((await ecourts('GET', LC.models, { userId: uid })).data);
});

// POST /api/ecourt/legal-check  { subject_type, subject:{...}, config:{purpose,...}, consent:{confirmed:true} }
exports.submitLegalCheck = handle(async (req, res) => {
  const uid = userId(req);
  const { subject_type: type, subject = {}, config: cfg = {}, consent } = req.body || {};
  if (type !== 'individual' && type !== 'company') throw new EcourtError(400, 'INVALID_SUBJECT_TYPE', 'Choose individual or company');
  const name = type === 'individual' ? subject.name : subject.company_name;
  if (!name || String(name).trim().length < 2) throw new EcourtError(400, 'MISSING_NAME', 'Subject name is required');
  if (type === 'individual' && !subject.father_name) throw new EcourtError(400, 'MISSING_FATHER_NAME', "Father's name is required for individuals");
  if (!LC_PURPOSES.includes(cfg.purpose)) throw new EcourtError(400, 'INVALID_PURPOSE', 'Choose a lawful purpose');
  if (!consent || consent.confirmed !== true) throw new EcourtError(400, 'CONSENT_REQUIRED', 'Confirm consent or another lawful basis (DPDP Act, 2023)');

  const subjectHash = sha256([type, name, subject.father_name, subject.date_of_birth, subject.cin].join('|').toLowerCase());
  const consentRow = await q('INSERT INTO ecourt_consent_records (user_id, kind, subject_hash, purpose, ip) VALUES (?,?,?,?,?)',
    [uid, 'legal_check', subjectHash, cfg.purpose, req.ip]);

  // Same subject, same user, same day → same key → upstream never double-charges a double click
  const idemKey = `jb-${uid}-${subjectHash.slice(0, 24)}-${new Date().toISOString().slice(0, 10)}`.slice(0, 255);
  const body = {
    subject_type: type,
    subject: type === 'individual'
      ? pickDefined(subject, ['name', 'father_name', 'aliases', 'date_of_birth', 'addresses', 'gender', 'notes'])
      : pickDefined(subject, ['company_name', 'directors', 'registered_addresses', 'cin', 'gst', 'pan', 'company_type', 'notes']),
    config: pickDefined(cfg, ['model', 'purpose', 'ticket_size', 'client_ref_no']),
  };
  const r = await ecourts('POST', LC.submit, { data: body, headers: { 'Idempotency-Key': idemKey }, userId: uid });
  await q(
    `INSERT INTO ecourt_legal_checks (code, user_id, subject_type, subject_name, purpose, client_ref_no, idempotency_key, status, consent_id)
     VALUES (?,?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE status=VALUES(status)`,
    [r.data.code, uid, type, String(name).slice(0, 255), cfg.purpose, cfg.client_ref_no || null, idemKey, r.data.status || 'queued', consentRow.insertId],
  );
  res.status(202).json(r.data);
});

// GET /api/ecourt/legal-check/:code   (free; honour Retry-After while queued/running)
exports.getLegalCheckStatus = handle(async (req, res) => {
  const uid = userId(req);
  const row = await ownCheck(uid, req.params.code);
  const r = await ecourts('GET', LC.status(row.code), { userId: uid });
  const st = r.data && r.data.status;
  if (st && st !== row.status) {
    await q(`UPDATE ecourt_legal_checks SET status=?, completed_at=IF(? IN ('completed','failed'), NOW(), completed_at) WHERE code=?`, [st, st, row.code]);
  }
  if (r.retryAfter) res.set('Retry-After', String(r.retryAfter));
  res.json(r.data);
});

// GET /api/ecourt/legal-check/:code/report?verbosity=&bands=&min_score=&include=   (409 NOT_READY passes through)
exports.getLegalCheckReport = handle(async (req, res) => {
  const uid = userId(req);
  const row = await ownCheck(uid, req.params.code);
  const params = pickDefined(req.query, ['verbosity', 'bands', 'min_score', 'include']);
  const r = await ecourts('GET', LC.report(row.code), { params, userId: uid });
  const risk = (r.data && r.data.risk) || {};
  await q(
    `UPDATE ecourt_legal_checks SET status='completed', risk_score=?, risk_band=?, report_json=?, completed_at=COALESCE(completed_at, NOW()) WHERE code=?`,
    [risk.score != null ? risk.score : null, risk.band || null, JSON.stringify(r.data), row.code],
  );
  res.json(r.data);
});

exports.getLegalCheckLog = handle(async (req, res) => {
  const uid = userId(req);
  const row = await ownCheck(uid, req.params.code);
  res.json((await ecourts('GET', LC.log(row.code), { userId: uid })).data);
});

// GET /api/ecourt/legal-check — from OUR table. The upstream list is partner-wide (every Jurist Bot user),
// so it must never be passed straight to one user.
exports.listLegalChecks = handle(async (req, res) => {
  const uid = userId(req);
  const rows = await q(
    `SELECT code, subject_type, subject_name, purpose, client_ref_no, status, risk_score, risk_band,
            DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at, DATE_FORMAT(completed_at, '%Y-%m-%d %H:%i') AS completed_at
       FROM ecourt_legal_checks WHERE user_id=? ORDER BY created_at DESC LIMIT 100`,
    [uid],
  );
  res.json({ checks: rows });
});

/* ============================================ 6. Electoral (EPIC verify only)
 * No address, house, relatives, polling station, age or gender leave the server.
 * Name-based roll search and household lookup are not exposed to the browser.
 */
const EPIC_RE = /^[A-Z]{3}\d{7}$/; // common format — widen if you see valid older formats
const EPIC_PURPOSES = ['client_kyc', 'legal_check_identity', 'employment_verification'];

exports.getElectoralCapabilities = handle(async (req, res) => {
  const uid = userId(req);
  res.json((await ecourts('GET', `${P}/electoral/capabilities`, { userId: uid })).data);
});

// POST /api/ecourt/electoral/epic/verify  { epic, name, purpose, consent:true }
exports.verifyEpic = handle(async (req, res) => {
  const uid = userId(req);
  const b = req.body || {};
  const epic = String(b.epic || '').trim().toUpperCase();
  const name = String(b.name || '').trim();
  if (!EPIC_RE.test(epic)) throw new EcourtError(400, 'INVALID_EPIC', 'EPIC should be 3 letters and 7 digits');
  if (name.length < 2) throw new EcourtError(400, 'MISSING_NAME', 'Enter the name to compare');
  if (!EPIC_PURPOSES.includes(b.purpose)) throw new EcourtError(400, 'INVALID_PURPOSE', 'Choose a purpose');
  if (b.consent !== true) throw new EcourtError(400, 'CONSENT_REQUIRED', 'The person must share the EPIC and consent');

  const epicHash = sha256(epic);
  const consent = await q('INSERT INTO ecourt_consent_records (user_id, kind, subject_hash, purpose, ip) VALUES (?,?,?,?,?)',
    [uid, 'epic_verify', epicHash, b.purpose, req.ip]);

  const r = await ecourts('GET', `${P}/electoral/epic/${encodeURIComponent(epic)}`, { userId: uid });
  const person = r.data && r.data.persons && r.data.persons[0];
  const occ = person ? [...(person.occurrences || [])].sort((x, y) => (y.year || 0) - (x.year || 0))[0] : null;
  const score = person ? nameMatchScore(name, person.nameLatin || (occ && occ.nameLatin)) : 0;
  const result = {
    found: Boolean(person),
    nameMatch: score >= 80,
    matchScore: score,
    nameOnRoll: (person && person.nameLatin) || null,
    stateName: (occ && occ.stateName) || null,
    districtName: (occ && occ.districtName) || null,
    acNumber: occ && occ.acNumber != null ? occ.acNumber : null,
    acName: (occ && occ.acName) || null,
    latestRollYear: (occ && occ.year) || null,
    rollType: (occ && occ.rollType) || null,
    deleted: occ ? Boolean(occ.deleted) : null,
  };
  await q('INSERT INTO ecourt_epic_verifications (user_id, consent_id, epic_hash, found, name_match, match_score) VALUES (?,?,?,?,?,?)',
    [uid, consent.insertId, epicHash, result.found ? 1 : 0, result.nameMatch ? 1 : 0, score]);
  res.json(result);
});

/* ================================================ 7. Tracker & alerts */

const EVENTS = ['new_order', 'date_changed', 'ia_filed', 'transferred', 'disposed'];
const cleanEvents = (list) => {
  const out = (Array.isArray(list) ? list : EVENTS).filter((e) => EVENTS.includes(e));
  return out.length ? out : EVENTS;
};

// GET /api/ecourt/tracker/cases
exports.listTrackedCases = handle(async (req, res) => {
  const uid = userId(req);
  const rows = await q(
    `SELECT t.id, t.cnr, t.relationship, t.notify_whatsapp, t.notify_email, t.events,
            cl.name AS client_name, cl.phone_e164, (cl.wa_opt_in_at IS NOT NULL) AS wa_opted_in,
            c.title, c.court_name, c.case_status,
            DATE_FORMAT(c.next_hearing_date, '%Y-%m-%d') AS next_hearing_date,
            DATE_FORMAT(c.fetched_at, '%Y-%m-%d %H:%i') AS fetched_at,
            (SELECT JSON_OBJECT('event', a.event_type, 'status', a.status, 'at', DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i'))
               FROM ecourt_alert_log a WHERE a.tracked_case_id = t.id ORDER BY a.id DESC LIMIT 1) AS last_alert
       FROM ecourt_tracked_cases t
       LEFT JOIN ecourt_clients cl ON cl.id = t.client_id
       LEFT JOIN ecourt_cases c ON c.cnr = t.cnr
      WHERE t.user_id=? AND t.active=1
      ORDER BY c.next_hearing_date IS NULL, c.next_hearing_date`,
    [uid],
  );
  res.json({
    cases: rows.map((r) => ({
      ...r,
      notify_whatsapp: Boolean(r.notify_whatsapp),
      notify_email: Boolean(r.notify_email),
      wa_opted_in: Boolean(r.wa_opted_in),
      events: parseJson(r.events) || [],
      last_alert: r.last_alert ? parseJson(r.last_alert) : null,
    })),
  });
});

// POST /api/ecourt/tracker/cases  { cnr, clientName, phone, email?, relationship, events[], notifyWhatsapp, waOptIn }
exports.trackCase = handle(async (req, res) => {
  const uid = userId(req);
  const b = req.body || {};
  const cnr = assertCnr(b.cnr);
  const clientName = String(b.clientName || '').trim();
  const phone = b.phone ? toE164India(b.phone) : null;
  if (!clientName) throw new EcourtError(400, 'MISSING_CLIENT', 'Client name is required');
  if (b.phone && !phone) throw new EcourtError(400, 'INVALID_PHONE', 'Enter a 10-digit Indian mobile number');
  const waOptIn = b.waOptIn === true && Boolean(phone);

  const { data } = await getCase(cnr, { userId: uid }); // confirms the case exists, caches it
  const norm = normalizeCaseDetail(data);

  const cl = await q('INSERT INTO ecourt_clients (user_id, name, phone_e164, email, wa_opt_in_at) VALUES (?,?,?,?,?)',
    [uid, clientName.slice(0, 160), phone, b.email || null, waOptIn ? new Date() : null]);
  const ins = await q(
    `INSERT INTO ecourt_tracked_cases (user_id, client_id, cnr, relationship, notify_whatsapp, notify_email, events)
     VALUES (?,?,?,?,?,?,?)
     ON DUPLICATE KEY UPDATE client_id=VALUES(client_id), active=1, relationship=VALUES(relationship),
       notify_whatsapp=VALUES(notify_whatsapp), notify_email=VALUES(notify_email), events=VALUES(events), id=LAST_INSERT_ID(id)`,
    [uid, cl.insertId, cnr, b.relationship === 'tracking' ? 'tracking' : 'representing',
      b.notifyWhatsapp === false ? 0 : 1, b.notifyEmail ? 1 : 0, JSON.stringify(cleanEvents(b.events))],
  );

  if (!(await readSnapshot(cnr))) await writeSnapshot(snapshotOf(norm));

  let confirmation = null;
  if (waOptIn) {
    confirmation = await deliverWhatsApp({
      trackedId: ins.insertId,
      client: { phone_e164: phone, wa_opt_in_at: new Date() },
      caseRow: norm.row,
      event: { type: 'tracking_started' },
    });
  }
  res.status(201).json({ id: ins.insertId, cnr, title: norm.row.title, nextHearingDate: norm.row.next_hearing_date, confirmation });
});

// PATCH /api/ecourt/tracker/cases/:id  { notifyWhatsapp?, notifyEmail?, events? }
exports.updateTrackedCase = handle(async (req, res) => {
  const uid = userId(req);
  const b = req.body || {};
  const sets = [];
  const vals = [];
  if (typeof b.notifyWhatsapp === 'boolean') { sets.push('notify_whatsapp=?'); vals.push(b.notifyWhatsapp ? 1 : 0); }
  if (typeof b.notifyEmail === 'boolean') { sets.push('notify_email=?'); vals.push(b.notifyEmail ? 1 : 0); }
  if (Array.isArray(b.events)) { sets.push('events=?'); vals.push(JSON.stringify(cleanEvents(b.events))); }
  if (!sets.length) throw new EcourtError(400, 'NOTHING_TO_UPDATE', 'No changes sent');
  const r = await q(`UPDATE ecourt_tracked_cases SET ${sets.join(', ')} WHERE id=? AND user_id=?`, [...vals, Number(req.params.id), uid]);
  if (!r.affectedRows) throw new EcourtError(404, 'NOT_FOUND', 'Tracked case not found');
  res.json({ ok: true });
});

// DELETE /api/ecourt/tracker/cases/:id
exports.untrackCase = handle(async (req, res) => {
  const uid = userId(req);
  const r = await q('UPDATE ecourt_tracked_cases SET active=0 WHERE id=? AND user_id=?', [Number(req.params.id), uid]);
  if (!r.affectedRows) throw new EcourtError(404, 'NOT_FOUND', 'Tracked case not found');
  res.json({ ok: true });
});

// GET /api/ecourt/tracker/alerts?cnr=
exports.listAlerts = handle(async (req, res) => {
  const uid = userId(req);
  const cnr = req.query.cnr ? assertCnr(req.query.cnr) : null;
  const rows = await q(
    `SELECT a.id, a.cnr, a.event_type, a.channel, a.recipient, a.message, a.status, a.error,
            DATE_FORMAT(a.created_at, '%Y-%m-%d %H:%i') AS created_at, c.title
       FROM ecourt_alert_log a
       JOIN ecourt_tracked_cases t ON t.id = a.tracked_case_id
       LEFT JOIN ecourt_cases c ON c.cnr = a.cnr
      WHERE t.user_id=? ${cnr ? 'AND a.cnr=?' : ''}
      ORDER BY a.id DESC LIMIT 100`,
    cnr ? [uid, cnr] : [uid],
  );
  res.json({ alerts: rows });
});

// POST /api/ecourt/tracker/alerts/:id/resend
exports.resendAlert = handle(async (req, res) => {
  const uid = userId(req);
  const rows = await q(
    `SELECT a.cnr, a.event_type, t.id AS tid, cl.phone_e164, cl.wa_opt_in_at
       FROM ecourt_alert_log a
       JOIN ecourt_tracked_cases t ON t.id = a.tracked_case_id
       LEFT JOIN ecourt_clients cl ON cl.id = t.client_id
      WHERE a.id=? AND t.user_id=?`,
    [Number(req.params.id), uid],
  );
  const a = rows[0];
  if (!a) throw new EcourtError(404, 'NOT_FOUND', 'Alert not found');
  const caseRow = await readCaseRow(a.cnr);
  if (!caseRow) throw new EcourtError(404, 'NOT_FOUND', 'Case not cached yet');
  const snap = await readSnapshot(a.cnr);
  const out = await deliverWhatsApp({
    trackedId: a.tid,
    client: a,
    caseRow,
    event: { type: a.event_type, orderDate: snap && snap.last_order_date, to: caseRow.next_hearing_date },
  });
  res.json(out);
});

// POST /api/ecourt/tracker/sync — "Sync now" for this user's cases (runs in the background)
exports.syncNow = handle(async (req, res) => {
  const uid = userId(req);
  runEcourtSync({ userId: uid }).catch((e) => console.error('[ecourt-sync]', e));
  res.status(202).json({ status: 'started' });
});