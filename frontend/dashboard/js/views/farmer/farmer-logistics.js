// ============================================================
// Farmer Logistics View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { badge } from '../../components/badges.js';

export async function renderFarmerLogistics(container) {
  const mockShipments = [
    { id: 'SHP001', produce: 'Tomato', quantity: '200 kg', destination: 'FreshMart, Mumbai', status: 'shipped', eta: '2025-08-10', driver: 'Ramesh Kumar', contact: '+91 9876543210' },
    { id: 'SHP002', produce: 'Onion', quantity: '150 kg', destination: 'GreenBasket, Delhi', status: 'confirmed', eta: '2025-08-15', driver: 'Suresh Singh', contact: '+91 9876543211' },
    { id: 'SHP003', produce: 'Potato', quantity: '500 kg', destination: 'AgroStore, Pune', status: 'pending', eta: '2025-08-20', driver: '—', contact: '—' },
  ];

  container.innerHTML = `
    <div class="kk-page-header">
      <div><h1>🚛 ${t('nav_logistics')}</h1><p>Track your shipments and deliveries</p></div>
    </div>
    <div class="kk-section" style="margin-bottom:24px">
      <div class="kk-section-header"><span class="kk-section-title">Active Shipments</span></div>
      <div class="kk-section-body">
        ${mockShipments.map(s => `
          <div style="padding:16px;border:1px solid var(--kk-border);border-radius:var(--kk-radius);margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap">
              <div>
                <div style="font-weight:700;font-size:.95rem">${s.produce} — ${s.quantity}</div>
                <div style="font-size:.82rem;color:var(--kk-muted);margin-top:4px">📍 To: ${s.destination}</div>
                <div style="font-size:.82rem;color:var(--kk-muted);margin-top:2px">🗓 ETA: ${s.eta}</div>
              </div>
              <div style="text-align:right">
                ${badge(s.status)}
                <div style="font-size:.78rem;color:var(--kk-muted);margin-top:6px">Shipment #${s.id}</div>
              </div>
            </div>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--kk-border);display:flex;gap:16px;font-size:.82rem;color:var(--kk-muted)">
              <span>🚗 Driver: ${s.driver}</span>
              <span>📞 ${s.contact}</span>
            </div>
            <div class="kk-timeline" style="margin-top:14px">
              ${buildTimeline(s.status)}
            </div>
          </div>`).join('')}
      </div>
    </div>
    <div class="kk-section">
      <div class="kk-section-header"><span class="kk-section-title">Delivery Stats</span></div>
      <div class="kk-section-body">
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;text-align:center">
          ${[['12','Total Deliveries'],['2','In Transit'],['9','Delivered'],['1','Pending Pickup']].map(([v,l]) => `
            <div style="padding:16px;background:var(--kk-cream);border-radius:var(--kk-radius-sm)">
              <div style="font-size:1.6rem;font-weight:700;color:var(--kk-green-deep)">${v}</div>
              <div style="font-size:.78rem;color:var(--kk-muted)">${l}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
}

function buildTimeline(status) {
  const steps = ['pending','confirmed','shipped','delivered'];
  const idx = steps.indexOf(status);
  return steps.map((s, i) => `
    <div class="kk-timeline-item">
      <div class="kk-timeline-dot ${i <= idx ? 'filled' : ''}"></div>
      <div class="kk-timeline-title" style="${i <= idx ? 'color:var(--kk-green-deep)' : 'color:var(--kk-muted)'}">${s.charAt(0).toUpperCase()+s.slice(1)}</div>
    </div>`).join('');
}
