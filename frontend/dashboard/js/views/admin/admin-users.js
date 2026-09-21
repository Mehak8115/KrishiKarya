import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';
import { renderTable } from '../../components/table.js';
import { badge, statusDot } from '../../components/badges.js';

export async function adminUsersView(role = 'farmer') {
  let users = [], error = '';
  try { users = await api.admin.users(role); } catch(e) { error = e.message; }

  const tabs = ['farmer','retailer'].map(r =>
    `<button class="kk-tab ${role===r?'active':''}" onclick="kkNav('admin-${r}s')">${r==='farmer'?'🌾':'🏪'} ${r.charAt(0).toUpperCase()+r.slice(1)}s (${role===r?users.length:'…'})</button>`
  ).join('');

  const cols = [
    { key:'full_name', label:dt('name'), render: r => `
      <div style="display:flex;align-items:center;gap:10px;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--kk-green-light);
          color:var(--kk-green-deep);display:flex;align-items:center;justify-content:center;
          font-weight:700;font-size:.82rem;flex-shrink:0;">${r.full_name.slice(0,2).toUpperCase()}</div>
        <strong>${r.full_name}</strong>
      </div>` },
    { key:'email',      label:dt('emailCol'), render: r => `<span style="font-size:.82rem;color:var(--kk-muted);">${r.email}</span>` },
    { key:'role',       label:dt('roleCol'),  render: r => badge(r.role) },
    { key:'created_at', label:dt('joinedDate'), render: r => new Date(r.created_at).toLocaleDateString() },
    { key:'is_active',  label:dt('status'),   render: r => statusDot(r.is_active) },
    { key:'actions',    label:dt('actions'),  render: r => `
      <button class="kk-btn sm ${r.is_active?'danger':'secondary'}"
        onclick="kkToggleUser('${r.id}', ${!r.is_active})">
        ${r.is_active ? '🚫 Deactivate' : '✅ Activate'}
      </button>` },
  ];

  return `
  <div class="kk-page-header">
    <h1>👥 ${dt('userManagement')}</h1>
    <p>Manage farmer and retailer accounts on the platform.</p>
  </div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <div class="kk-tabs" style="margin-bottom:20px;">${tabs}</div>
  <div class="kk-panel">
    <div class="kk-panel-header">
      <h2>${role.charAt(0).toUpperCase()+role.slice(1)}s (${users.length})</h2>
      <div style="display:flex;gap:8px;">
        <input class="kk-input" placeholder="Search by name or email…"
          style="width:220px;padding:7px 11px;font-size:.84rem;"
          oninput="kkFilterTable(this.value,'users-table')">
      </div>
    </div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns:cols, rows:users, emptyMessage:'No users found.', id:'users-table' })}
    </div>
  </div>`;
}
