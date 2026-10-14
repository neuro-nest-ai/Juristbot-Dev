// All Citations calls go through Jurist Bot's own axiosInstance (adds the authToken header).
// The Indian Kanoon token stays on the backend — never in React.
import axiosInstance from '../config/apiconfig';

const BASE = '/citations';

function toError(err) {
  if (!err.response) {
    const slow = err.code === 'ECONNABORTED';
    return { status: 0, code: slow ? 'TIMEOUT' : 'NETWORK', message: slow ? 'This is taking too long. Please try again.' : 'Cannot reach the server. Check your connection.' };
  }
  const { status, data } = err.response;
  if (status === 401) return { status, code: 'UNAUTHENTICATED', message: 'Your session has expired. Please log in again.' };
  const e = (data && data.error) || {};
  return { status, code: e.code || `HTTP_${status}`, message: e.message || 'Request failed' };
}

async function call(method, url, { params, data } = {}) {
  try {
    const res = await axiosInstance.request({ method, url: BASE + url, params, data, timeout: 45000 });
    return res.data;
  } catch (err) {
    throw toError(err);
  }
}

export const citationsApi = {
  usage: () => call('get', '/usage'),
  search: ({ q, court, from, to, page }) => call('get', '/search', {
    params: { q, court: court || 'all', from: from || undefined, to: to || undefined, page: page || 0 },
  }),
  doc: (tid) => call('get', `/docs/${encodeURIComponent(tid)}`),
  verify: (text) => call('post', '/verify', { data: { text } }),
};