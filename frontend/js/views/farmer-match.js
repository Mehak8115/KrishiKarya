import { ic } from '../icons.js';
import { t } from '../i18n.js';

const API = 'http://localhost:8001/api/v1';

const PRODUCE_OPTIONS = [
  'tomato','onion','potato','wheat','mango','cauliflower','carrot','chili',
  'grapes','banana','spinach','turmeric','pomegranate'
];
const LOCATIONS = [
  'all','Haryana','Punjab','Maharashtra','Ratnagiri','Nashik',
  'Uttar Pradesh','Andhra Pradesh','Sangli','Tamil Nadu',
  'Bihar','Rajasthan','Karnataka','Solapur'
];

function scoreBar(score) {
  const color = score >= 80 ? 'var(--leaf-2)' : score >= 50 ? 'var(--amber)' : 'var(--danger)';
  return `
    <div style="display:flex;align-items:center;gap:8px;">
      <div style="flex:1;height:7px;background:var(--line);border-radius:6px;overflow:hidden;">
        <div style="width:${score}%;height:100%;background:${color};border-radius:6px;"></div>
      </div>
      <span style="font-size:.82rem;font-weight:700;color:${color};min-width:32px;">${score}%</span>
    </div>`;
}

export function farmerMatchView() {
  const state   = window.state;
  const filters = state.matchFilters || { produce:'tomato', qty:500, grade:'B', location:'all' };
  const loading = state.matchLoading;
  const result  = state.matchResult;
  const err     = state.matchError;

  return `
  <div class="container">
    <div class="page-head">
      <h1>Farmer–Retailer Matching</h1>
      <p>Find the best-matched farmers for your produce requirements — filtered by quantity, grade, and location.</p>
    </div>

    <!-- Filter form -->
    <div style="background:var(--white);border:1px solid var(--line);border-radius:var(--radius-m);padding:28px;box-shadow:var(--shadow-card);margin-bottom:28px;">
      <h3 style="font-size:1.05rem;margin-bottom:20px;">Your Procurement Requirement</h3>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:20px;">
        <div class="field-group" style="margin:0;">
          <label class="form-row" style="font-size:.84rem;font-weight:600;margin-bottom:6px;display:block;">Produce</label>
          <select class="field-input" id="match-produce" onchange="updateMatchFilter('produce', this.value)" style="text-transform:capitalize;">
            ${PRODUCE_OPTIONS.map(p => `<option value="${p}" ${filters.produce===p?'selected':''} style="text-transform:capitalize;">${p.charAt(0).toUpperCase()+p.slice(1)}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="margin:0;">
          <label style="font-size:.84rem;font-weight:600;margin-bottom:6px;display:block;">Quantity needed (kg)</label>
          <input class="field-input" type="number" min="1" value="${filters.qty}" onchange="updateMatchFilter('qty', this.value)" id="match-qty">
        </div>
        <div class="field-group" style="margin:0;">
          <label style="font-size:.84rem;font-weight:600;margin-bottom:6px;display:block;">Minimum Grade</label>
          <select class="field-input" id="match-grade" onchange="updateMatchFilter('grade', this.value)">
            ${['A','B','C'].map(g => `<option value="${g}" ${filters.grade===g?'selected':''}>${g === 'A' ? 'A (Premium)' : g === 'B' ? 'B (Standard)' : 'C (Processing)'}</option>`).join('')}
          </select>
        </div>
        <div class="field-group" style="margin:0;">
          <label style="font-size:.84rem;font-weight:600;margin-bottom:6px;display:block;">Preferred Location</label>
          <select class="field-input" id="match-location" onchange="updateMatchFilter('location', this.value)">
            ${LOCATIONS.map(l => `<option value="${l}" ${filters.location===l?'selected':''}>${l === 'all' ? 'All India' : l}</option>`).join('')}
          </select>
        </div>
      </div>
      <button class="btn btn-primary" onclick="runFarmerMatch()">
        ${ic('search')} Find Matching Farmers
      </button>
    </div>

    <!-- Results -->
    ${loading ? `
      <div style="display:flex;align-items:center;gap:12px;padding:40px 0;color:var(--ink-muted);">
        <div class="spinner"></div> Finding best matches…
      </div>
    ` : err ? `
      <div class="empty-state">
        <p style="color:var(--danger);">${err}</p>
        <p style="margin-top:8px;font-size:.85rem;">Make sure the backend is running on port 8000.</p>
      </div>
    ` : result ? `
      <div style="margin-bottom:12px;">
        <p style="color:var(--ink-muted);font-size:.9rem;">
          ${ic('filter')} Matching for: <strong>${result.retailer_need}</strong>
        </p>
      </div>

      ${result.matches.length === 0 ? `
        <div class="empty-state"><p>No farmers match your current requirements. Try relaxing the grade or location filter.</p></div>
      ` : `
        <div style="display:flex;flex-direction:column;gap:14px;padding-bottom:60px;">
          ${result.matches.map((m, i) => `
            <div style="background:var(--white);border:1px solid var(--line);border-radius:var(--radius-m);padding:22px 24px;box-shadow:var(--shadow-card);display:grid;grid-template-columns:auto 1fr auto;gap:20px;align-items:center;">
              <!-- Rank badge -->
              <div style="width:44px;height:44px;border-radius:50%;background:${i===0?'var(--forest)':'var(--sage)'};color:${i===0?'#fff':'var(--forest)'};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05rem;flex-shrink:0;">
                #${i+1}
              </div>
              <!-- Farmer info -->
              <div>
                <div style="font-weight:700;font-size:1.02rem;color:var(--ink);margin-bottom:4px;">${m.farmer_name}</div>
                <div style="font-size:.85rem;color:var(--ink-muted);margin-bottom:10px;">
                  ${ic('pin')} ${m.location} &nbsp;·&nbsp;
                  <span style="background:${m.grade==='A'?'#DDF0D8':m.grade==='B'?'#FBEBD0':'#F6DCD5'};color:${m.grade==='A'?'#28611F':m.grade==='B'?'#8A5A0E':'#95311D'};font-weight:700;padding:2px 8px;border-radius:10px;font-size:.72rem;">
                    Grade ${m.grade}
                  </span>
                  &nbsp;·&nbsp; Stock: ${m.stock_kg} kg
                </div>
                <div style="font-size:.82rem;color:var(--ink-muted);margin-bottom:8px;">${m.match_reason}</div>
                ${scoreBar(m.match_score)}
              </div>
              <!-- Price + action -->
              <div style="text-align:right;flex-shrink:0;">
                <div style="font-family:var(--font-serif);font-size:1.3rem;font-weight:700;color:var(--forest);">₹${m.price}</div>
                <div style="font-size:.75rem;color:var(--ink-muted);margin-bottom:12px;">per kg</div>
                <button class="btn btn-primary btn-sm" onclick="window.showToastGlobal('Contact ${m.farmer_name} — feature coming soon')">
                  Contact Farmer
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `}
    ` : `
      <div class="empty-state" style="padding:50px 20px;">
        <div style="font-size:2.5rem;margin-bottom:12px;">🌾</div>
        <p style="font-weight:600;color:var(--ink);margin-bottom:6px;">Set your requirements above</p>
        <p>Click "Find Matching Farmers" to see ranked results based on produce, quantity, grade and location.</p>
      </div>
    `}
  </div>

  <!-- How it works explainer -->
  <div class="section alt" style="margin-top:0;">
    <div class="container">
      <h2 style="margin-bottom:24px;">How the matching works</h2>
      <div class="grid-3">
        <div class="tool-card">
          <div class="circle-icon" style="background:var(--forest);">${ic('scan')}</div>
          <h3 style="font-size:1rem;">Produce Match (40 pts)</h3>
          <p>Only farmers listing the exact produce you need are considered.</p>
        </div>
        <div class="tool-card">
          <div class="circle-icon" style="background:var(--forest);">${ic('shield')}</div>
          <h3 style="font-size:1rem;">Grade & Stock (45 pts)</h3>
          <p>Farmers are scored on whether their grade meets your minimum, and whether they have enough stock.</p>
        </div>
        <div class="tool-card">
          <div class="circle-icon" style="background:var(--forest);">${ic('pin')}</div>
          <h3 style="font-size:1rem;">Location Proximity (15 pts)</h3>
          <p>Nearby farmers score higher to reduce logistics cost and delivery time.</p>
        </div>
      </div>
    </div>
  </div>`;
}

/* ── called from app.js ── */
export async function loadFarmerMatch(produce, qty, grade, location) {
  window.state.matchLoading = true;
  window.state.matchError   = null;
  window.state.matchResult  = null;
  window.render();

  try {
    const url = `${API}/ai/match-farmers?produce=${encodeURIComponent(produce)}&qty_kg=${qty}&grade=${grade}&location=${encodeURIComponent(location)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error ' + res.status);
    window.state.matchResult = await res.json();
  } catch (e) {
    window.state.matchError = e.message;
  } finally {
    window.state.matchLoading = false;
    window.render();
  }
}
