const BASE = '/api';

async function request(method, url, body, isForm = false) {
  const opts = { method, headers: {} };
  if (body) {
    if (isForm) {
      opts.body = body;
    } else {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
  }
  const resp = await fetch(BASE + url, opts);
  let data;
  try {
    data = await resp.json();
  } catch (e) {
    data = { error: '响应解析失败' };
  }
  if (!resp.ok) {
    const msg = data.error || `请求失败 (${resp.status})`;
    throw new Error(msg);
  }
  return data;
}

export const api = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request('GET', `/birthdays${qs ? '?' + qs : ''}`);
  },
  create: (body) => request('POST', '/birthdays', body),
  update: (id, body) => request('PUT', `/birthdays/${id}`, body),
  remove: (id) => request('DELETE', `/birthdays/${id}`),
  removeShop: (shop) => request('DELETE', `/birthdays?shop=${encodeURIComponent(shop)}`),

  upload: (file, shop, mode = 'append') => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('shop', shop);
    fd.append('mode', mode);
    return request('POST', '/upload', fd, true);
  },

  summary: () => request('GET', '/stats/summary'),
  byMonth: (month) => request('GET', `/stats/by-month?month=${month}`),

  testPush: () => request('POST', '/push/test'),
  runNow: () => request('POST', '/push/run-now'),
  pushLogs: () => request('GET', '/push/logs'),

  getSettings: () => request('GET', '/settings'),
  setToken: (token) => request('POST', '/settings/pushplus-token', { token }),
};
