// Input validation helpers for the eCourts integration (pure, no DB).

const CNR_RE = /^[A-Z]{4}\d{12}$/;
const ORDER_FILE_RE = /^[A-Za-z0-9._-]{1,120}\.pdf$/;

class EcourtError extends Error {
  constructor(status, code, message, extra = {}) {
    super(message);
    this.status = status;
    this.code = code;
    Object.assign(this, extra);
  }
}

const normalizeCnr = (v) => String(v || '').trim().toUpperCase().replace(/\s+/g, '');

function assertCnr(v) {
  const cnr = normalizeCnr(v);
  if (!CNR_RE.test(cnr)) throw new EcourtError(400, 'INVALID_CNR', 'CNR must be 4 letters followed by 12 digits');
  return cnr;
}

function assertOrderFile(v) {
  const f = String(v || '');
  if (!ORDER_FILE_RE.test(f)) throw new EcourtError(400, 'INVALID_FILENAME', 'Order filename must look like order-1.pdf');
  return f;
}

/** Split, normalise, dedupe and classify a list of CNRs (bulk tools). */
function parseCnrList(input, max) {
  const raw = Array.isArray(input) ? input : String(input || '').split(/[\s,]+/);
  const seen = new Set();
  const valid = [];
  const invalid = [];
  let duplicates = 0;
  for (const item of raw) {
    const c = normalizeCnr(item);
    if (!c) continue;
    if (seen.has(c)) { duplicates++; continue; }
    seen.add(c);
    (CNR_RE.test(c) ? valid : invalid).push(c);
  }
  if (valid.length > max) throw new EcourtError(400, 'BATCH_SIZE_EXCEEDED', `At most ${max} CNRs per request`);
  return { valid, invalid, duplicates };
}

function pickDefined(obj, keys) {
  const out = {};
  for (const k of keys) {
    const v = obj ? obj[k] : undefined;
    if (v === undefined || v === null || v === '') continue;
    out[k] = v;
  }
  return out;
}

module.exports = { CNR_RE, EcourtError, normalizeCnr, assertCnr, assertOrderFile, parseCnrList, pickDefined };
