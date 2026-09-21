const API = 'http://localhost:8001/api/v1';

function authHeaders(json = true) {
  const token = localStorage.getItem('kk_token');
  const h = {};
  if (token) h['Authorization'] = `Bearer ${token}`;
  if (json)  h['Content-Type']  = 'application/json';
  return h;
}

async function req(method, path, body, isMultipart = false) {
  const opts = { method, headers: authHeaders(!isMultipart) };
  if (body && !isMultipart) opts.body = JSON.stringify(body);
  if (body && isMultipart)  { opts.body = body; delete opts.headers['Content-Type']; }
  const res = await fetch(API + path, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  auth: {
    async login(email, password) {
      const form = new URLSearchParams({ username: email, password });
      const res  = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: form,
      });
      if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.detail || 'Login failed'); }
      return res.json();
    },
    async register(data) { return req('POST', '/auth/register', data); },
    async me()           { return req('GET',  '/auth/me'); },
    logout() {
      localStorage.removeItem('kk_token');
      localStorage.removeItem('kk_user');
      window.location.href = '../index.html';
    },
  },

  produce: {
    async list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return req('GET', `/produce${q ? '?' + q : ''}`);
    },
    async get(id)       { return req('GET',    `/produce/${id}`); },
    async create(data)  { return req('POST',   `/produce`, data); },
    async update(id, d) { return req('PUT',    `/produce/${id}`, d); },
    async deactivate(id){ return req('DELETE', `/produce/${id}`); },
  },

  farmers: {
    async list(params = {}) {
      const q = new URLSearchParams(params).toString();
      return req('GET', `/farmers${q ? '?' + q : ''}`);
    },
    async get(id)      { return req('GET', `/farmers/${id}`); },
    async create(data) { return req('POST', '/farmers', data); },
    async update(id,d) { return req('PUT', `/farmers/${id}`, d); },
  },

  orders: {
    async list()              { return req('GET',  '/orders'); },
    async create(data)        { return req('POST', '/orders', data); },
    async updateStatus(id, s) { return req('PUT',  `/orders/${id}/status`, { status: s }); },
  },

  ai: {
    async analyze(file, tool) {
      const fd = new FormData();
      if (tool === 'quality') {
        fd.append('image', file);
        const result = await req('POST', '/ai/quality-grading', fd, true);
        return {
          tool: 'quality',
          status: result.grade,
          badge: result.grade === 'A' ? 'good' : result.grade === 'B' ? 'warn' : 'bad',
          badge_label: `Grade ${result.grade}`,
          confidence: Math.round(result.confidence * 100),
          detail: {
            size: `Quality score ${result.quality_score.toFixed(1)}/100`,
            surface: result.defects.length ? result.defects.join(', ') : 'No defects detected',
            price: result.estimated_price || 'Market-linked',
            modelVersion: result.model_version,
          },
          recommendation: result.defects.length
            ? 'Sort or inspect the listed defects before dispatch.'
            : 'Premium quality detected. Suitable for organised retail.',
        };
      }
      fd.append('file', file); fd.append('tool', tool);
      return req('POST', '/ai/analyze', fd, true);
    },
    async demandForecast(produce, months_history = 12, months_forecast = 6) {
      const params = new URLSearchParams({
        produce, months_history, months_forecast,
      });
      const result = await req('GET', `/ai/demand-forecast?${params}`);
      return {
        produce:        result.produce,
        unit:           result.unit,
        history:        result.history  || [],
        forecast:       result.forecast || [],
        trend:          result.trend,
        trend_pct:      result.trend_pct,
        insight:        result.insight,
        total_forecast: result.forecast?.[0]?.forecast ?? null,
      };
    },
    async matchFarmers(produce, qty_kg, grade, location) {
      return req('GET', `/ai/match-farmers?produce=${produce}&qty_kg=${qty_kg}&grade=${grade}&location=${encodeURIComponent(location)}`);
    },
    async history(limit = 20) { return req('GET', `/ai/history?limit=${limit}`); },
  },

  admin: {
    async stats()             { return req('GET',   '/admin/stats'); },
    async users(role)         { return req('GET',   role ? `/admin/users?role=${role}` : '/admin/users'); },
    async toggleUser(id, on)  { return req('PATCH', `/admin/users/${id}`, { is_active: on }); },
    async aiInspections(tool) { return req('GET',   tool ? `/admin/ai-inspections?tool=${tool}` : '/admin/ai-inspections'); },
    async allProduce()        { return req('GET',   '/admin/produce'); },
    async toggleProduce(id)   { return req('PATCH', `/admin/produce/${id}/toggle`, {}); },
  },

  contact: {
    async submit(data) { return req('POST', '/contact', data); },
  },

  notifications: {
    async list(unreadOnly = false)  { return req('GET', `/notifications${unreadOnly?'?unread_only=true':''}`); },
    async count()                   { return req('GET', '/notifications/count'); },
    async markRead(id)              { return req('PATCH', `/notifications/${id}/read`, {}); },
    async markAllRead()             { return req('PATCH', '/notifications/mark-all-read', {}); },
  },

  procurement: {
    async create(data)        { return req('POST',  '/procurement', data); },
    async myRequests()        { return req('GET',   '/procurement/my-requests'); },
    async updateStatus(id, s) { return req('PATCH', `/procurement/${id}/status`, { status: s }); },
  },
};
