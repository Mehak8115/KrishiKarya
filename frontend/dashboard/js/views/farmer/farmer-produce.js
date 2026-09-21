import { dt } from '../../dashboard-i18n.js';
import { renderTable } from '../../components/table.js';
import { gradeBadge, statusDot } from '../../components/badges.js';
import { api } from '../../dashboard-api.js';

export async function farmerListingsView() {
  let items = [];
  let error = '';
  try { items = await api.produce.list({ limit: 50 }); } catch(e) { error = e.message; }

  const columns = [
    { key:'name_en',  label:'Produce' },
    { key:'category', label:dt('category') },
    { key:'grade',    label:dt('grade'), render: r => gradeBadge(r.grade) },
    { key:'price',    label:dt('price'), render: r => `₹${r.price} /${r.unit?.replace('per_','') || 'kg'}` },
    { key:'stock_kg', label:`${dt('stockKg')}`, render: r => `${r.stock_kg} kg` },
    { key:'location', label:dt('location') },
    { key:'is_active',label:dt('status'), render: r => statusDot(r.is_active) },
    { key:'actions',  label:dt('actions'), render: r => `
      <button class="kk-btn sm secondary" onclick="kkNav('farmer-add-produce')" title="Edit">✏️</button>
      <button class="kk-btn sm danger" style="margin-left:4px;"
        onclick="kkDeactivateProduce('${r.id}')" title="Deactivate">🗑</button>` },
  ];

  return `
  <div class="kk-page-header">
    <h1>${dt('myListings')}</h1>
    <p>Manage your active produce listings on the marketplace.</p>
  </div>
  ${error ? `<div class="kk-error-box">⚠ ${error}</div>` : ''}
  <div class="kk-panel">
    <div class="kk-panel-header">
      <h2>🌾 All Listings (${items.length})</h2>
      <button class="kk-btn primary sm" onclick="kkNav('farmer-add-produce')">➕ ${dt('addProduce')}</button>
    </div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns, rows: items, emptyMessage: dt('noData') })}
    </div>
  </div>`;
}

export function farmerAddProduceView() {
  return `
  <div class="kk-page-header">
    <h1>➕ ${dt('addProduce')}</h1>
    <p>List a new crop on the Krishi Karya marketplace.</p>
  </div>
  <div class="kk-panel" style="max-width:680px;">
    <div class="kk-panel-header"><h2>Produce Details</h2></div>
    <div class="kk-panel-body">
      <div id="add-produce-msg"></div>
      <form onsubmit="kkAddProduce(event)">
        <div class="kk-form-grid">
          <div class="kk-form-row">
            <label>${dt('produceName')} (English)*</label>
            <input class="kk-input" id="p-name-en" required placeholder="e.g. Tomato">
          </div>
          <div class="kk-form-row">
            <label>${dt('produceName')} (हिंदी)</label>
            <input class="kk-input" id="p-name-hi" placeholder="e.g. टमाटर">
          </div>
          <div class="kk-form-row">
            <label>${dt('category')}*</label>
            <select class="kk-select" id="p-category" required>
              <option value="">-- Select --</option>
              <option value="vegetable">Vegetable</option>
              <option value="fruit">Fruit</option>
              <option value="grain">Grain</option>
              <option value="spice">Spice</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="kk-form-row">
            <label>${dt('grade')}*</label>
            <select class="kk-select" id="p-grade" required>
              <option value="A">A — Premium</option>
              <option value="B" selected>B — Standard</option>
              <option value="C">C — Processing</option>
            </select>
          </div>
          <div class="kk-form-row">
            <label>${dt('price')} (₹)*</label>
            <input class="kk-input" id="p-price" type="number" min="1" required placeholder="e.g. 25">
          </div>
          <div class="kk-form-row">
            <label>${dt('unit')}*</label>
            <select class="kk-select" id="p-unit" required>
              <option value="per_kg">Per kg</option>
              <option value="per_dozen">Per dozen</option>
              <option value="per_qtl">Per quintal</option>
            </select>
          </div>
          <div class="kk-form-row">
            <label>${dt('stockKg')} (kg)*</label>
            <input class="kk-input" id="p-stock" type="number" min="1" required placeholder="e.g. 500">
          </div>
          <div class="kk-form-row">
            <label>${dt('location')}*</label>
            <input class="kk-input" id="p-location" required placeholder="e.g. Nashik, Maharashtra">
          </div>
        </div>
        <button class="kk-btn primary" type="submit">➕ ${dt('addProduce')}</button>
      </form>
    </div>
  </div>`;
}
