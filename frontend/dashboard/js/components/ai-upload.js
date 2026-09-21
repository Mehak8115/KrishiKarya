import { dt } from '../dashboard-i18n.js';
import { api } from '../dashboard-api.js';

export function aiUploadHTML(tool, currentEntry, loading) {
  const thumb = currentEntry?.thumb;

  return `
  <div class="kk-dropzone ${loading ? '' : ''}" id="dz-${tool}"
       ondragover="event.preventDefault();this.classList.add('drag');"
       ondragleave="this.classList.remove('drag');"
       ondrop="kkAIDrop(event,'${tool}')">
    ${thumb
      ? `<img class="preview" src="${thumb}" alt="preview" style="max-height:220px;border-radius:10px;object-fit:contain;">`
      : `<div class="dz-icon">📷</div>
         <h4>${dt('uploadImage')}</h4>
         <p>${dt('dragDrop')}</p>
         <p style="font-size:.74rem;margin-top:4px;color:var(--kk-soft);">${dt('jpgPng')}</p>`}
    <input type="file" accept="image/png,image/jpeg" onchange="kkAIFileInput(event,'${tool}')">
  </div>`;
}

export function aiResultHTML(result, loading) {
  if (loading) {
    return `<div class="kk-spinner-wrap">
      <div class="kk-spinner"></div>
      <span style="margin-left:12px;color:var(--kk-muted);">${dt('analyzing')}</span>
    </div>`;
  }
  if (!result) {
    return `<div class="kk-empty">
      <div class="empty-icon">🤖</div>
      <h3>${dt('noAnalysis')}</h3>
      <p>${dt('noAnalysisSub')}</p>
    </div>`;
  }

  const badgeClass = `kk-badge ${result.badge}`;
  const confPct    = result.confidence || 0;

  let detailRows = '';
  if (result.type === 'disease') {
    detailRows = `
      <div class="kk-result-row"><span>${dt('detectedIssue')}</span><span>${result.issue || '—'}</span></div>
      <div class="kk-result-row"><span>${dt('severity')}</span><span>${result.severity || '—'}</span></div>`;
  } else if (result.type === 'ripeness') {
    detailRows = `
      <div class="kk-result-row"><span>${dt('ripenessStage')}</span><span>${result.window || result.stage || '—'}</span></div>
      <div class="kk-result-row"><span>${dt('sugarContent')}</span><span>${result.sugar || '—'}</span></div>`;
  } else {
    detailRows = `
      <div class="kk-result-row"><span>${dt('sizeUniformity')}</span><span>${result.size || '—'}</span></div>
      <div class="kk-result-row"><span>${dt('surfaceQuality')}</span><span>${result.surface || '—'}</span></div>
      <div class="kk-result-row"><span>${dt('estPrice')}</span><span>${result.price || '—'}</span></div>`;
      detailRows += `<div class="kk-result-row"><span>Model Version</span><span>${result.modelVersion || 'Trained quality model'}</span></div>`;
  }

  return `
  <div class="kk-ai-result">
    <div class="result-top">
      <div class="result-title">${result.grade || result.status || result.stage || 'Result'}</div>
      <span class="${badgeClass}">${result.badgeLabel || result.badge}</span>
    </div>
    <div style="font-size:.78rem;color:var(--kk-muted);">${dt('confidence')}: ${confPct}%</div>
    <div class="kk-confidence-bar">
      <div class="kk-confidence-fill" style="width:${confPct}%"></div>
    </div>
    ${detailRows}
    <div class="kk-rec-box">
      <strong>${dt('recommendation')}:</strong> ${result.rec || result.recommendation || '—'}
    </div>
  </div>`;
}

/** Normalise API response to a flat result object */
export function normaliseAIResult(apiResult, tool) {
  return {
    type:       tool,
    badge:      apiResult.badge,
    badgeLabel: apiResult.badge_label,
    confidence: apiResult.confidence,
    rec:        apiResult.recommendation,
    status:     apiResult.status,
    ...(tool === 'disease'  ? { issue: apiResult.detail?.issue,   severity: apiResult.detail?.severity } : {}),
    ...(tool === 'ripeness' ? { window: apiResult.detail?.window, sugar: apiResult.detail?.sugar, stage: apiResult.status } : {}),
    ...(tool === 'quality'  ? {
      grade:   apiResult.status,
      size:    apiResult.detail?.size,
      surface: apiResult.detail?.surface,
      price:   apiResult.detail?.price,
      modelVersion: apiResult.model_version,
    } : {}),
  };
}
