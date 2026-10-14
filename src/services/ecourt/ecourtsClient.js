/**
 * Thin axios client for the eCourtsIndia partner API.
 *  - The Bearer key stays on the server (ECOURTS_API_KEY), never in React.
 *  - Array params go out as repeated keys: litigants=A&litigants=B
 *  - Every call is logged in ecourt_api_calls (credit tracking, support request_id).
 */
const axios = require('axios');
const { q } = require('./ecourtDb');
const { EcourtError } = require('./validate');

const P = '/api/partner';

const http = axios.create({ paramsSerializer: { indexes: null } });

const baseUrl = () => (process.env.ECOURTS_BASE_URL || 'https://webapi.ecourtsindia.com').replace(/\/$/, '');

function clean(params) {
  if (!params) return undefined;
  const out = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v)) {
      const arr = v.filter((x) => x !== undefined && x !== null && x !== '');
      if (arr.length) out[k] = arr;
    } else out[k] = v;
  }
  return out;
}

async function logCall(row) {
  try {
    await q(
      'INSERT INTO ecourt_api_calls (user_id, method, endpoint, http_status, request_id, duration_ms, error_code) VALUES (?,?,?,?,?,?,?)',
      [row.userId ? String(row.userId) : null, row.method, String(row.path).slice(0, 255), row.status || null, row.requestId || null, row.ms, row.error || null],
    );
  } catch (_) {
    /* logging must never break a request */
  }
}

/**
 * @param {'GET'|'POST'} method
 * @param {string} path   e.g. `${P}/case/DLHC010001232024`
 * @param {{params?:object, data?:object, headers?:object, userId?:string, auth?:boolean}} opts
 * @returns {Promise<{status:number, data:any, meta:any, retryAfter?:string}>}
 */
async function ecourts(method, path, opts = {}) {
  const { params, data, headers = {}, userId, auth = true } = opts;
  const key = process.env.ECOURTS_API_KEY;
  if (auth && !key) throw new EcourtError(500, 'ECOURTS_NOT_CONFIGURED', 'eCourts API key is not set on the server');

  const started = Date.now();
  try {
    const res = await http.request({
      method,
      url: baseUrl() + path,
      params: clean(params),
      data,
      timeout: Number(process.env.ECOURTS_TIMEOUT_MS || 60000),
      headers: {
        Accept: 'application/json',
        ...(auth ? { Authorization: `Bearer ${key}` } : {}),
        ...headers,
      },
    });
    const body = res.data;
    await logCall({ userId, method, path, status: res.status, requestId: body && body.meta && body.meta.request_id, ms: Date.now() - started });
    return {
      status: res.status,
      data: body && body.data !== undefined ? body.data : body,
      meta: body && body.meta,
      retryAfter: res.headers['retry-after'],
    };
  } catch (e) {
    if (e instanceof EcourtError) throw e;
    const r = e.response;
    if (!r) {
      const code = e.code === 'ECONNABORTED' || e.code === 'ETIMEDOUT' ? 'UPSTREAM_TIMEOUT' : 'UPSTREAM_UNREACHABLE';
      await logCall({ userId, method, path, ms: Date.now() - started, error: code });
      throw new EcourtError(504, code, 'eCourts API did not respond, please try again');
    }
    const b = r.data || {};
    const code = (b.error && b.error.code) || b.code || `HTTP_${r.status}`;
    const message = (b.error && b.error.message) || b.message || 'eCourts API error';
    const requestId = b.meta && b.meta.request_id;
    await logCall({ userId, method, path, status: r.status, requestId, ms: Date.now() - started, error: code });
    // 401/403 from upstream means OUR key is wrong — do not show it as the user's auth problem
    throw new EcourtError(r.status === 401 || r.status === 403 ? 502 : r.status, code, message, {
      retryAfter: r.headers && r.headers['retry-after'],
      requestId,
    });
  }
}

/**
 * LegalCheck paths. submit/status/report are confirmed from the docs.
 * log/list/models were not fully visible on the docs page — confirm at
 * https://ecourtsindia.com/api/docs and edit only here.
 */
const LEGAL_CHECK_PATHS = {
  submit: `${P}/legal-check`,
  status: (code) => `${P}/legal-check/${encodeURIComponent(code)}`,
  report: (code) => `${P}/legal-check/${encodeURIComponent(code)}/report`,
  log: (code) => `${P}/legal-check/${encodeURIComponent(code)}/log`, // TODO confirm
  models: `${P}/legal-check/models`, // TODO confirm
};

module.exports = { ecourts, P, LEGAL_CHECK_PATHS };
