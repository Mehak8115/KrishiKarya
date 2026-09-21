import { dt } from '../../dashboard-i18n.js';
import { aiUploadHTML, aiResultHTML } from '../../components/ai-upload.js';
import { api } from '../../dashboard-api.js';
import { renderTable } from '../../components/table.js';
import { toolBadge } from '../../components/badges.js';

export function farmerAIView(tool) {
  const state   = window.kkState;
  const current = state.aiData?.[tool];
  const loading = state.aiLoading?.[tool];

  const tabs = ['disease','ripeness','quality'].map(t => `
    <button class="kk-tab ${tool === t ? 'active' : ''}" onclick="kkNav('farmer-ai-${t}')">
      ${{ disease:'🦠', ripeness:'🍅', quality:'⭐' }[t]}
      ${{ disease: dt('diseaseDetection'), ripeness: dt('ripenessDetection'), quality: dt('qualityGrading') }[t]}
    </button>`).join('');

  return `
  <div class="kk-page-header">
    <h1>🤖 ${dt('aiInspection')}</h1>
    <p>Upload a crop photo to get an instant AI analysis powered by the backend.</p>
  </div>
  <div class="kk-tabs">${tabs}</div>
  <div class="kk-grid-2">
    <div>
      ${aiUploadHTML(tool, current, loading)}
      ${loading ? '' : `
      <button class="kk-btn primary" style="width:100%;margin-top:12px;" onclick="kkAITrigger('${tool}')">
        🔍 Analyse Image
      </button>`}
    </div>
    <div>
      ${aiResultHTML(current?.result, loading)}
    </div>
  </div>`;
}

export async function farmerAIHistoryView() {
  let rows = [], error = '';
  try { rows = await api.ai.history(30); } catch(e) { error = e.message; }

  const columns = [
    { key:'tool',         label:dt('tool'),       render: r => toolBadge(r.tool) },
    { key:'grade_result', label:dt('result'),      render: r => r.grade_result || r.badge || '—' },
    { key:'confidence',   label:dt('confidence'),  render: r => `${r.confidence}%` },
    { key:'recommendation', label:dt('recommendation'),
      render: r => `<span style="font-size:.78rem;color:var(--kk-muted);">${(r.recommendation||'').slice(0,60)}…</span>` },
    { key:'analyzed_at',  label:dt('date'),
      render: r => new Date(r.analyzed_at).toLocaleDateString() },
  ];

  return `
  <div class="kk-page-header">
    <h1>📋 ${dt('inspectionHistory')}</h1>
    <p>All your past AI crop inspections.</p>
  </div>
  ${error ? `<div class="kk-error-box">${error}</div>` : ''}
  <div class="kk-panel">
    <div class="kk-panel-header"><h2>AI Inspection Records (${rows.length})</h2></div>
    <div class="kk-panel-body" style="padding:0;">
      ${renderTable({ columns, rows, emptyMessage: dt('noAnalysis') })}
    </div>
  </div>`;
}
