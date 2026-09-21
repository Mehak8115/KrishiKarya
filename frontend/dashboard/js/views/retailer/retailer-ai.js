import { dt } from '../../dashboard-i18n.js';
import { aiUploadHTML, aiResultHTML } from '../../components/ai-upload.js';

export function retailerAIView(tool) {
  const state   = window.kkState;
  const current = state.aiData?.[tool];
  const loading = state.aiLoading?.[tool];
  const toolMap = { quality:'retailer-ai-quality', ripeness:'retailer-ai-ripeness',
                    disease:'retailer-ai-disease', shelf:'retailer-shelf-life' };

  const tabs = [
    { key:'quality',  icon:'⭐', label: dt('qualityGrade'),    nav:'retailer-ai-quality' },
    { key:'ripeness', icon:'🍅', label: dt('ripeness'),         nav:'retailer-ai-ripeness' },
    { key:'disease',  icon:'🦠', label: dt('disease'),          nav:'retailer-ai-disease' },
    { key:'shelf',    icon:'⏱', label: dt('shelfLife'),        nav:'retailer-shelf-life' },
  ];

  const activeTab = tool === 'shelf' ? 'shelf' : tool;
  const tabHTML = tabs.map(t =>
    `<button class="kk-tab ${activeTab===t.key?'active':''}" onclick="kkNav('${t.nav}')">${t.icon} ${t.label}</button>`
  ).join('');

  // For shelf-life, show a prediction based on ripeness result
  if (tool === 'shelf') {
    const ripenessResult = state.aiData?.ripeness?.result;
    let prediction = '';
    if (ripenessResult) {
      const shelfDays = ripenessResult.stage === 'Ripe' ? '3-5 days'
                      : ripenessResult.stage === 'Pre-ripe' ? '7-10 days' : '1-2 days';
      prediction = `
      <div class="kk-ai-result">
        <div class="result-top">
          <div class="result-title">Shelf-Life Prediction</div>
          <span class="kk-badge active">Ready</span>
        </div>
        <div class="kk-result-row"><span>Predicted Shelf Life</span><span>${shelfDays}</span></div>
        <div class="kk-result-row"><span>Based On</span><span>${ripenessResult.stage || 'Ripeness analysis'}</span></div>
        <div class="kk-result-row"><span>Storage Recommendation</span><span>Cool dry place, 10–15°C</span></div>
        <div class="kk-rec-box">
          <strong>Advice:</strong> Store in a cool, ventilated environment. Check daily for signs of over-ripening.
        </div>
      </div>`;
    } else {
      prediction = `<div class="kk-empty">
        <div class="empty-icon">⏱</div>
        <h3>Run Ripeness Detection first</h3>
        <p>Shelf-life prediction is derived from the ripeness result. Analyse a crop image under the Ripeness tab first.</p>
        <button class="kk-btn primary" onclick="kkNav('retailer-ai-ripeness')">🍅 Go to Ripeness Detection</button>
      </div>`;
    }
    return `
    <div class="kk-page-header"><h1>🤖 ${dt('aiInsights')}</h1></div>
    <div class="kk-tabs">${tabHTML}</div>
    <div style="max-width:560px;">${prediction}</div>`;
  }

  return `
  <div class="kk-page-header">
    <h1>🤖 ${dt('aiInsights')}</h1>
    <p>Upload a produce photo for instant AI quality, ripeness and disease analysis.</p>
  </div>
  <div class="kk-tabs">${tabHTML}</div>
  <div class="kk-grid-2">
    <div>
      ${aiUploadHTML(tool, current, loading)}
      ${loading ? '' : `
      <button class="kk-btn primary" style="width:100%;margin-top:12px;" onclick="kkAITrigger('${tool}')">
        🔍 Analyse Image
      </button>`}
    </div>
    <div>${aiResultHTML(current?.result, loading)}</div>
  </div>`;
}
