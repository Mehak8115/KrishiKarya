import { dt } from '../../dashboard-i18n.js';
import { renderTable } from '../../components/table.js';
import { badge } from '../../components/badges.js';
import { api } from '../../dashboard-api.js';

export async function farmerOrdersView() {
  let orders = [], error = '';
  try { orders = await api.orders.list(); } catch(e) { error = e.message; }

  const columns = [
    { key:'id',         label:dt('order'),  render: r => `<span style="font-size:.74rem;color:var(--kk-muted);">#${r.id.slice(-8)}</span>` },
    { key:'status',     label:dt('status'), render: r => badge(r.status) },
    { key:'total_amount', label:dt('amount'), render: r => `₹${parseFloat(r.total_amount).toFixed(0)}` },
    { key:'created_at', label:dt('date'),   render: r => new Date(r.created_at).toLocaleDateString() },
    { key:'actions',    label:dt('actions'), render: r => `
      <button class="kk-btn sm secondary" onclick="kkShowToast('Order ${r.id.slice(-8)} details')">👁 View</button>` },
  ];

  return `
  <div class="kk-page-header">
    <h1>📦 ${dt('orders')}</h1>
    <p>Incoming orders from retail buyers.</p>
  </div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>All Orders (${orders.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns, rows: orders, emptyMessage:'No orders yet.' })}
    </div>
  </div>`;
}
