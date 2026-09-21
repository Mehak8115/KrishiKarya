import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';

export function farmerAdvisoryView() {
  const tips = [
    { icon:'🌧', title:'Monsoon Advisory', body:'Heavy rains expected in Maharashtra this week. Ensure proper drainage in your fields.' },
    { icon:'🌡', title:'Temperature Alert', body:'Night temperatures will drop below 15°C. Cover sensitive crops with shade nets.' },
    { icon:'🐛', title:'Pest Watch', body:'Aphid activity reported in the Punjab region. Monitor your crops closely.' },
    { icon:'💧', title:'Irrigation Tip', body:'Reduce irrigation frequency by 20% this week due to expected rainfall.' },
  ];
  return `
  <div class="kk-page-header"><h1>🌤 ${dt('advisory')}</h1><p>Weather and crop advisory for your region.</p></div>
  <div class="kk-grid-2">
    ${tips.map(t => `
      <div class="kk-panel">
        <div class="kk-panel-body">
          <div style="font-size:2rem;margin-bottom:10px;">${t.icon}</div>
          <h3 style="font-size:1rem;margin-bottom:8px;color:var(--kk-green-deep);">${t.title}</h3>
          <p style="font-size:.88rem;color:var(--kk-muted);">${t.body}</p>
        </div>
      </div>`).join('')}
  </div>`;
}

export function farmerLogisticsView() {
  return `
  <div class="kk-page-header"><h1>🚚 ${dt('logistics')}</h1><p>Pickup and delivery information for your orders.</p></div>
  <div class="kk-panel">
    <div class="kk-panel-body">
      <div class="kk-empty"><div class="empty-icon">🚚</div>
        <h3>No active pickups</h3>
        <p>Logistics details will appear here when you have confirmed orders.</p>
      </div>
    </div>
  </div>`;
}

export function farmerSustainabilityView() {
  return `
  <div class="kk-page-header"><h1>♻️ ${dt('sustainability')}</h1><p>Your farm's sustainability and environmental impact.</p></div>
  <div class="kk-cards-grid">
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">♻️</div></div>
      <div class="card-value">12%</div><div class="card-label">Waste Reduced</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon gold">🌱</div></div>
      <div class="card-value">340 kg</div><div class="card-label">CO₂ Saved</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon blue">💧</div></div>
      <div class="card-value">8%</div><div class="card-label">Water Saved</div></div>
    <div class="kk-stat-card"><div class="card-top"><div class="card-icon green">🤝</div></div>
      <div class="card-value">Local</div><div class="card-label">Supply Chain</div></div>
  </div>`;
}

export async function farmerNotificationsView() {
  let items = [], error = '';
  try {
    items = await api.notifications.list();
    // Mark all as read after fetching
    api.notifications.markAllRead().catch(()=>{});
    // Reset badge count
    window.kkState.notifications = [];
  } catch(e) {
    error = e.message;
    // Fallback mock
    items = [
      { id:'n1', title:'New Order Received!',     message:'RetailMart placed an order for 200 kg Tomato.', type:'order',   is_read:false, created_at: new Date().toISOString() },
      { id:'n2', title:'AI Quality Grading Done', message:'Your crop was graded A — Premium grade.',        type:'produce', is_read:false, created_at: new Date(Date.now()-3600000).toISOString() },
      { id:'n3', title:'Retailer Matched',        message:'ShopEase matched your Onion listing.',           type:'info',    is_read:true,  created_at: new Date(Date.now()-86400000).toISOString() },
    ];
  }

  const typeIcon = { order:'📦', produce:'🌾', request:'🤝', system:'⚙️', info:'ℹ️' };

  return `
  <div class="kk-page-header">
    <h1>🔔 ${dt('notifications')}</h1>
    <button class="kk-btn secondary sm" onclick="kkMarkAllRead()"
      style="margin-top:4px;">✓ Mark all read</button>
  </div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <div class="kk-panel">
    <div class="kk-panel-body" style="padding:0;">
      ${items.length === 0
        ? `<div class="kk-empty"><div class="empty-icon">🔔</div><h3>${dt('noNotifications')}</h3></div>`
        : items.map(n => `
          <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;
            border-bottom:1px solid var(--kk-border);
            background:${n.is_read ? '' : 'rgba(67,160,71,0.04)'};
            cursor:pointer;" onclick="kkMarkRead('${n.id}',this)">
            <div style="font-size:1.5rem;flex-shrink:0;">${typeIcon[n.type] || '🔔'}</div>
            <div style="flex:1;">
              <div style="font-size:.92rem;font-weight:${n.is_read?'400':'700'};color:var(--kk-text);">${n.title}</div>
              <div style="font-size:.82rem;color:var(--kk-muted);margin-top:3px;">${n.message}</div>
              <div style="font-size:.72rem;color:var(--kk-soft);margin-top:4px;">
                ${new Date(n.created_at).toLocaleString()}
              </div>
            </div>
            ${!n.is_read ? '<span class="kk-badge active" style="flex-shrink:0;">New</span>' : ''}
          </div>`).join('')}
    </div>
  </div>`;
}

export function farmerSettingsView() {
  const lang = window.kkState?.lang || 'en';
  return `
  <div class="kk-page-header"><h1>⚙️ ${dt('settings')}</h1></div>
  <div class="kk-panel" style="max-width:520px;">
    <div class="kk-panel-header"><h2>Preferences</h2></div>
    <div class="kk-panel-body">
      <div class="kk-form-row">
        <label>${dt('language')}</label>
        <div style="display:flex;gap:10px;">
          <button class="kk-btn ${lang==='en'?'primary':'secondary'}" onclick="kkSetLang('en')">🇬🇧 ${dt('english')}</button>
          <button class="kk-btn ${lang==='hi'?'primary':'secondary'}" onclick="kkSetLang('hi')">🇮🇳 ${dt('hindi')}</button>
        </div>
      </div>
      <div class="kk-form-row" style="margin-top:20px;">
        <label>Notifications</label>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${['New Orders','AI Inspection Results','Price Alerts','Payment Confirmations'].map(n => `
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;">
              <input type="checkbox" checked style="width:16px;height:16px;accent-color:var(--kk-green-fresh);">
              <span style="font-size:.9rem;">${n}</span>
            </label>`).join('')}
        </div>
      </div>
      <button class="kk-btn primary" onclick="kkShowToast('Settings saved!')" style="margin-top:16px;">
        💾 ${dt('save')}
      </button>
    </div>
  </div>`;
}
