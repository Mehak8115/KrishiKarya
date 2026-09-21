import { ic } from '../icons.js';
import { t } from '../i18n.js';
import { runAnalysis } from '../data.js';

const API = 'http://localhost:8001/api/v1';

function renderResultCard(result, lang) {
  if (!result) return '';
  const badgeClass = `badge-${result.badge}`;

  if (result.type === 'disease') {
    return `
    <div class="result-card">
      <div class="result-top">
        <div class="result-title">${t('disease_status')}</div>
        <span class="result-badge ${badgeClass}">${result.badgeLabel}</span>
      </div>
      <div class="confidence-row">
        <span style="font-size:.82rem;color:var(--ink-muted)">${t('confidence')}: ${result.confidence}%</span>
        <div class="confidence-bar"><div class="confidence-fill" style="width:${result.confidence}%"></div></div>
      </div>
      <div class="result-detail-row"><span>${t('disease_name')}</span><span>${result.issue}</span></div>
      <div class="result-detail-row"><span>${t('severity')}</span><span>${result.severity}</span></div>
      <div class="rec-box"><strong>${t('recommendation')}:</strong> ${result.rec}</div>
    </div>`;
  }

  if (result.type === 'ripeness') {
    return `
    <div class="result-card">
      <div class="result-top">
        <div class="result-title">${t('ripeness_stage')}</div>
        <span class="result-badge ${badgeClass}">${result.badgeLabel}</span>
      </div>
      <div class="confidence-row">
        <span style="font-size:.82rem;color:var(--ink-muted)">${t('confidence')}: ${result.confidence}%</span>
        <div class="confidence-bar"><div class="confidence-fill" style="width:${result.confidence}%"></div></div>
      </div>
      <div class="result-detail-row"><span>${t('days_window')}</span><span>${result.window}</span></div>
      <div class="result-detail-row"><span>${t('sugar_est')}</span><span>${result.sugar}</span></div>
      <div class="rec-box"><strong>${t('recommendation')}:</strong> ${result.rec}</div>
    </div>`;
  }

  // quality
  return `
  <div class="result-card">
    <div class="result-top">
      <div class="result-title">${t('grade_result')}: ${result.grade}</div>
      <span class="result-badge ${badgeClass}">${result.badgeLabel}</span>
    </div>
    <div class="confidence-row">
      <span style="font-size:.82rem;color:var(--ink-muted)">${t('confidence')}: ${result.confidence}%</span>
      <div class="confidence-bar"><div class="confidence-fill" style="width:${result.confidence}%"></div></div>
    </div>
    <div class="result-detail-row"><span>${t('size_uniformity')}</span><span>${result.size}</span></div>
    <div class="result-detail-row"><span>${t('surface_quality')}</span><span>${result.surface}</span></div>
    <div class="result-detail-row"><span>${t('est_price')}</span><span>${result.price}</span></div>
    <div class="rec-box"><strong>${t('recommendation')}:</strong> ${result.rec}</div>
  </div>`;
}

export function aiToolView(tool) {
  const state   = window.state;
  const titleKey = {disease:'ai_disease_h', ripeness:'ai_ripeness_h', quality:'ai_quality_h'}[tool];
  const subKey   = {disease:'ai_disease_p', ripeness:'ai_ripeness_p', quality:'ai_quality_p'}[tool];
  const current  = state.aiCurrent[tool];
  const loading  = state.aiLoading[tool];
  const history  = state.aiHistory[tool];
  const lang     = state.lang;

  // Extra badge for quality tool — shows it uses backend AI
  const qualityBadge = tool === 'quality'
    ? `<div style="display:inline-flex;align-items:center;gap:6px;background:var(--sage);color:var(--leaf-2);font-size:.78rem;font-weight:600;padding:5px 12px;border-radius:20px;margin-bottom:16px;">
         ${ic('sparkle')} Powered by backend AI — grades are stored in the database
       </div>`
    : '';

  let resultsInner = '';
  if (loading) {
    resultsInner = `<div class="analyzing"><div class="spinner"></div> ${t('analyzing')}</div>`;
  } else if (current && current.result) {
    resultsInner = renderResultCard(current.result, lang);
    if (history.length > 1) {
      resultsInner += `
      <p style="font-size:.82rem;color:var(--ink-muted);margin-top:16px;">${t('recent_analyses')}</p>
      <div class="history-thumb-row">
        ${history.map(h => `<img class="history-thumb ${h.id===current.id?'active':''}" src="${h.thumb}" onclick="selectHistory('${tool}','${h.id}')" alt="history">`).join('')}
      </div>`;
    }
  } else {
    resultsInner = `<div class="results-empty">
      <p style="margin-bottom:6px;font-weight:600;color:var(--ink);">${t('no_analyses')}</p>
      <p>${t('no_analyses_sub')}</p>
    </div>`;
  }

  return `
  <div class="container">
    <div class="page-head" style="padding-bottom:0;">
      <div class="breadcrumb">
        <a href="#" onclick="event.preventDefault();go('home')">${t('breadcrumb_home')}</a> /
        <span>${t('nav_ai')}</span>
      </div>
      <h1>${t(titleKey)}</h1>
      <p>${t(subKey)}</p>
      ${qualityBadge}
    </div>
    <div class="ai-layout" style="margin-top:26px;">
      <div class="dropzone" id="dz-${tool}"
           ondragover="event.preventDefault();this.classList.add('drag');"
           ondragleave="this.classList.remove('drag');"
           ondrop="handleDrop(event,'${tool}')">
        ${current && current.thumb ? `<img class="preview" src="${current.thumb}" alt="preview">` : `
        <div class="upload-icon">${ic('upload')}</div>
        <h4>${t('dz_h')}</h4>
        <p>${t('dz_p')}</p>
        <p>${t('dz_hint')}</p>`}
        <input type="file" accept="image/png,image/jpeg" onchange="handleFileInput(event,'${tool}')">
      </div>
      <div class="results-panel">${resultsInner}</div>
    </div>
  </div>`;
}

export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

/* ── processFile: tries backend API first, falls back to local mock ── */
export async function processFile(file, tool) {
  if (!file) return;
  if (!file.type.match(/image\/(png|jpeg)/)) {
    window.showToastGlobal('Please upload a JPG or PNG image.');
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    window.showToastGlobal('Image is larger than 8 MB.');
    return;
  }

  let dataUrl;
  try { dataUrl = await fileToDataUrl(file); } catch(e) { return; }

  window.state.aiLoading[tool] = true;
  window.state.aiCurrent[tool] = { id:'x', thumb: dataUrl, result: null };
  window.render();

  try {
    // Try real backend API
    const formData = new FormData();
    const endpoint = tool === 'quality' ? '/ai/quality-grading' : '/ai/analyze';
    formData.append(tool === 'quality' ? 'image' : 'file', file);
    if (tool !== 'quality') formData.append('tool', tool);

    const resp = await fetch(`${API}${endpoint}`, { method: 'POST', body: formData });
    if (!resp.ok) throw new Error('API error');

    const apiResult = await resp.json();

    // Normalise API response to match local result shape
    const result = tool === 'quality' ? {
      type: 'quality',
      grade: apiResult.grade,
      badge: apiResult.grade === 'A' ? 'good' : apiResult.grade === 'B' ? 'warn' : 'bad',
      badgeLabel: `Grade ${apiResult.grade}`,
      confidence: Math.round(apiResult.confidence * 100),
      size: `Quality score ${apiResult.quality_score.toFixed(1)}/100`,
      surface: apiResult.defects.length ? apiResult.defects.join(', ') : 'No defects detected',
      price: apiResult.estimated_price || 'Market-linked',
      modelVersion: apiResult.model_version,
      rec: apiResult.defects.length
        ? 'Sort or inspect the listed defects before dispatch.'
        : 'Premium quality detected. Suitable for organised retail.',
    } : {
      type:       tool,
      badge:      apiResult.badge,
      badgeLabel: apiResult.badge_label,
      confidence: apiResult.confidence,
      rec:        apiResult.recommendation,
      // tool-specific fields
      ...(tool === 'disease'  ? { issue: apiResult.detail.issue,   severity: apiResult.detail.severity } : {}),
      ...(tool === 'ripeness' ? { window: apiResult.detail.window, sugar: apiResult.detail.sugar } : {}),
      ...(tool === 'quality'  ? {
        grade:   apiResult.status,
        size:    apiResult.detail.size,
        surface: apiResult.detail.surface,
        price:   apiResult.detail.price,
      } : {}),
    };

    const id    = 'a' + Date.now();
    const entry = { id, thumb: dataUrl, result };
    window.state.aiHistory[tool] = [entry, ...window.state.aiHistory[tool]].slice(0, 6);
    window.state.aiCurrent[tool] = entry;
    window.state.aiLoading[tool] = false;
    window.render();

  } catch (_) {
    // Fallback to local mock if backend unreachable
    setTimeout(() => {
      const result = runAnalysis(tool, file.name + file.size);
      const id     = 'a' + Date.now();
      const entry  = { id, thumb: dataUrl, result };
      window.state.aiHistory[tool] = [entry, ...window.state.aiHistory[tool]].slice(0, 6);
      window.state.aiCurrent[tool] = entry;
      window.state.aiLoading[tool] = false;
      window.render();
    }, 800 + Math.random() * 400);
  }
}
