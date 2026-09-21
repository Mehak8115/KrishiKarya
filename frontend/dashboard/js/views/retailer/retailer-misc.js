import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';
import { renderTable } from '../../components/table.js';
import { badge } from '../../components/badges.js';

export function retailerRequirementsView(mode = 'active') {
  const MODES = ['active','add','history'];
  const tabs = MODES.map(m =>
    `<button class="kk-tab ${mode===m?'active':''}" onclick="kkNav('retailer-${m==='add'?'add-req':m==='history'?'req-history':'active-req'}')">${
      m==='add'?'➕ Add New':m==='history'?'📋 History':'✅ Active'}</button>`).join('');

  if (mode === 'add') {
    return `
    <div class="kk-page-header"><h1>${dt('myRequirements')}</h1></div>
    <div class="kk-tabs">${tabs}</div>
    <div class="kk-panel" style="max-width:640px;">
      <div class="kk-panel-header"><h2>➕ ${dt('addRequirement')}</h2></div>
      <div class="kk-panel-body">
        <div id="req-msg"></div>
        <form onsubmit="kkAddRequirement(event)">
          <div class="kk-form-grid">
            <div class="kk-form-row">
              <label>${dt('produce')}*</label>
              <input class="kk-input" id="req-produce" required placeholder="e.g. Tomato">
            </div>
            <div class="kk-form-row">
              <label>${dt('quantity')} (kg)*</label>
              <input class="kk-input" id="req-qty" type="number" min="1" required placeholder="e.g. 500">
            </div>
            <div class="kk-form-row">
              <label>Min ${dt('grade')}*</label>
              <select class="kk-select" id="req-grade" required>
                <option value="A">A — Premium</option>
                <option value="B" selected>B — Standard</option>
                <option value="C">C — Processing</option>
              </select>
            </div>
            <div class="kk-form-row">
              <label>${dt('location')}</label>
              <input class="kk-input" id="req-location" placeholder="Preferred state/region">
            </div>
            <div class="kk-form-row">
              <label>Delivery Date*</label>
              <input class="kk-input" id="req-date" type="date" required>
            </div>
            <div class="kk-form-row">
              <label>Budget (₹/kg)</label>
              <input class="kk-input" id="req-budget" type="number" min="1" placeholder="Max price you'll pay">
            </div>
          </div>
          <button class="kk-btn primary" type="submit">📋 Submit Requirement</button>
        </form>
      </div>
    </div>`;
  }

  const mockReqs = [
    { id:'r1', produce:'Tomato',  qty:'500 kg',  grade:'B', location:'Maharashtra', date:'2026-10-15', status:'active' },
    { id:'r2', produce:'Onion',   qty:'1000 kg', grade:'A', location:'Nashik',      date:'2026-10-20', status:'active' },
    { id:'r3', produce:'Potato',  qty:'300 kg',  grade:'B', location:'UP',          date:'2026-09-30', status:'cancelled' },
  ];
  const cols = [
    { key:'produce',  label:dt('produce') },
    { key:'qty',      label:dt('quantity') },
    { key:'grade',    label:dt('grade') },
    { key:'location', label:dt('location') },
    { key:'date',     label:'Delivery Date' },
    { key:'status',   label:dt('status'), render: r => badge(r.status) },
    { key:'actions',  label:dt('actions'), render: () => `<button class="kk-btn sm danger">Cancel</button>` },
  ];

  return `
  <div class="kk-page-header"><h1>${dt('myRequirements')}</h1></div>
  <div class="kk-tabs">${tabs}</div>
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>${mode === 'history' ? '📋 History' : '✅ Active Requirements'} (${mockReqs.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns: cols, rows: mockReqs, emptyMessage: dt('noData') })}
    </div>
  </div>`;
}

export async function retailerProcurementView() {
  const f = window.kkState.matchFilters || { produce:'tomato', qty:500, grade:'B', location:'all' };
  let result = null, loading = window.kkState.matchLoading;
  if (window.kkState.matchResult) result = window.kkState.matchResult;

  // Load my sent requests
  let myRequests = [];
  try { myRequests = await api.procurement.myRequests(); } catch(_) {}

  return `
  <div class="kk-page-header">
    <h1>🤝 ${dt('matchedFarmersList')}</h1>
    <p>Find farmers that match your procurement requirements and send direct requests.</p>
  </div>
  <div class="kk-panel kk-mb">
    <div class="kk-panel-header"><h2>Your Requirement</h2></div>
    <div class="kk-panel-body">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
        <div class="kk-form-row" style="margin:0;">
          <label style="font-size:.78rem;font-weight:600;">${dt('produce')}</label>
          <input class="kk-input" id="m-produce" value="${f.produce}"
            onchange="kkUpdateMatch('produce',this.value)">
        </div>
        <div class="kk-form-row" style="margin:0;">
          <label style="font-size:.78rem;font-weight:600;">Qty (kg)</label>
          <input class="kk-input" id="m-qty" type="number" value="${f.qty}"
            onchange="kkUpdateMatch('qty',this.value)">
        </div>
        <div class="kk-form-row" style="margin:0;">
          <label style="font-size:.78rem;font-weight:600;">Min Grade</label>
          <select class="kk-select" onchange="kkUpdateMatch('grade',this.value)">
            ${['A','B','C'].map(g => `<option value="${g}" ${f.grade===g?'selected':''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="kk-form-row" style="margin:0;">
          <label style="font-size:.78rem;font-weight:600;">Location</label>
          <input class="kk-input" id="m-loc" value="${f.location}"
            onchange="kkUpdateMatch('location',this.value)">
        </div>
      </div>
      <button class="kk-btn primary" onclick="kkRunMatch()">🔍 Find Matches</button>
    </div>
  </div>
  ${loading ? `<div class="kk-spinner-wrap"><div class="kk-spinner"></div></div>` : ''}
  ${result ? `
    <p style="font-size:.85rem;color:var(--kk-muted);margin-bottom:14px;">
      Matching for: <strong>${result.retailer_need}</strong> — ${result.matches.length} match${result.matches.length!==1?'es':''}
    </p>
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${result.matches.map((m, i) => `
        <div class="kk-panel" style="padding:18px 20px;">
          <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
            <div style="width:44px;height:44px;border-radius:50%;background:${i===0?'var(--kk-green-deep)':'var(--kk-green-light)'};
              color:${i===0?'#fff':'var(--kk-green-deep)'};display:flex;align-items:center;justify-content:center;
              font-weight:800;font-size:1rem;flex-shrink:0;">#${i+1}</div>
            <div style="flex:1;">
              <div style="font-weight:700;font-size:1rem;">${m.farmer_name}</div>
              <div style="font-size:.82rem;color:var(--kk-muted);margin-top:2px;">
                📍 ${m.location} &nbsp;·&nbsp;
                <span style="background:${m.grade==='A'?'#E8F5E9':'#FFF3E0'};color:${m.grade==='A'?'#2E7D32':'#E65100'};font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:10px;">Grade ${m.grade}</span>
                &nbsp;·&nbsp; Stock: ${m.stock_kg} kg
              </div>
              <div style="font-size:.78rem;color:var(--kk-soft);margin-top:4px;">${m.match_reason}</div>
              <div style="height:6px;background:var(--kk-border);border-radius:4px;margin-top:8px;overflow:hidden;max-width:220px;">
                <div style="width:${m.match_score}%;height:100%;background:var(--kk-green-fresh);border-radius:4px;"></div>
              </div>
              <span style="font-size:.72rem;color:var(--kk-muted);">Match score: ${m.match_score}%</span>
            </div>
            <div style="text-align:right;flex-shrink:0;">
              <div style="font-size:1.4rem;font-weight:800;color:var(--kk-green-deep);">₹${m.price}</div>
              <div style="font-size:.72rem;color:var(--kk-muted);margin-bottom:8px;">per unit</div>
              <button class="kk-btn primary sm" onclick="kkSendProcurementRequest('${m.farmer_id || ''}','${m.produce}','${m.price}')">
                🤝 Send Request
              </button>
            </div>
          </div>
        </div>`).join('')}
    </div>
  ` : (!loading ? `<div class="kk-empty"><div class="empty-icon">🌾</div>
    <h3>Set requirements above</h3><p>Click "Find Matches" to see ranked farmers.</p></div>` : '')}

  <!-- My sent requests -->
  ${myRequests.length > 0 ? `
  <div class="kk-panel kk-mt">
    <div class="kk-panel-header"><h2>📤 My Sent Requests (${myRequests.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      <div class="kk-table-wrap">
        <table class="kk-table">
          <thead><tr><th>Produce</th><th>Qty</th><th>Price</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${myRequests.map(r => `
              <tr>
                <td><strong>${r.produce_name}</strong></td>
                <td>${r.quantity} kg</td>
                <td>₹${r.price}</td>
                <td><span class="kk-badge ${r.status === 'accepted' ? 'active' : r.status === 'declined' ? 'cancelled' : 'pending'}">${r.status}</span></td>
                <td style="font-size:.8rem;color:var(--kk-muted);">${new Date(r.created_at).toLocaleDateString()}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>
  </div>` : ''}`;
}

export async function retailerOrdersView() {
  let orders = [], error = '';
  try { orders = await api.orders.list(); } catch(e) { error = e.message; }
  const cols = [
    { key:'id',           label:'Order ID', render: r => `#${r.id.slice(-8)}` },
    { key:'status',       label:dt('status'), render: r => badge(r.status) },
    { key:'total_amount', label:dt('amount'), render: r => `₹${parseFloat(r.total_amount).toFixed(0)}` },
    { key:'created_at',   label:dt('date'),   render: r => new Date(r.created_at).toLocaleDateString() },
  ];
  return `
  <div class="kk-page-header"><h1>📦 ${dt('orders')}</h1></div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>Order History (${orders.length})</h2>
      <button class="kk-btn sm secondary" onclick="kkNav('retailer-browse')">+ New Order</button>
    </div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns:cols, rows:orders, emptyMessage:'No orders yet.' })}
    </div>
  </div>`;
}

export function retailerLogisticsView() {
  const timeline = [
    { status:'confirmed', label:'Order Confirmed', time:'Sep 18, 09:00', done:true },
    { status:'shipped',   label:'Picked up from Farm', time:'Sep 18, 14:30', done:true },
    { status:'shipped',   label:'In Transit', time:'Sep 19, 08:00', done:false },
    { status:'delivered', label:'Delivered', time:'Expected Sep 20', done:false },
  ];
  return `
  <div class="kk-page-header"><h1>🚚 ${dt('logistics')}</h1></div>
  <div class="kk-panel" style="max-width:600px;">
    <div class="kk-panel-header"><h2>Order #demo1234 — Tomato 500kg</h2></div>
    <div class="kk-panel-body">
      <div style="display:flex;flex-direction:column;gap:0;padding:8px 0;">
        ${timeline.map((s, i) => `
          <div style="display:flex;gap:16px;position:relative;padding-bottom:${i<timeline.length-1?'24px':'0'};">
            <div style="display:flex;flex-direction:column;align-items:center;flex-shrink:0;">
              <div style="width:28px;height:28px;border-radius:50%;
                background:${s.done?'var(--kk-green-fresh)':'var(--kk-border)'};
                display:flex;align-items:center;justify-content:center;
                color:${s.done?'#fff':'var(--kk-soft)'};">${s.done?'✓':''}</div>
              ${i<timeline.length-1?`<div style="width:2px;flex:1;background:${s.done?'var(--kk-green-fresh)':'var(--kk-border)'};margin-top:4px;min-height:20px;"></div>`:''}
            </div>
            <div style="padding-top:4px;">
              <div style="font-weight:${s.done?'700':'500'};font-size:.9rem;color:${s.done?'var(--kk-text)':'var(--kk-muted)'};">${s.label}</div>
              <div style="font-size:.76rem;color:var(--kk-soft);margin-top:2px;">${s.time}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>
  </div>`;
}

export function retailerSustainabilityView() {
  return `
  <div class="kk-page-header"><h1>♻️ ${dt('sustainability')}</h1></div>
  <div class="kk-cards-grid">
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">🌱</div></div>
      <div class="card-value">18%</div><div class="card-label">${dt('wasteReduction')}</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon gold">🤝</div></div>
      <div class="card-value">85%</div><div class="card-label">Local Sourcing</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon blue">♻️</div></div>
      <div class="card-value">420 kg</div><div class="card-label">CO₂ Saved</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">🚜</div></div>
      <div class="card-value">12</div><div class="card-label">Farmers Supported</div></div>
  </div>`;
}

export async function retailerNotificationsView() {
  let items = [], error = '';
  try {
    items = await api.notifications.list();
    api.notifications.markAllRead().catch(()=>{});
    window.kkState.notifications = [];
  } catch(e) {
    error = e.message;
    items = [
      { id:'n1', title:'Farmer Accepted Request', message:'Ramesh Kumar accepted your Wheat request — 500 kg.', type:'request', is_read:false, created_at: new Date().toISOString() },
      { id:'n2', title:'Order Confirmed',          message:'Order #f3d1 confirmed — delivery in 2 days.',      type:'order',   is_read:false, created_at: new Date(Date.now()-3600000).toISOString() },
      { id:'n3', title:'New Produce Listed',       message:'Vijay Patil listed fresh Tomatoes — Grade B.',     type:'produce', is_read:true,  created_at: new Date(Date.now()-86400000).toISOString() },
    ];
  }

  const typeIcon = { order:'📦', produce:'🌾', request:'🤝', system:'⚙️', info:'ℹ️' };

  return `
  <div class="kk-page-header">
    <h1>🔔 ${dt('notifications')}</h1>
    <button class="kk-btn secondary sm" onclick="kkMarkAllRead()">✓ Mark all read</button>
  </div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <div class="kk-panel">
    <div class="kk-panel-body" style="padding:0;">
      ${items.length === 0
        ? `<div class="kk-empty"><div class="empty-icon">🔔</div><h3>${dt('noNotifications')}</h3></div>`
        : items.map(n => `
          <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;
            border-bottom:1px solid var(--kk-border);
            background:${n.is_read ? '' : 'rgba(67,160,71,0.04)'};">
            <div style="font-size:1.5rem;flex-shrink:0;">${typeIcon[n.type] || '🔔'}</div>
            <div style="flex:1;">
              <div style="font-size:.92rem;font-weight:${n.is_read?'400':'700'};color:var(--kk-text);">${n.title}</div>
              <div style="font-size:.82rem;color:var(--kk-muted);margin-top:3px;">${n.message}</div>
              <div style="font-size:.72rem;color:var(--kk-soft);margin-top:4px;">${new Date(n.created_at).toLocaleString()}</div>
            </div>
            ${!n.is_read ? '<span class="kk-badge active" style="flex-shrink:0;">New</span>' : ''}
          </div>`).join('')}
    </div>
  </div>`;
}

export function retailerSettingsView() {
  const lang = window.kkState?.lang || 'en';
  return `
  <div class="kk-page-header"><h1>⚙️ ${dt('settings')}</h1></div>
  <div class="kk-panel" style="max-width:520px;">
    <div class="kk-panel-header"><h2>Preferences</h2></div>
    <div class="kk-panel-body">
      <div class="kk-form-row">
        <label>${dt('language')}</label>
        <div style="display:flex;gap:10px;">
          <button class="kk-btn ${lang==='en'?'primary':'secondary'}" onclick="kkSetLang('en')">🇬🇧 English</button>
          <button class="kk-btn ${lang==='hi'?'primary':'secondary'}" onclick="kkSetLang('hi')">🇮🇳 हिंदी</button>
        </div>
      </div>
      <button class="kk-btn primary" onclick="kkShowToast('Settings saved!')" style="margin-top:20px;">💾 ${dt('save')}</button>
    </div>
  </div>`;
}
