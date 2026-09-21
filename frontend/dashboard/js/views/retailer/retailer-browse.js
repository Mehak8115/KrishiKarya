import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';
import { gradeBadge } from '../../components/badges.js';

const CATEGORIES = ['all','vegetable','fruit','grain','spice'];
const GRADES     = ['all','A','B','C'];
const EMOJI = { wheat:'🌾', carrot:'🥕', tomato:'🍅', mango:'🥭', onion:'🧅', potato:'🥔',
  chili:'🌶', grapes:'🍇', banana:'🍌', cauliflower:'🥦', leaf:'🌿', default:'🥦' };

export async function retailerBrowseView() {
  const f = window.kkState.retailerFilters || { q:'', category:'all', grade:'all' };
  let items = [], error = '';
  try {
    const params = {};
    if (f.category !== 'all') params.category = f.category;
    if (f.grade    !== 'all') params.grade     = f.grade;
    if (f.q)                  params.q         = f.q;
    items = await api.produce.list({ ...params, limit:50 });
  } catch(e) { error = e.message; }

  const produceCards = items.map(p => {
    const em = EMOJI[p.icon] || EMOJI.default;
    return `
    <div class="kk-produce-card">
      <div class="kk-produce-thumb">
        <span style="font-size:3rem;">${em}</span>
        <span class="kk-badge grade-badge ${p.grade === 'A' ? 'grade-a' : p.grade === 'B' ? 'grade-b' : 'grade-c'}"
          style="position:absolute;top:8px;left:8px;">Grade ${p.grade}</span>
      </div>
      <div class="kk-produce-body">
        <h4>${p.name_en}</h4>
        <div class="meta">📍 ${p.location} &nbsp;·&nbsp; ${p.stock_kg} kg available</div>
        <div class="price-row">
          <span class="kk-price">₹${p.price}<small style="font-size:.7rem;font-weight:400;color:var(--kk-muted);">/${p.unit?.replace('per_','')}</small></span>
          <button class="kk-btn primary sm" onclick="kkShowToast('Request sent for ${p.name_en}')">
            ${dt('sendRequest')}
          </button>
        </div>
      </div>
    </div>`;
  }).join('');

  return `
  <div class="kk-page-header">
    <h1>🔍 ${dt('browseProduce')}</h1>
    <p>Browse fresh produce from verified farms across India.</p>
  </div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <!-- Filters -->
  <div class="kk-panel kk-mb">
    <div class="kk-panel-body" style="padding:16px 20px;">
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
        <div style="flex:1;min-width:200px;">
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">Search</label>
          <input class="kk-input" id="rb-q" placeholder="Tomato, wheat…" value="${f.q}"
            oninput="kkRetailerFilter('q',this.value)">
        </div>
        <div>
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">${dt('category')}</label>
          <select class="kk-select" onchange="kkRetailerFilter('category',this.value)" style="min-width:130px;">
            ${CATEGORIES.map(c => `<option value="${c}" ${f.category===c?'selected':''}>${c === 'all' ? 'All Categories' : c.charAt(0).toUpperCase()+c.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label style="font-size:.8rem;font-weight:600;display:block;margin-bottom:4px;">${dt('grade')}</label>
          <div style="display:flex;gap:6px;">
            ${GRADES.map(g => `<button class="kk-btn sm ${f.grade===g?'primary':'secondary'}" onclick="kkRetailerFilter('grade','${g}')">${g==='all'?'All':g}</button>`).join('')}
          </div>
        </div>
      </div>
    </div>
  </div>
  <div style="font-size:.85rem;color:var(--kk-muted);margin-bottom:14px;">
    Showing ${items.length} listing${items.length !== 1 ? 's' : ''}
  </div>
  ${items.length
    ? `<div class="kk-produce-grid">${produceCards}</div>`
    : `<div class="kk-empty"><div class="empty-icon">🔍</div><h3>${dt('noData')}</h3><p>Try adjusting your filters.</p></div>`}`;
}
