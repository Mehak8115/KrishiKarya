// ============================================================
// Retailer Demand Forecast View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { api } from '../../dashboard-api.js';
import { renderLineChart, renderBarChart } from '../../components/charts.js';
import { renderTable } from '../../components/table.js';

const PRODUCE_OPTIONS = ['tomato','onion','potato','wheat','mango','cauliflower','carrot','chili'];

export async function renderRetailerDemandForecast(container) {
  container.innerHTML = `
    <div class="kk-page-header">
      <div><h1>📈 ${t('nav_demand_forecast')}</h1><p>AI-powered demand analysis and forecasting</p></div>
    </div>
    <div class="kk-section" style="margin-bottom:20px">
      <div class="kk-section-header"><span class="kk-section-title">${t('df_select_produce')}</span></div>
      <div class="kk-section-body">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${PRODUCE_OPTIONS.map(p => `
            <button class="kk-filter-chip ${p==='tomato'?'active':''}" data-produce="${p}" onclick="selectForecastProduce('${p}')">
              ${p.charAt(0).toUpperCase() + p.slice(1)}
            </button>`).join('')}
        </div>
      </div>
    </div>
    <div id="forecast-loading" class="kk-loading-center" style="padding:40px"><div class="kk-spinner"></div><span style="margin-left:10px;color:var(--kk-muted)">${t('loading')}</span></div>
    <div id="forecast-content" style="display:none">
      <div class="kk-section" style="margin-bottom:20px">
        <div class="kk-section-header">
          <span class="kk-section-title" id="forecast-chart-title"></span>
          <span id="forecast-trend-badge"></span>
        </div>
        <div class="kk-section-body" id="forecast-chart"></div>
      </div>
      <div class="kk-grid-2">
        <div class="kk-section">
          <div class="kk-section-header"><span class="kk-section-title">Market Insight</span></div>
          <div class="kk-section-body" id="forecast-insight"></div>
        </div>
        <div class="kk-section">
          <div class="kk-section-header"><span class="kk-section-title">Forecast Data Table</span></div>
          <div id="forecast-table"></div>
        </div>
      </div>
    </div>
    <div id="forecast-error" style="display:none" class="kk-error-state"></div>`;

  window.selectForecastProduce = async function(produce) {
    document.querySelectorAll('.kk-filter-chip[data-produce]').forEach(c => {
      c.classList.toggle('active', c.dataset.produce === produce);
    });
    await loadForecast(produce);
  };

  await loadForecast('tomato');
}

async function loadForecast(produce) {
  const loading = document.getElementById('forecast-loading');
  const content = document.getElementById('forecast-content');
  const errorEl = document.getElementById('forecast-error');

  loading.style.display = 'flex'; content.style.display = 'none'; errorEl.style.display = 'none';

  try {
    const data = await api.ai.demandForecast(produce, 12, 6);

    loading.style.display = 'none';
    content.style.display = 'block';

    document.getElementById('forecast-chart-title').textContent = `${data.produce} Demand — ${t('df_history')} & ${t('df_forecast')}`;

    const trendLabel = data.trend === 'up' ? t('df_up') : data.trend === 'down' ? t('df_down') : t('df_stable');
    const trendCls = data.trend === 'up' ? 'kk-badge-good' : data.trend === 'down' ? 'kk-badge-bad' : 'kk-badge-neutral';
    document.getElementById('forecast-trend-badge').innerHTML = `<span class="kk-badge ${trendCls}">${trendLabel} ${Math.abs(data.trend_pct)}%</span>`;

    // Build chart data
    const histData = data.history.map(p => ({ label: p.date.slice(-2), value: p.actual || 0 }));
    const forecastData = data.forecast.map(p => ({ label: p.date.slice(-2), value: p.forecast || 0 }));
    const combined = histData.map(p => ({ label: p.label, value: p.value, value2: null }))
      .concat(forecastData.map(p => ({ label: p.label + '(F)', value: null, value2: p.value })));

    renderLineChart(document.getElementById('forecast-chart'),
      [...histData, ...forecastData.map(p => ({ label: p.label + '★', value: p.value }))],
      { color: '#43A047', color2: '#F9A825', label2: 'Forecast', yLabel: data.unit }
    );

    document.getElementById('forecast-insight').innerHTML = `
      <div style="padding:4px 0">
        <div style="font-size:2rem;margin-bottom:8px">${data.trend === 'up' ? '📈' : data.trend === 'down' ? '📉' : '➡️'}</div>
        <p style="font-size:.9rem;line-height:1.6;color:var(--kk-text)">${data.insight}</p>
        <div style="margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:10px">
          <div style="background:var(--kk-cream);padding:10px;border-radius:var(--kk-radius-sm);text-align:center">
            <div style="font-weight:700;font-size:1.1rem;color:var(--kk-green-deep)">${data.trend_pct > 0 ? '+' : ''}${data.trend_pct}%</div>
            <div style="font-size:.75rem;color:var(--kk-muted)">6-Month Change</div>
          </div>
          <div style="background:var(--kk-cream);padding:10px;border-radius:var(--kk-radius-sm);text-align:center">
            <div style="font-weight:700;font-size:1.1rem;color:var(--kk-green-deep)">${data.unit}</div>
            <div style="font-size:.75rem;color:var(--kk-muted)">Unit</div>
          </div>
        </div>
      </div>`;

    // Data table (last 6 history + 6 forecast)
    const tableData = [
      ...data.history.slice(-6).map(p => ({ period: p.date, type: 'Actual', value: `${p.actual || 0} ${data.unit}` })),
      ...data.forecast.map(p => ({ period: p.date + ' ★', type: 'Forecast', value: `${p.forecast || 0} ${data.unit}` })),
    ];
    renderTable(document.getElementById('forecast-table'), [
      { key: 'period', label: 'Period' },
      { key: 'type', label: 'Type', render: v => v === 'Forecast' ? `<span class="kk-badge kk-badge-info">${v}</span>` : v },
      { key: 'value', label: `Demand (${data.unit})` },
    ], tableData, { searchable: false, pageSize: 12 });

  } catch (err) {
    loading.style.display = 'none';
    errorEl.style.display = 'flex';
    errorEl.textContent = `⚠️ ${err.message}`;
  }
}
