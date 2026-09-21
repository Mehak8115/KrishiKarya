import { dt } from '../dashboard-i18n.js';

/**
 * Render a stat card
 * @param {object} opts - { icon, iconClass, value, label, trend, trendLabel }
 */
export function statCard({ icon, iconClass = 'green', value, label, trend, trendLabel }) {
  const trendHTML = trend != null
    ? `<span class="card-trend ${trend >= 0 ? 'up' : 'down'}">
         ${trend >= 0 ? '↑' : '↓'} ${Math.abs(trend)}%
       </span>`
    : '';
  return `
  <div class="kk-stat-card">
    <div class="card-top">
      <div class="card-icon ${iconClass}">${icon}</div>
      ${trendHTML}
    </div>
    <div class="card-value">${value ?? '—'}</div>
    <div class="card-label">${label}</div>
  </div>`;
}

export function cardsGrid(cards) {
  return `<div class="kk-cards-grid">${cards.map(c => statCard(c)).join('')}</div>`;
}

export function quickActions(actions) {
  return `
  <div class="kk-panel kk-mb">
    <div class="kk-panel-header"><h2>⚡ ${dt('quickActions')}</h2></div>
    <div class="kk-panel-body" style="display:flex;gap:10px;flex-wrap:wrap;">
      ${actions.map(a => `
        <button class="kk-btn ${a.variant || 'secondary'}" onclick="${a.action}">
          ${a.icon || ''} ${a.label}
        </button>`).join('')}
    </div>
  </div>`;
}

export function infoCard({ title, value, subtitle, color }) {
  return `
  <div class="kk-panel" style="border-top: 3px solid ${color || 'var(--kk-green-fresh)'};">
    <div class="kk-panel-body" style="padding:16px 20px;">
      <div style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--kk-muted);margin-bottom:6px;">${title}</div>
      <div style="font-size:1.6rem;font-weight:800;color:var(--kk-green-deep);">${value}</div>
      ${subtitle ? `<div style="font-size:.78rem;color:var(--kk-muted);margin-top:4px;">${subtitle}</div>` : ''}
    </div>
  </div>`;
}

export function activityRow({ icon, text, time, badge }) {
  return `
  <div style="display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--kk-border);">
    <div style="font-size:1.3rem;flex-shrink:0;">${icon}</div>
    <div style="flex:1;font-size:.88rem;color:var(--kk-text);">${text}</div>
    ${badge ? `<span class="kk-badge ${badge.cls}">${badge.label}</span>` : ''}
    <div style="font-size:.74rem;color:var(--kk-soft);white-space:nowrap;">${time}</div>
  </div>`;
}
