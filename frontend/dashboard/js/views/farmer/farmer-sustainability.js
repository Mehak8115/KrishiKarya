// ============================================================
// Farmer Sustainability View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { renderBarChart } from '../../components/charts.js';

export async function renderFarmerSustainability(container) {
  container.innerHTML = `
    <div class="kk-page-header">
      <div><h1>🌱 ${t('nav_sustainability')}</h1><p>Your environmental impact and sustainable farming metrics</p></div>
    </div>
    <div class="kk-cards-grid" style="margin-bottom:24px">
      <div class="kk-sustain-card">
        <div class="kk-sustain-icon">♻️</div>
        <div class="kk-sustain-value">42%</div>
        <div class="kk-sustain-label">${t('waste_reduction')}</div>
      </div>
      <div class="kk-sustain-card" style="background:linear-gradient(135deg,#1565C0,#1976D2)">
        <div class="kk-sustain-icon">💧</div>
        <div class="kk-sustain-value">1,240 L</div>
        <div class="kk-sustain-label">${t('water_saved')} this month</div>
      </div>
      <div class="kk-sustain-card" style="background:linear-gradient(135deg,#E65100,#F57C00)">
        <div class="kk-sustain-icon">🌫️</div>
        <div class="kk-sustain-value">320 kg</div>
        <div class="kk-sustain-label">${t('carbon_saved')} CO₂</div>
      </div>
      <div class="kk-sustain-card" style="background:linear-gradient(135deg,#4A148C,#6A1B9A)">
        <div class="kk-sustain-icon">📍</div>
        <div class="kk-sustain-value">78%</div>
        <div class="kk-sustain-label">${t('local_sourcing')}</div>
      </div>
    </div>
    <div class="kk-grid-2">
      <div class="kk-section">
        <div class="kk-section-header"><span class="kk-section-title">Monthly Waste Reduction</span></div>
        <div class="kk-section-body" id="waste-chart"></div>
      </div>
      <div class="kk-section">
        <div class="kk-section-header"><span class="kk-section-title">Water Usage Trend</span></div>
        <div class="kk-section-body" id="water-chart"></div>
      </div>
    </div>
    <div class="kk-section">
      <div class="kk-section-header"><span class="kk-section-title">Sustainability Tips</span></div>
      <div class="kk-section-body">
        ${[
          { icon: '💧', tip: 'Consider drip irrigation to reduce water usage by up to 50% compared to flood irrigation.' },
          { icon: '🌿', tip: 'Using crop rotation with legumes can reduce fertilizer costs by 20-30%.' },
          { icon: '♻️', tip: 'Composting crop waste returns nutrients to soil and reduces landfill impact.' },
          { icon: '☀️', tip: 'Solar-powered water pumps can cut your energy costs by up to 70%.' },
        ].map(tip => `
          <div style="display:flex;gap:12px;padding:12px 0;border-bottom:1px solid var(--kk-border)">
            <span style="font-size:1.4rem">${tip.icon}</span>
            <p style="font-size:.87rem;color:var(--kk-text)">${tip.tip}</p>
          </div>`).join('')}
      </div>
    </div>`;

  // Charts
  renderBarChart(document.getElementById('waste-chart'), [
    { label: 'Jan', value: 30 }, { label: 'Feb', value: 35 }, { label: 'Mar', value: 28 },
    { label: 'Apr', value: 40 }, { label: 'May', value: 38 }, { label: 'Jun', value: 42 },
  ], { yLabel: 'kg', color: '#43A047' });

  renderBarChart(document.getElementById('water-chart'), [
    { label: 'Jan', value: 1800 }, { label: 'Feb', value: 1650 }, { label: 'Mar', value: 1400 },
    { label: 'Apr', value: 1300 }, { label: 'May', value: 1250 }, { label: 'Jun', value: 1240 },
  ], { yLabel: 'L', color: '#1565C0' });
}
