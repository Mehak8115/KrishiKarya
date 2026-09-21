import { ic } from '../icons.js';
import { t } from '../i18n.js';

function heroSVG() {
  return `<svg viewBox="0 0 1240 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0%" stop-color="#0f2a12"/>
        <stop offset="55%" stop-color="#2f5f2e"/>
        <stop offset="100%" stop-color="#e8b95a"/>
      </linearGradient>
      <radialGradient id="sun" cx="85%" cy="30%" r="45%">
        <stop offset="0%" stop-color="#ffe6a8" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#ffe6a8" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="1240" height="520" fill="url(#sky)"/>
    <circle cx="1054" cy="150" r="260" fill="url(#sun)"/>
    <g opacity="0.5" fill="#0f2a12">
      <path d="M0 340 Q 150 300 320 335 T 640 330 T 960 345 T 1240 320 V520 H0 Z"/>
    </g>
    <g opacity="0.65" fill="#1c3d1c">
      <path d="M0 380 Q 180 350 380 380 T 760 375 T 1240 380 V520 H0 Z"/>
    </g>
    <g stroke="#defac0" stroke-width="2" opacity="0.35">
      ${Array.from({length:26}).map((_,i) => {
        const x = i*50 - 10;
        return `<path d="M${x} 520 C ${x-6} 470, ${x+10} 440, ${x-2} 400" fill="none"/>`;
      }).join('')}
    </g>
  </svg>`;
}

export function homeView() {
  const user = window.state.user;

  return `
  <!-- Hero -->
  <section class="hero">
    <div class="hero-bg">${heroSVG()}</div>
    <div class="hero-scrim"></div>
    <div class="hero-inner">
      <div class="hero-badge">${ic('sparkle')} ${t('hero_badge')}</div>
      <h1>${t('hero_h1')}</h1>
      <p class="lede">${t('hero_lede')}</p>
      <div class="hero-ctas">
        ${user
          ? `<a href="dashboard/index.html" class="btn btn-amber">🏠 Go to Dashboard ${ic('arrowRight')}</a>`
          : `<button class="btn btn-amber" onclick="openLogin()">${t('hero_cta1')} ${ic('arrowRight')}</button>
             <button class="btn" style="background:rgba(255,255,255,.12);color:#fff;border:1px solid rgba(255,255,255,.5);" onclick="openLogin()">
               ${t('hero_cta2')}
             </button>`}
      </div>
    </div>
  </section>

  <!-- Feature strip -->
  <div class="feature-strip-wrap">
    <div class="container">
      <div class="feature-strip">
        <div class="feature-item">
          <div class="feature-icon">${ic('people')}</div>
          <h4>${t('feat1_h')}</h4><p>${t('feat1_p')}</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${ic('truck')}</div>
          <h4>${t('feat2_h')}</h4><p>${t('feat2_p')}</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${ic('shield')}</div>
          <h4>${t('feat3_h')}</h4><p>${t('feat3_p')}</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">${ic('sparkle')}</div>
          <h4>${t('feat4_h')}</h4><p>${t('feat4_p')}</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Role cards — Farmer + Retailer CTAs (marketplace access is role-gated) -->
  <section class="section tight">
    <div class="container">
      <div class="section-head" style="margin-bottom:44px;">
        <div>
          <h2>Built for everyone in the agricultural supply chain</h2>
          <p>Create an account to access the features built for your role.</p>
        </div>
      </div>
      <div class="dual-cta">
        <!-- Farmer CTA -->
        <div class="dual-cta-card farmer" style="position:relative;overflow:hidden;">
          <div style="font-size:3rem;margin-bottom:12px;">🌾</div>
          <h3>${t('cta_farmer_h')}</h3>
          <p>${t('cta_farmer_p')}</p>
          <ul style="color:rgba(255,255,255,.85);font-size:.88rem;margin:0 0 22px;padding-left:18px;line-height:1.8;">
            <li>List your produce with AI quality grading</li>
            <li>Get matched with verified retailers</li>
            <li>Track orders and get paid on delivery</li>
            <li>Disease, ripeness &amp; quality AI checks</li>
          </ul>
          <button class="btn" onclick="${user?.role === 'farmer' ? "location.href='dashboard/index.html'" : 'openLogin()'}" style="background:#fff;color:var(--forest);">
            ${user?.role === 'farmer' ? '🏠 Go to Farmer Dashboard' : `${t('cta_farmer_btn')} ${ic('arrowRight')}`}
          </button>
        </div>

        <!-- Retailer CTA -->
        <div class="dual-cta-card retailer" style="position:relative;overflow:hidden;">
          <div style="font-size:3rem;margin-bottom:12px;">🏪</div>
          <h3>${t('cta_retailer_h')}</h3>
          <p>${t('cta_retailer_p')}</p>
          <ul style="color:rgba(255,255,255,.85);font-size:.88rem;margin:0 0 22px;padding-left:18px;line-height:1.8;">
            <li>Browse verified produce from farmers across India</li>
            <li>View AI quality &amp; freshness reports</li>
            <li>Demand forecasting and procurement tools</li>
            <li>Farmer–retailer matching engine</li>
          </ul>
          <button class="btn" onclick="${user?.role === 'retailer' ? "location.href='dashboard/index.html'" : 'openLogin()'}" style="background:#fff;color:#5c3a10;">
            ${user?.role === 'retailer' ? '🏠 Go to Retailer Dashboard' : `${t('cta_retailer_btn')} ${ic('arrowRight')}`}
          </button>
        </div>
      </div>
    </div>
  </section>

  <!-- AI Tools preview -->
  <section class="section alt">
    <div class="container">
      <div class="section-head">
        <div><h2>${t('tools_h')}</h2><p>${t('tools_p')}</p></div>
      </div>
      <div class="grid-3">
        <div class="tool-card">
          <div class="circle-icon">${ic('bug')}</div>
          <h3>${t('ai_disease')}</h3>
          <p>${t('tool_disease_d')}</p>
          <button class="link-arrow" onclick="go('ai-disease')">${t('upload_image')} ${ic('arrowRight')}</button>
        </div>
        <div class="tool-card">
          <div class="circle-icon">${ic('sparkle')}</div>
          <h3>${t('ai_ripeness')}</h3>
          <p>${t('tool_ripeness_d')}</p>
          <button class="link-arrow" onclick="go('ai-ripeness')">${t('upload_image')} ${ic('arrowRight')}</button>
        </div>
        <div class="tool-card">
          <div class="circle-icon">${ic('scan')}</div>
          <h3>Quality Grading</h3>
          <p>${t('tool_quality_d')}</p>
          <button class="link-arrow" onclick="go('ai-quality')">${t('upload_image')} ${ic('arrowRight')}</button>
        </div>
      </div>
      <p style="text-align:center;margin-top:24px;color:var(--ink-muted);font-size:.88rem;">
        🔒 Full AI results with history and produce-linked grading available after login
      </p>
    </div>
  </section>

  <!-- Stats -->
  <section class="section tight">
    <div class="container">
      <div class="stats-row">
        <div class="stat-box"><div class="num">${t('stat1_n')}</div><div class="label">${t('stat1_l')}</div></div>
        <div class="stat-box"><div class="num">${t('stat2_n')}</div><div class="label">${t('stat2_l')}</div></div>
        <div class="stat-box"><div class="num">${t('stat3_n')}</div><div class="label">${t('stat3_l')}</div></div>
        <div class="stat-box"><div class="num">${t('stat4_n')}</div><div class="label">${t('stat4_l')}</div></div>
      </div>
    </div>
  </section>`;
}
