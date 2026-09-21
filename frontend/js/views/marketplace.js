import { ic } from '../icons.js';
import { t } from '../i18n.js';
import { PRODUCE, CATEGORIES, LOCATIONS } from '../data.js';

export function produceCardHTML(p) {
  const lang = window.state.lang;
  const inCart = window.state.cart.find(c => c.id === p.id);
  return `
  <div class="produce-card">
    <div class="produce-thumb">
      <span class="grade-chip">${t('quality_grade')} ${p.grade}</span>
      <div class="produce-icon-badge">${ic(p.icon)}</div>
    </div>
    <div class="produce-body">
      <h4>${p.name[lang]}</h4>
      <div class="produce-meta">${p.farmer} · ${p.location}</div>
      <div class="produce-price-row">
        <div class="produce-price">₹${p.price}<span> ${t(p.unit)}</span></div>
        <button class="add-cart-btn ${inCart?'added':''}" onclick="addToCart('${p.id}')">
          ${ic('cart')} ${inCart ? t('added') : t('add_to_cart')}
        </button>
      </div>
    </div>
  </div>`;
}

function filteredProduce() {
  const f = window.state.marketFilters;
  const lang = window.state.lang;
  let list = PRODUCE.filter(p => {
    if (f.category !== 'all' && p.category !== f.category) return false;
    if (f.location !== 'all' && p.location !== f.location) return false;
    if (f.grade !== 'all' && p.grade !== f.grade) return false;
    if (f.q) {
      const q = f.q.toLowerCase();
      const hay = (p.name.en + ' ' + p.name.hi + ' ' + p.farmer + ' ' + p.location).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  if (f.sort === 'price_low') list = list.slice().sort((a,b) => a.price - b.price);
  else if (f.sort === 'price_high') list = list.slice().sort((a,b) => b.price - a.price);
  else if (f.sort === 'grade') list = list.slice().sort((a,b) => a.grade.localeCompare(b.grade));
  else list = list.slice().sort((a,b) => a.days - b.days);
  return list;
}

export function marketplaceView() {
  const f = window.state.marketFilters;
  const lang = window.state.lang;
  const list = filteredProduce();

  return `
  <div class="container">
    <div class="page-head">
      <h1>${t('mkt_h')}</h1>
      <p>${t('mkt_p')}</p>
    </div>
    <div class="marketplace-layout">
      <aside class="filters-panel">
        <div class="filters-title">${ic('filter')} ${t('filters')}</div>
        <div class="field-group">
          <label>${lang==='hi'?'खोज':'Search'}</label>
          <input class="field-input" type="text" placeholder="${t('search_ph')}"
            value="${f.q.replace(/"/g,'&quot;')}"
            oninput="setMarketFilter('q', this.value)">
        </div>
        <div class="field-group">
          <label>${t('category')}</label>
          <select class="field-input" onchange="setMarketFilter('category', this.value)">
            ${CATEGORIES.map(c => `<option value="${c.v}" ${f.category===c.v?'selected':''}>${lang==='hi'?c.hi:c.en}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label>${t('location')}</label>
          <select class="field-input" onchange="setMarketFilter('location', this.value)">
            <option value="all" ${f.location==='all'?'selected':''}>${t('all_locations')}</option>
            ${LOCATIONS.map(l => `<option value="${l}" ${f.location===l?'selected':''}>${l}</option>`).join('')}
          </select>
        </div>
        <div class="field-group">
          <label>${t('quality_grade')}</label>
          <div class="chip-row">
            ${['all','A','B','C'].map(g => `<button class="chip ${f.grade===g?'active':''}" onclick="setMarketFilter('grade','${g}')">${g==='all'?(lang==='hi'?'सभी':'All'):g}</button>`).join('')}
          </div>
        </div>
        <div class="field-group">
          <label>${t('sort_by')}</label>
          <select class="field-input" onchange="setMarketFilter('sort', this.value)">
            <option value="newest" ${f.sort==='newest'?'selected':''}>${t('sort_newest')}</option>
            <option value="price_low" ${f.sort==='price_low'?'selected':''}>${t('sort_price_low')}</option>
            <option value="price_high" ${f.sort==='price_high'?'selected':''}>${t('sort_price_high')}</option>
            <option value="grade" ${f.sort==='grade'?'selected':''}>${t('sort_grade')}</option>
          </select>
        </div>
        <button class="clear-filters" onclick="clearMarketFilters()">${t('clear_filters')}</button>
      </aside>
      <div>
        <div class="results-bar">
          <div class="results-count">${t('results_showing')} ${list.length} ${t('results_of')} ${PRODUCE.length} ${t('results_listings')}</div>
        </div>
        ${list.length
          ? `<div class="market-grid">${list.map(p => produceCardHTML(p)).join('')}</div>`
          : `<div class="empty-state"><h3>${t('no_results_h')}</h3><p>${t('no_results_p')}</p></div>`}
      </div>
    </div>
  </div>`;
}
