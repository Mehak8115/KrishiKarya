import { api } from '../dashboard-api.js';
import { dt } from '../dashboard-i18n.js';

const EMOJI = {
  wheat:'🌾', carrot:'🥕', tomato:'🍅', mango:'🥭', onion:'🧅',
  potato:'🥔', chili:'🌶', grapes:'🍇', banana:'🍌',
  cauliflower:'🥦', leaf:'🌿', default:'🥦'
};

export async function marketplaceView(role) {
  let items = [], error = '';
  try { items = await api.produce.list({ limit: 50 }); } catch(e) { error = e.message; }

  const isFarmer = role === 'farmer';

  const cards = items.map(p => {
    const em = EMOJI[p.icon] || EMOJI.default;
    const gradeColor = p.grade === 'A' ? '#2E7D32' : p.grade === 'B' ? '#E65100' : '#C62828';
    const gradeBg    = p.grade === 'A' ? '#E8F5E9' : p.grade === 'B' ? '#FFF3E0' : '#FFEBEE';

    return `
    <div style="background:var(--kk-white);border:1.5px solid var(--kk-border);border-radius:var(--kk-radius);overflow:hidden;box-shadow:var(--kk-shadow);transition:box-shadow .2s,transform .2s;" 
         onmouseover="this.style.boxShadow='var(--kk-shadow-lg)';this.style.transform='translateY(-2px)'"
         onmouseout="this.style.boxShadow='var(--kk-shadow)';this.style.transform=''">
      <div style="aspect-ratio:4/3;background:linear-gradient(135deg,#E8F5E9,#C8E6C9);display:flex;align-items:center;justify-content:center;font-size:3rem;position:relative;">
        ${em}
        <span style="position:absolute;top:8px;left:8px;background:${gradeBg};color:${gradeColor};font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:12px;">
          Grade ${p.grade}
        </span>
      </div>
      <div style="padding:14px 16px;">
        <div style="font-weight:700;font-size:.96rem;margin-bottom:4px;color:var(--kk-text);">${p.name_en}</div>
        <div style="font-size:.78rem;color:var(--kk-muted);margin-bottom:10px;">📍 ${p.location} &nbsp;·&nbsp; ${p.stock_kg} kg</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:1.1rem;font-weight:800;color:var(--kk-green-deep);">₹${p.price}<small style="font-size:.7rem;font-weight:400;color:var(--kk-muted);">/${p.unit?.replace('per_','')}</small></span>
          ${isFarmer
            ? `<button class="kk-btn secondary sm" style="font-size:.74rem;" onclick="kkShowToast('Similar to your listing: ${p.name_en}')">View Similar</button>`
            : `<button class="kk-btn primary sm" style="font-size:.74rem;" onclick="kkSendProcurementRequest('${p.id}','${p.name_en}','${p.price}')">
                🤝 Request
               </button>`}
        </div>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="kk-page-header">
    <h1>🛒 Marketplace</h1>
    <p>${isFarmer ? 'All active produce listings — see what others are selling.' : 'Browse fresh produce directly from verified farmers.'}</p>
  </div>
  ${error ? `<div class="kk-error-box">⚠ ${error}</div>` : ''}
  <!-- Search + filter bar -->
  <div class="kk-panel kk-mb" style="padding:0;">
    <div style="padding:16px 20px;display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
      <input class="kk-input" id="mkt-search" placeholder="Search produce, location…" style="flex:1;min-width:180px;"
        oninput="kkMarketFilter(this.value)" value="">
      <select class="kk-select" style="min-width:130px;" onchange="kkMarketCategory(this.value)">
        <option value="">All Categories</option>
        <option value="vegetable">Vegetables</option>
        <option value="fruit">Fruits</option>
        <option value="grain">Grains</option>
        <option value="spice">Spices</option>
      </select>
      <select class="kk-select" style="min-width:110px;" onchange="kkMarketGrade(this.value)">
        <option value="">All Grades</option>
        <option value="A">Grade A</option>
        <option value="B">Grade B</option>
        <option value="C">Grade C</option>
      </select>
    </div>
  </div>
  <div style="font-size:.85rem;color:var(--kk-muted);margin-bottom:14px;">${items.length} active listings</div>
  <div id="marketplace-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;padding-bottom:40px;">
    ${items.length ? cards : `<div class="kk-empty" style="grid-column:1/-1;"><div class="empty-icon">🌾</div><h3>No produce listed yet</h3></div>`}
  </div>`;
}
