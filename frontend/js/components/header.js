import { ic } from '../icons.js';
import { t } from '../i18n.js';

export function headerHTML() {
  const state     = window.state;
  const active    = state.page;
  const lang      = state.lang;
  const user      = state.user;
  const aiRoutes  = ['ai-disease','ai-ripeness','ai-quality','demand-forecast'];
  const aiActive  = aiRoutes.includes(active) ? 'active' : '';

  // Auth button — if logged in show Dashboard link, else Login
  const authBtn = user
    ? `<a href="dashboard/index.html" class="btn btn-primary btn-sm">🏠 Dashboard</a>
       <button class="btn btn-outline btn-sm" onclick="logout()">Log out</button>`
    : `<button class="btn btn-primary btn-sm" onclick="openLogin()">${t('nav_login')}</button>`;

  return `
  <header class="site-header">
    <div class="header-inner">
      <div class="brand" onclick="go('home')">
        <div class="brand-mark">${ic('leaf')}</div>
        <div>
          <div class="brand-name">${lang==='hi' ? 'कृषि कार्य' : 'Krishi Karya'}</div>
          <div class="brand-tag">${t('brand_tag')}</div>
        </div>
      </div>
      <nav class="main-nav">
        <a href="#/home" class="${active==='home'?'active':''}" onclick="event.preventDefault();go('home')">${t('nav_home')}</a>
        <div class="nav-dd" id="aiDropdown">
          <button onclick="toggleAiDropdown(event)" class="${aiActive}">${t('nav_ai')} ${ic('chevronDown')}</button>
          <div class="nav-dd-panel">
            <a href="#/ai-disease"  class="${active==='ai-disease' ?'active':''}" onclick="event.preventDefault();go('ai-disease')">${t('ai_disease')}</a>
            <a href="#/ai-ripeness" class="${active==='ai-ripeness'?'active':''}" onclick="event.preventDefault();go('ai-ripeness')">${t('ai_ripeness')}</a>
            <a href="#/ai-quality"  class="${active==='ai-quality' ?'active':''}" onclick="event.preventDefault();go('ai-quality')">Quality Grading</a>
            <a href="#/demand-forecast" class="${active==='demand-forecast'?'active':''}" onclick="event.preventDefault();go('demand-forecast')">Demand Forecasting</a>
          </div>
        </div>
        <a href="#/how-it-works" class="${active==='how-it-works'?'active':''}" onclick="event.preventDefault();go('how-it-works')">${t('nav_how')}</a>
        <a href="#/about"   class="${active==='about'  ?'active':''}" onclick="event.preventDefault();go('about')">${t('nav_about')}</a>
        <a href="#/contact" class="${active==='contact' ?'active':''}" onclick="event.preventDefault();go('contact')">${t('nav_contact')}</a>
      </nav>
      <div class="header-actions">
        <button class="icon-btn" aria-label="Search" onclick="openSearch()">${ic('search')}</button>
        <button class="lang-toggle" onclick="toggleLang()">${ic('globe')} <span class="lang-label">${lang==='en'?'EN':'हिंदी'}</span></button>
        ${authBtn}
        <button class="burger icon-btn" aria-label="Menu" onclick="toggleMobileNav()">${ic('menu')}</button>
      </div>
    </div>
    <div class="mobile-nav ${state.mobileNavOpen?'open':''}" id="mobileNav">
      <a href="#" onclick="event.preventDefault();go('home')">${t('nav_home')}</a>
      <button class="mn-parent" onclick="toggleMobileSub()">${t('nav_ai')} ${ic('chevronDown')}</button>
      <div class="mobile-sub" id="mobileSub" style="display:none">
        <a href="#" onclick="event.preventDefault();go('ai-disease')">${t('ai_disease')}</a>
        <a href="#" onclick="event.preventDefault();go('ai-ripeness')">${t('ai_ripeness')}</a>
        <a href="#" onclick="event.preventDefault();go('ai-quality')">Quality Grading</a>
        <a href="#" onclick="event.preventDefault();go('demand-forecast')">Demand Forecasting</a>
      </div>
      <a href="#" onclick="event.preventDefault();go('how-it-works')">${t('nav_how')}</a>
      <a href="#" onclick="event.preventDefault();go('about')">${t('nav_about')}</a>
      <a href="#" onclick="event.preventDefault();go('contact')">${t('nav_contact')}</a>
      ${user
        ? `<a href="dashboard/index.html">🏠 Dashboard</a>
           <a href="#" onclick="event.preventDefault();logout()">Log out</a>`
        : `<a href="#" onclick="event.preventDefault();openLogin()">${t('nav_login')}</a>`}
    </div>
  </header>`;
}
