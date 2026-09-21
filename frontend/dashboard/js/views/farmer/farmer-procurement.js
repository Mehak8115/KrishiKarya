import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';

export async function farmerProcurementView() {
  let requests = [], error = '';
  try { requests = await api.procurement.myRequests(); } catch(e) { error = e.message; }

  const pending  = requests.filter(r => r.status === 'pending');
  const accepted = requests.filter(r => r.status === 'accepted');
  const declined = requests.filter(r => r.status === 'declined');

  function statusBadge(s) {
    const map = {
      pending:  { bg:'#FFF3E0', color:'#E65100', label:'Pending' },
      accepted: { bg:'#E8F5E9', color:'#2E7D32', label:'Accepted' },
      declined: { bg:'#FFEBEE', color:'#C62828', label:'Declined' },
      completed:{ bg:'#E8F5E9', color:'#2E7D32', label:'Completed' },
    };
    const s_ = map[s] || map.pending;
    return `<span style="background:${s_.bg};color:${s_.color};font-size:.72rem;font-weight:700;padding:3px 9px;border-radius:12px;">${s_.label}</span>`;
  }

  function requestCard(r) {
    const isPending = r.status === 'pending';
    return `
    <div style="background:var(--kk-white);border:1.5px solid ${isPending ? 'var(--kk-gold)' : 'var(--kk-border)'};
      border-radius:var(--kk-radius);padding:20px;box-shadow:var(--kk-shadow);margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
        <div>
          <div style="font-weight:700;font-size:1rem;color:var(--kk-text);margin-bottom:4px;">
            🏪 ${r.retailer_name || 'Retailer'} wants to buy <strong>${r.produce_name}</strong>
          </div>
          <div style="font-size:.84rem;color:var(--kk-muted);">
            Quantity: <strong>${r.quantity} kg</strong> &nbsp;·&nbsp;
            Price: <strong>₹${r.price}/unit</strong> &nbsp;·&nbsp;
            ${new Date(r.created_at).toLocaleDateString('en-IN')}
          </div>
          ${r.message ? `<div style="font-size:.82rem;color:var(--kk-soft);margin-top:6px;font-style:italic;">"${r.message}"</div>` : ''}
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:8px;flex-shrink:0;">
          ${statusBadge(r.status)}
          ${isPending ? `
          <div style="display:flex;gap:8px;">
            <button class="kk-btn primary sm" onclick="kkAcceptRequest('${r.id}')">✅ Accept</button>
            <button class="kk-btn danger sm" onclick="kkDeclineRequest('${r.id}')">❌ Decline</button>
          </div>` : ''}
        </div>
      </div>
    </div>`;
  }

  return `
  <div class="kk-page-header">
    <h1>🤝 ${dt('procurement')}</h1>
    <p>Incoming requests from retailers and your matched listings.</p>
  </div>

  ${error ? `<div class="kk-error-box">${error}</div>` : ''}

  <!-- Incoming Requests -->
  <div class="kk-panel kk-mb">
    <div class="kk-panel-header">
      <h2>📋 Retailer Requirements
        ${pending.length > 0 ? `<span style="background:var(--kk-gold);color:#3E2400;font-size:.72rem;font-weight:700;padding:2px 8px;border-radius:12px;margin-left:8px;">${pending.length} New</span>` : ''}
      </h2>
    </div>
    <div class="kk-panel-body" style="padding:${requests.length?'16px':'22px'};">
      ${requests.length === 0 ? `
        <div class="kk-empty">
          <div class="empty-icon">📋</div>
          <h3>No requests yet</h3>
          <p>When retailers browse your produce and send requests, they'll appear here.</p>
        </div>` : requests.map(requestCard).join('')}
    </div>
  </div>

  <!-- Summary stats -->
  ${requests.length > 0 ? `
  <div class="kk-cards-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:24px;">
    <div class="kk-stat-card">
      <div class="card-top"><div class="card-icon gold">⏳</div></div>
      <div class="card-value">${pending.length}</div>
      <div class="card-label">Pending</div>
    </div>
    <div class="kk-stat-card">
      <div class="card-top"><div class="card-icon green">✅</div></div>
      <div class="card-value">${accepted.length}</div>
      <div class="card-label">Accepted</div>
    </div>
    <div class="kk-stat-card">
      <div class="card-top"><div class="card-icon red">❌</div></div>
      <div class="card-value">${declined.length}</div>
      <div class="card-label">Declined</div>
    </div>
  </div>` : ''}`;
}
