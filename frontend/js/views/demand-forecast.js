import { ic } from '../icons.js';
import { t } from '../i18n.js';

const API = 'http://localhost:8001/api/v1';

const PRODUCE_LIST = [
  'tomato','onion','potato','wheat','mango','cauliflower','carrot','chili'
];

export function demandForecastView() {
  const state   = window.state;
  const sel     = state.demandProduce || 'tomato';
  const loading = state.demandLoading;
  const data    = state.demandData;
  const err     = state.demandError;
  const location = state.demandLocation || 'Jaipur';
  const horizon = state.demandHorizon || 30;

  const trendColor = data
    ? (data.trend === 'up' ? 'var(--leaf-2)' : data.trend === 'down' ? 'var(--danger)' : 'var(--amber)')
    : 'var(--ink-muted)';
  const trendIcon  = data
    ? (data.trend === 'up' ? '↑' : data.trend === 'down' ? '↓' : '→')
    : '';

  return `
  <div class="container">
    <div class="page-head">
      <h1>Demand Forecasting</h1>
      <p>Predict future produce demand to help plan procurement and inventory.</p>
    </div>

    <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-bottom:28px;">
      <label style="font-weight:600;font-size:.9rem;">Crop</label>
      <input class="field-input" value="${sel}" onchange="setDemandCrop(this.value)" style="max-width:170px;text-transform:capitalize;">
      <label style="font-weight:600;font-size:.9rem;">Location</label>
      <input class="field-input" value="${location}" onchange="setDemandLocation(this.value)" style="max-width:170px;">
      <label style="font-weight:600;font-size:.9rem;">Days</label>
      <select class="field-input" onchange="setDemandHorizon(this.value)" style="max-width:120px;">
        ${[7,30,60,90].map(days => `<option value="${days}" ${horizon===days?'selected':''}>${days}</option>`).join('')}
      </select>
      <button class="btn btn-primary btn-sm" onclick="loadDemandForecast(window.state.demandProduce)">Generate forecast</button>
      ${PRODUCE_LIST.map(p => `
        <button class="chip ${sel===p?'active':''}" onclick="selectDemandProduce('${p}')" style="text-transform:capitalize;">${p}</button>
      `).join('')}
    </div>

    ${loading ? `
      <div style="display:flex;align-items:center;gap:12px;padding:40px 0;color:var(--ink-muted);">
        <div class="spinner"></div> Loading forecast data…
      </div>
    ` : err ? `
      <div class="empty-state"><p style="color:var(--danger);">${err}</p>
        <p style="margin-top:8px;font-size:.85rem;">Make sure the backend is running on port 8000.</p>
      </div>
    ` : data ? `
      <!-- Summary cards -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:28px;">
        <div class="stat-box">
          <div class="num" style="color:${trendColor};">${trendIcon} ${Math.abs(data.trend_pct)}%</div>
          <div class="label">Demand trend (6-month)</div>
        </div>
        <div class="stat-box">
          <div class="num" style="font-size:1.4rem;">${data.forecast[0]?.forecast ?? '—'}</div>
          <div class="num" style="font-size:1.4rem;">${data.total_forecast ?? data.forecast[0]?.forecast ?? '—'}</div>
          <div class="label">Forecast total (${data.unit})</div>
        </div>
        <div class="stat-box">
          <div class="num" style="font-size:1.4rem;">${data.history[data.history.length-1]?.actual ?? '—'}</div>
          <div class="num" style="font-size:1.1rem;">No historical actual</div>
          <div class="label">Actual data unavailable</div>
        </div>
      </div>

      <!-- Insight box -->
      <div class="rec-box" style="margin-bottom:28px;font-size:.95rem;">
        ${ic('sparkle')} <strong>AI Insight:</strong> ${data.insight}
      </div>

      <!-- Chart -->
      <div style="background:var(--white);border:1px solid var(--line);border-radius:var(--radius-m);padding:24px;box-shadow:var(--shadow-card);margin-bottom:28px;">
        <h3 style="font-size:1.1rem;margin-bottom:20px;">${data.produce} — Demand History &amp; Forecast (${data.unit})</h3>
        <div style="overflow-x:auto;">
          ${renderBarChart(data)}
        </div>
      </div>

      <!-- Data table -->
      <div style="background:var(--white);border:1px solid var(--line);border-radius:var(--radius-m);overflow:hidden;box-shadow:var(--shadow-card);margin-bottom:60px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--cream-alt);">
              <th style="text-align:left;padding:12px 16px;font-size:.78rem;text-transform:uppercase;color:var(--ink-soft);border-bottom:1px solid var(--line);">Month</th>
              <th style="text-align:right;padding:12px 16px;font-size:.78rem;text-transform:uppercase;color:var(--ink-soft);border-bottom:1px solid var(--line);">Actual (${data.unit})</th>
              <th style="text-align:right;padding:12px 16px;font-size:.78rem;text-transform:uppercase;color:var(--ink-soft);border-bottom:1px solid var(--line);">Forecast (${data.unit})</th>
              <th style="text-align:left;padding:12px 16px;font-size:.78rem;text-transform:uppercase;color:var(--ink-soft);border-bottom:1px solid var(--line);">Type</th>
            </tr>
          </thead>
          <tbody>
            ${[...data.history, ...data.forecast].map(row => `
              <tr style="border-bottom:1px solid var(--line);">
                <td style="padding:11px 16px;font-size:.9rem;">${row.date}</td>
                <td style="padding:11px 16px;font-size:.9rem;text-align:right;">${row.actual ?? '—'}</td>
                <td style="padding:11px 16px;font-size:.9rem;text-align:right;color:var(--leaf-2);font-weight:${row.forecast?'600':'400'}">${row.forecast ?? '—'}</td>
                <td style="padding:11px 16px;">
                  <span style="font-size:.72rem;font-weight:700;padding:3px 9px;border-radius:20px;${row.forecast ? 'background:#EAF9F0;color:#1d7a3c;' : 'background:var(--cream-alt);color:var(--ink-muted);'}">
                    ${row.forecast ? 'Forecast' : 'Actual'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : `
      <div class="empty-state"><p>Select a produce above to load the forecast.</p></div>
    `}
  </div>`;
}

function renderBarChart(data) {
  const allPoints = [...data.history, ...data.forecast];
  const allValues = allPoints.map(p => p.actual ?? p.forecast ?? 0);
  const maxVal    = Math.max(...allValues) * 1.1 || 1;
  const barW      = 32;
  const gap       = 6;
  const chartH    = 200;
  const totalW    = allPoints.length * (barW + gap);

  const bars = allPoints.map((p, i) => {
    const val      = p.actual ?? p.forecast ?? 0;
    const barH     = Math.round((val / maxVal) * chartH);
    const x        = i * (barW + gap);
    const y        = chartH - barH;
    const isFcast  = !!p.forecast;
    const fill     = isFcast ? '#7FBF7A' : '#1F4A2C';
    const opacity  = isFcast ? '0.75' : '1';
    return `
      <g>
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}" fill="${fill}" opacity="${opacity}" rx="3"/>
        <text x="${x + barW/2}" y="${chartH + 14}" text-anchor="middle" font-size="9" fill="var(--ink-muted)" transform="rotate(-45,${x+barW/2},${chartH+14})">${p.date.slice(5)}</text>
        <title>${p.date}: ${val} ${data.unit}</title>
      </g>`;
  }).join('');

  return `<svg width="${totalW}" height="${chartH + 40}" viewBox="0 0 ${totalW} ${chartH + 40}" style="min-width:100%;">
    <line x1="0" y1="${chartH}" x2="${totalW}" y2="${chartH}" stroke="var(--line)" stroke-width="1"/>
    ${bars}
    <!-- Legend -->
    <rect x="0" y="${chartH+28}" width="12" height="10" fill="#1F4A2C" rx="2"/>
    <text x="16" y="${chartH+37}" font-size="10" fill="var(--ink-muted)">Actual</text>
    <rect x="70" y="${chartH+28}" width="12" height="10" fill="#7FBF7A" rx="2" opacity="0.75"/>
    <text x="86" y="${chartH+37}" font-size="10" fill="var(--ink-muted)">Forecast</text>
  </svg>`;
}

/* ── called from app.js ── */
export async function loadDemandForecast(produce) {
  window.state.demandLoading = true;
  window.state.demandError   = null;
  window.state.demandData    = null;
  window.render();

  try {
    const res = await fetch(`${API}/ai/demand-forecast`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ crop: produce, location: window.state.demandLocation || 'Jaipur', horizon_days: window.state.demandHorizon || 30 }),
    });
    if (!res.ok) throw new Error('API error ' + res.status);
    const result = await res.json();
    window.state.demandData = {
      produce: result.crop,
      unit: result.unit,
      history: [],
      forecast: result.daily.map(point => ({date: point.date, forecast: point.predicted_demand})),
      trend: 'stable',
      trend_pct: 0,
      total_forecast: result.predicted_demand,
      insight: `${result.crop} demand in ${result.location} is forecast at ${result.predicted_demand} ${result.unit} for ${result.forecast_period}.`,
    };
  } catch (e) {
    window.state.demandError = e.message;
  } finally {
    window.state.demandLoading = false;
    window.render();
  }
}
