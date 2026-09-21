// ============================================================
// Retailer AI Insights View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { renderAIUpload } from '../../components/ai-upload.js';

export async function renderRetailerAIInsights(container) {
  container.innerHTML = `
    <div class="kk-page-header">
      <div><h1>🤖 ${t('nav_ai_insights')}</h1><p>AI-powered quality and ripeness analysis for procured produce</p></div>
    </div>
    <div class="kk-ai-tabs">
      <button class="kk-ai-tab active" data-tool="quality" onclick="switchInsightTab('quality')">${t('ai_quality')}</button>
      <button class="kk-ai-tab" data-tool="ripeness" onclick="switchInsightTab('ripeness')">${t('ai_ripeness')}</button>
      <button class="kk-ai-tab" data-tool="disease" onclick="switchInsightTab('disease')">${t('ai_disease')}</button>
      <button class="kk-ai-tab" data-tool="shelf" onclick="switchInsightTab('shelf')">${t('ai_shelf_life')}</button>
    </div>
    <div id="insight-panel-quality" class="insight-panel">
      <div class="kk-section">
        <div class="kk-section-header"><span class="kk-section-title">${t('ai_quality')}</span></div>
        <div class="kk-section-body" id="insight-upload-quality"></div>
      </div>
    </div>
    <div id="insight-panel-ripeness" class="insight-panel" style="display:none">
      <div class="kk-section">
        <div class="kk-section-header"><span class="kk-section-title">${t('ai_ripeness')}</span></div>
        <div class="kk-section-body" id="insight-upload-ripeness"></div>
      </div>
    </div>
    <div id="insight-panel-disease" class="insight-panel" style="display:none">
      <div class="kk-section">
        <div class="kk-section-header"><span class="kk-section-title">${t('ai_disease')}</span></div>
        <div class="kk-section-body" id="insight-upload-disease"></div>
      </div>
    </div>
    <div id="insight-panel-shelf" class="insight-panel" style="display:none">
      <div class="kk-section">
        <div class="kk-section-header"><span class="kk-section-title">${t('ai_shelf_life')}</span></div>
        <div class="kk-section-body">
          <div id="shelf-upload"></div>
          <div id="shelf-result" style="margin-top:20px;display:none"></div>
        </div>
      </div>
    </div>`;

  // Render AI upload for each tool
  ['quality','ripeness','disease'].forEach(tool => {
    const el = document.getElementById(`insight-upload-${tool}`);
    if (el) renderAIUpload(el, tool, null);
  });

  // Shelf life — uses ripeness result to predict shelf life
  const shelfEl = document.getElementById('shelf-upload');
  if (shelfEl) {
    renderAIUpload(shelfEl, 'ripeness', (result) => {
      const shelfResult = document.getElementById('shelf-result');
      if (!shelfResult) return;
      const days = result.status === 'Ripe' ? '2–4' : result.status === 'Pre-ripe' ? '6–9' : '0–1';
      const rec = result.status === 'Ripe' ? 'Store at 8–10°C. Process or sell within 3 days.' : result.status === 'Pre-ripe' ? 'Store at 12°C. Expected to reach peak in 5–7 days.' : 'Immediate cold storage required. Process within 24 hours.';
      shelfResult.style.display = 'block';
      shelfResult.innerHTML = `
        <div class="kk-section">
          <div class="kk-section-header"><span class="kk-section-title">Shelf-Life Prediction</span></div>
          <div class="kk-section-body">
            <div style="display:flex;gap:16px;align-items:center;margin-bottom:16px">
              <div style="font-size:2.5rem;font-weight:700;color:var(--kk-green-deep)">${days}</div>
              <div>
                <div style="font-weight:600">Days Estimated Shelf Life</div>
                <div style="font-size:.82rem;color:var(--kk-muted)">Based on ripeness analysis: ${result.status}</div>
              </div>
            </div>
            <div class="kk-ai-recommendation">💡 ${rec}</div>
          </div>
        </div>`;
    });
  }

  window.switchInsightTab = function(tab) {
    document.querySelectorAll('.kk-ai-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.insight-panel').forEach(p => p.style.display = 'none');
    document.querySelector(`[data-tool="${tab}"]`)?.classList.add('active');
    const panel = document.getElementById(`insight-panel-${tab}`);
    if (panel) panel.style.display = 'block';
  };
}
