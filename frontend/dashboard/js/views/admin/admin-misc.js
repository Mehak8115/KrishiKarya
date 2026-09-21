import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';
import { renderTable } from '../../components/table.js';
import { toolBadge, gradeBadge, badge, statusDot } from '../../components/badges.js';
import { renderBarChart, renderDonutChart } from '../../components/charts.js';

export async function adminProduceView() {
  let items = [], error = '';
  try { items = await api.admin.allProduce(); } catch(e) { error = e.message; }
  const cols = [
    { key:'name_en',   label:'Produce', render: r => `<strong>${r.name_en}</strong>${r.name_hi?`<br><small style="color:var(--kk-muted);">${r.name_hi}</small>`:''}` },
    { key:'category',  label:dt('category') },
    { key:'grade',     label:dt('grade'), render: r => gradeBadge(r.grade) },
    { key:'price',     label:dt('price'), render: r => `₹${r.price}/${r.unit?.replace('per_','')||'kg'}` },
    { key:'stock_kg',  label:'Stock',    render: r => `${r.stock_kg} kg` },
    { key:'location',  label:dt('location') },
    { key:'farmer_name', label:dt('farmer') },
    { key:'is_active', label:dt('status'), render: r => statusDot(r.is_active) },
    { key:'actions',   label:dt('actions'), render: r => `
      <button class="kk-btn sm ${r.is_active?'danger':'secondary'}"
        onclick="kkToggleProduce('${r.id}')">
        ${r.is_active?'Deactivate':'Activate'}
      </button>` },
  ];
  return `
  <div class="kk-page-header"><h1>🥕 ${dt('produceListings')}</h1></div>
  ${error?`<div class="kk-error-box">${error}</div>`:''}
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>All Listings (${items.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns:cols, rows:items, emptyMessage:dt('noData') })}
    </div>
  </div>`;
}

export async function adminAIView() {
  let records = [], error = '';
  try { records = await api.admin.aiInspections(); } catch(e) { error = e.message; }
  const byTool = { disease:0, ripeness:0, quality:0 };
  records.forEach(r => { if (byTool[r.tool]!=null) byTool[r.tool]++; });
  const donut = [
    { label:'Disease',  value: byTool.disease  || 1, color:'#C62828' },
    { label:'Ripeness', value: byTool.ripeness || 1, color:'#43A047' },
    { label:'Quality',  value: byTool.quality  || 1, color:'#1565C0' },
  ];
  const cols = [
    { key:'tool',       label:dt('tool'),       render: r => toolBadge(r.tool) },
    { key:'grade_result',label:dt('result'),    render: r => r.grade_result || '—' },
    { key:'confidence', label:dt('confidence'), render: r => `${r.confidence||0}%` },
    { key:'badge',      label:'AI Badge',       render: r => `<span class="kk-badge ${r.badge}">${r.badge}</span>` },
    { key:'analyzed_at',label:dt('date'),       render: r => r.analyzed_at ? new Date(r.analyzed_at).toLocaleDateString() : '—' },
  ];
  return `
  <div class="kk-page-header"><h1>🤖 ${dt('aiManagement')}</h1></div>
  ${error?`<div class="kk-error-box">${error}</div>`:''}
  <div class="kk-grid-2 kk-mb">
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>Inspection Breakdown</h2></div>
      <div class="kk-panel-body">${renderDonutChart(donut,{ size:140 })}</div>
    </div>
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>Summary</h2></div>
      <div class="kk-panel-body">
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${Object.entries(byTool).map(([k,v]) => `
            <div style="display:flex;justify-content:space-between;align-items:center;">
              ${toolBadge(k)}
              <strong>${v}</strong>
            </div>`).join('')}
          <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid var(--kk-border);padding-top:10px;">
            <span style="font-weight:700;">Total</span>
            <strong>${records.length}</strong>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>AI Inspection Records (${records.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns:cols, rows:records, emptyMessage:'No AI inspections yet.' })}
    </div>
  </div>`;
}

export async function adminOrdersView() {
  // Admin sees all orders (fetches same endpoint for now)
  let orders = [], error = '';
  try { orders = await api.orders.list(); } catch(e) { error = e.message; }
  const cols = [
    { key:'id',           label:'Order ID',   render: r => `#${r.id.slice(-8)}` },
    { key:'status',       label:dt('status'),  render: r => badge(r.status) },
    { key:'total_amount', label:dt('amount'),  render: r => `₹${parseFloat(r.total_amount).toFixed(0)}` },
    { key:'created_at',   label:dt('date'),    render: r => new Date(r.created_at).toLocaleDateString() },
    { key:'actions',      label:dt('actions'), render: r => `
      <select class="kk-select" style="font-size:.78rem;padding:5px 8px;"
        onchange="kkUpdateOrderStatus('${r.id}',this.value)">
        ${['pending','confirmed','shipped','delivered','cancelled'].map(s =>
          `<option value="${s}" ${r.status===s?'selected':''}>${s}</option>`).join('')}
      </select>` },
  ];
  return `
  <div class="kk-page-header"><h1>📦 ${dt('allOrders')}</h1></div>
  ${error?`<div class="kk-error-box">${error}</div>`:''}
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>All Platform Orders (${orders.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns:cols, rows:orders, emptyMessage:'No orders yet.' })}
    </div>
  </div>`;
}

export function adminAnalyticsView() {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const barData = months.map((m,i) => ({ label:m, value: Math.round(50+i*15+Math.sin(i)*20) }));
  const lineData = months.map((m,i) => ({ label:m, value: Math.round(80+i*10+Math.cos(i)*15) }));
  return `
  <div class="kk-page-header"><h1>📊 ${dt('analytics')}</h1></div>
  <div class="kk-grid-2">
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>📈 ${dt('demandTrends')} (quintals)</h2></div>
      <div class="kk-panel-body">
        ${renderBarChart(barData, { height:160, color:'#43A047' })}
      </div>
    </div>
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>🤝 ${dt('procurementAnalytics')}</h2></div>
      <div class="kk-panel-body">
        ${renderBarChart(lineData, { height:160, color:'#1B5E20' })}
      </div>
    </div>
  </div>
  <div class="kk-cards-grid kk-mt">
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">📦</div></div>
      <div class="card-value">₹41 Cr+</div><div class="card-label">Total GMV</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon gold">⭐</div></div>
      <div class="card-value">4.6/5</div><div class="card-label">Avg Rating</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon blue">🔄</div></div>
      <div class="card-value">78%</div><div class="card-label">Repeat Orders</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">🌾</div></div>
      <div class="card-value">18</div><div class="card-label">States Covered</div></div>
  </div>`;
}

export function adminSustainabilityView() {
  return `
  <div class="kk-page-header"><h1>♻️ ${dt('sustainability')}</h1></div>
  <div class="kk-cards-grid">
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">🌱</div></div>
      <div class="card-value">2,340 kg</div><div class="card-label">Total CO₂ Saved</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon gold">♻️</div></div>
      <div class="card-value">14%</div><div class="card-label">Food Waste Reduced</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon blue">🤝</div></div>
      <div class="card-value">92%</div><div class="card-label">Local Sourcing Rate</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">💧</div></div>
      <div class="card-value">8%</div><div class="card-label">Water Usage Reduced</div></div>
  </div>`;
}

export function adminReportsView() {
  return `
  <div class="kk-page-header"><h1>📄 ${dt('reports')}</h1></div>
  <div class="kk-panel" style="max-width:600px;">
    <div class="kk-panel-header"><h2>Generate Reports</h2></div>
    <div class="kk-panel-body">
      ${[
        { label:'Platform Summary Report', desc:'Overview of users, orders, and AI activity' },
        { label:'Farmer Activity Report',  desc:'All farmer listings and order history' },
        { label:'Retailer Activity Report',desc:'All retailer orders and procurement requests' },
        { label:'AI Inspection Report',    desc:'All AI inspection records with results' },
        { label:'Sustainability Report',   desc:'Environmental impact metrics' },
      ].map(r => `
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--kk-border);">
          <div>
            <div style="font-weight:600;font-size:.9rem;">${r.label}</div>
            <div style="font-size:.78rem;color:var(--kk-muted);">${r.desc}</div>
          </div>
          <button class="kk-btn secondary sm" onclick="kkShowToast('${r.label} — coming soon')">📥 Export</button>
        </div>`).join('')}
    </div>
  </div>`;
}

export function adminSettingsView() {
  const lang = window.kkState?.lang || 'en';
  return `
  <div class="kk-page-header"><h1>⚙️ ${dt('systemSettings')}</h1></div>
  <div class="kk-panel" style="max-width:540px;">
    <div class="kk-panel-header"><h2>Platform Settings</h2></div>
    <div class="kk-panel-body">
      <div class="kk-form-row">
        <label>${dt('language')}</label>
        <div style="display:flex;gap:10px;">
          <button class="kk-btn ${lang==='en'?'primary':'secondary'}" onclick="kkSetLang('en')">🇬🇧 English</button>
          <button class="kk-btn ${lang==='hi'?'primary':'secondary'}" onclick="kkSetLang('hi')">🇮🇳 हिंदी</button>
        </div>
      </div>
      <div class="kk-form-row kk-mt">
        <label>API Base URL</label>
        <input class="kk-input" value="http://localhost:8001/api/v1" readonly style="opacity:.7;">
      </div>
      <div class="kk-form-row">
        <label>Platform Version</label>
        <input class="kk-input" value="1.0.0" readonly style="opacity:.7;">
      </div>
      <button class="kk-btn primary kk-mt" onclick="kkShowToast('Settings saved!')">💾 ${dt('save')}</button>
    </div>
  </div>`;
}
