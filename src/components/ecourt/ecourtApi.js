
import axiosInstance from '../config/apiconfig';

const BASE = '/ecourt';

export class EcourtApiError extends Error {
  constructor(status, code, message, retryAfter) {
    super(message);
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

function clean(params) {
  if (!params) return undefined;
  const out = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      const arr = v.filter((x) => x !== undefined && x !== null && x !== '');
      if (arr.length) out[k] = arr;
    } else {
      out[k] = v;
    }
  });
  return out;
}

async function toError(err) {
  if (!err.response) {
    const slow = err.code === 'ECONNABORTED';
    return new EcourtApiError(0, slow ? 'TIMEOUT' : 'NETWORK', slow ? 'This is taking too long. Please try again.' : 'Cannot reach the server. Check your connection.');
  }
  const { status, headers } = err.response;
  let data = err.response.data;
  if (typeof Blob !== 'undefined' && data instanceof Blob) {
    try { data = JSON.parse(await data.text()); } catch (_) { data = {}; }
  }
  const e = (data && data.error) || {};
  if (status === 401) {
    return new EcourtApiError(401, 'UNAUTHENTICATED', 'Your session has expired. Please log in again.');
  }
  return new EcourtApiError(status, e.code || `HTTP_${status}`, e.message || 'Request failed', headers && headers['retry-after']);
}

async function call(method, url, { params, data, timeout, responseType } = {}) {
  try {
    return await axiosInstance.request({
      method,
      url: BASE + url,
      params: clean(params),
      data,
      timeout,
      responseType,
      paramsSerializer: { indexes: null }, // arrays as ?litigants=A&litigants=B
    });
  } catch (err) {
    throw await toError(err);
  }
}

const get = (url, params, timeout = 60000) => call('get', url, { params, timeout }).then((r) => r.data);
const post = (url, data, timeout = 60000) => call('post', url, { data, timeout }).then((r) => r.data);

export const ecourtApi = {
  // Reference
  capabilities: () => get('/search/capabilities'),
  enums: (types) => get('/enums', { types }),

  // Cases & orders
  search: (params) => get('/search', params),
  caseDetail: (cnr, fresh) => get(`/cases/${cnr}`, { fresh: fresh ? '1' : '' }),
  // returns { status: 200 | 202, data } — 202 means "AI still preparing, retry"
  orderAi: (cnr, file) => call('get', `/cases/${cnr}/orders/${encodeURIComponent(file)}/ai`, { timeout: 90000 }),
  orderMarkdown: (cnr, file) => get(`/cases/${cnr}/orders/${encodeURIComponent(file)}/markdown`, null, 310000),
  orderPdf: async (cnr, file, signed) => {
    const res = await call('get', `/cases/${cnr}/orders/${encodeURIComponent(file)}/pdf`, {
      params: { signed: String(signed) }, responseType: 'blob', timeout: 310000,
    });
    const disposition = res.headers['content-disposition'] || '';
    const name = (disposition.match(/filename="([^"]+)"/) || [])[1] || file;
    return { blob: res.data, name };
  },

  // Refresh
  refresh: (cnr) => post(`/cases/${cnr}/refresh`),
  bulkRefresh: (cnrs) => post('/cases/bulk-refresh', { cnrs }),
  bulkRefreshStatus: (cnrs) => post('/cases/bulk-refresh-status', { cnrs }),

  // Cause list
  states: () => get('/causelist/court-structure/states'),
  districts: (s) => get(`/causelist/court-structure/states/${encodeURIComponent(s)}/districts`),
  complexes: (s, d) => get(`/causelist/court-structure/states/${encodeURIComponent(s)}/districts/${encodeURIComponent(d)}/complexes`),
  courts: (s, d, c) => get(`/causelist/court-structure/states/${encodeURIComponent(s)}/districts/${encodeURIComponent(d)}/complexes/${encodeURIComponent(c)}/courts`),
  availableDates: (params) => get('/causelist/available-dates', params),
  causeSearch: (params) => get('/causelist/search', params),
  cnrBatch: (cnrs) => post('/causelist/cnr-batch', { cnrs }),

  // Legal check
  lcSubmit: (body) => post('/legal-check', body),
  lcStatus: (code) => get(`/legal-check/${code}`),
  lcReport: (code, params) => get(`/legal-check/${code}/report`, params),
  lcLog: (code) => get(`/legal-check/${code}/log`),
  lcList: () => get('/legal-check'),

  // Electoral (voter ID verify only)
  epicVerify: (body) => post('/electoral/epic/verify', body),

  // Tracker & WhatsApp alerts
  tracked: () => get('/tracker/cases'),
  track: (body) => post('/tracker/cases', body),
  updateTracked: (id, body) => call('patch', `/tracker/cases/${id}`, { data: body }).then((r) => r.data),
  untrack: (id) => call('delete', `/tracker/cases/${id}`).then((r) => r.data),
  alerts: (cnr) => get('/tracker/alerts', { cnr }),
  resendAlert: (id) => post(`/tracker/alerts/${id}/resend`),
  syncNow: () => post('/tracker/sync'),
};