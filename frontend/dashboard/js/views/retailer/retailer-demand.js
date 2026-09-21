import { dt } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';
import { renderBarChart } from '../../components/charts.js';

const PRODUCE_LIST = ['tomato','onion','potato','wheat','mango','cauliflower','carrot','chili'];

export async function retailerDemandView() {
  const sel     = window.kkState.demandProduce || 'tomato';
  const loading = window.kkState.demandLoading;
  const data    = window.kkState.demandData;
  const error   = window.kkState.demandError;
  const location = window.kkState.demandLocation || 'Jaipur';
  const horizon = window.kkState.demandHorizon || 30;

  const chipRow = PRODUCE_LIST.map(p =>
    `<button class="kk-btn sm ${sel===p?'primary':'secondary'}"
      style="text-transform:capitalize;" onclick="kkSelectDemand('${p}')">${p}</button>`
  ).join('');

  let content = '';
  if (loading) {
    content = `<div class="kk-spinner-wrap"><div class="kk-spinner"></div></div>`;
  } else if (error) {
    content = `<div class="kk-error-box">⚠ ${error}<br><small>Make sure backend is running on port 8001.</small></div>`;
  } else if (data) {
    const trendColor = data.trend === 'up' ? 'var(--kk-success)' : data.trend === 'down' ? 'var(--kk-danger)' : 'var(--kk-warn)';
    const trendIcon  = data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→';

    const chartData = [
      ...data.history.map(h => ({ label: h.date, value: h.actual || 0 })),
      ...data.forecast.map(f => ({ label: f.date, value: 0, forecast: f.forecast || 0 })),
    ];

    const tableRows = [...data.history, ...data.forecast].map(row => `
      <tr>
        <td>${row.date}</td>
        <td style="text-align:right;">${row.actual ?? '—'}</td>
        <td style="text-align:right;color:var(--kk-green-fresh);font-weight:${row.forecast?'600':'400'}">${row.forecast ?? '—'}</td>
        <td><span class="kk-badge ${row.forecast?'active':'confirmed'}">${row.forecast?'Forecast':'Actual'}</span></td>
      </tr>`).join('');

    content = `
    <div class="kk-cards-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
      <div class="kk-stat-card">
        <div class="card-top"><div class="card-icon green">📈</div></div>
        <div class="card-value" style="color:${trendColor};">${trendIcon} ${Math.abs(data.trend_pct)}%</div>
        <div class="card-label">${horizon}-Day Trend</div>
      </div>
      <div class="kk-stat-card">
        <div class="card-top"><div class="card-icon gold">📅</div></div>
        <div class="card-value" style="font-size:1.4rem;">${data.forecast[0]?.forecast ?? '—'}</div>
        <div class="card-label">Forecast total (${data.unit})</div>
      </div>
      <div class="kk-stat-card">
        <div class="card-top"><div class="card-icon blue">📊</div></div>
        <div class="card-value" style="font-size:1.4rem;">${data.history[data.history.length-1]?.actual ?? '—'}</div>
        <div class="card-value" style="font-size:1.1rem;">No historical actual</div>
        <div class="card-label">Actual data unavailable</div>
      </div>
    </div>
    <div class="kk-rec-box kk-mb">💡 <strong>AI Insight:</strong> ${data.insight}</div>
    <div class="kk-panel kk-mb">
      <div class="kk-panel-header"><h2>📊 ${data.produce} — History &amp; Forecast (${data.unit})</h2></div>
      <div class="kk-panel-body">
        ${renderBarChart(chartData, {
          height: 180, color: '#1B5E20', forecastColor: '#81C784',
          showLegend: true,
          legendItems: [{ color:'#1B5E20', label:'Actual' }, { color:'#81C784', label:'Forecast' }],
        })}
      </div>
    </div>
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>📋 Data Table</h2></div>
      <div class="kk-panel-body" style="padding:0;">
        <div class="kk-table-wrap">
          <table class="kk-table">
            <thead><tr>
              <th>Month</th><th style="text-align:right">Actual (${data.unit})</th>
              <th style="text-align:right">Forecast (${data.unit})</th><th>Type</th>
            </tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>
    </div>`;
  } else {
    content = `<div class="kk-empty"><div class="empty-icon">📊</div>
      <h3>Select a produce above</h3><p>Click a produce chip to load its demand forecast.</p></div>`;
  }

  return `
  <div class="kk-page-header">
    <h1>📊 ${dt('demandForecast')}</h1>
    <p>AI-powered demand predictions to help plan your procurement and inventory.</p>
  </div>
  <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;">
    <label for="demand-location" style="font-size:.86rem;font-weight:600;">Market location</label>
    <input id="demand-location" class="kk-input" value="${location}" placeholder="e.g. Jaipur"
      style="max-width:240px;" onchange="kkSetDemandLocation(this.value)">
    <label for="demand-horizon" style="font-size:.86rem;font-weight:600;">Days</label>
    <select id="demand-horizon" class="kk-input" style="max-width:120px;" onchange="kkSetDemandHorizon(this.value)">
      ${[7,30,60,90].map(days => `<option value="${days}" ${horizon===days?'selected':''}>${days}</option>`).join('')}
    </select>
    <button class="kk-btn primary sm" onclick="kkSelectDemand(window.kkState.demandProduce)">Run forecast</button>
  </div>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;">${chipRow}</div>
  ${content}`;
}
