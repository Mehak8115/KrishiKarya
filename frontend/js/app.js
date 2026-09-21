import { headerHTML } from './components/header.js';
import { footerHTML } from './components/footer.js';
import {
  loginModalHTML, searchOverlayHTML,
  apiLogin, apiSendOTP, apiVerifyOTPRegister, apiForgotPassword, apiResetPassword
} from './components/modal.js';
import { showToast } from './components/toast.js';
import { homeView } from './views/home.js';
import { aiToolView, processFile } from './views/ai-tool.js';
import { howItWorksView } from './views/how-it-works.js';
import { aboutView } from './views/about.js';
import { contactView } from './views/contact.js';
import { notFoundView } from './views/not-found.js';
import { demandForecastView } from './views/demand-forecast.js';
import { t } from './i18n.js';

/* =========================================================
   Global State
   ========================================================= */
window.state = {
  page: 'home',
  lang: localStorage.getItem('kk_lang') || 'en',
  mobileNavOpen: false,
  loginOpen: false,
  loginTab: 'farmer',
  searchOpen: false,
  authStep: 'login',   // 'login'|'register-form'|'otp-verify'|'forgot'|'reset-verify'
  pendingReg: null,
  resetEmail: null,

  // Auth
  user:  JSON.parse(localStorage.getItem('kk_user')  || 'null'),
  token: localStorage.getItem('kk_token') || null,

  // Cart (kept for main site header badge only — actual cart is in retailer dashboard)
  cart: JSON.parse(localStorage.getItem('kk_cart') || '[]'),

  // AI state for public tool pages
  aiCurrent:  { disease:null, ripeness:null, quality:null },
  aiLoading:  { disease:false, ripeness:false, quality:false },
  aiHistory:  { disease:[], ripeness:[], quality:[] },
  demandProduce: 'tomato',
  demandLocation: 'Jaipur',
  demandHorizon: 30,
  demandData: null,
  demandLoading: false,
  demandError: null,
};

function saveCart() { localStorage.setItem('kk_cart', JSON.stringify(window.state.cart)); }
function saveAuth() {
  if (window.state.token) {
    localStorage.setItem('kk_token', window.state.token);
    localStorage.setItem('kk_user',  JSON.stringify(window.state.user));
  } else {
    localStorage.removeItem('kk_token');
    localStorage.removeItem('kk_user');
  }
}

/* =========================================================
   Render
   ========================================================= */
function getViewHTML(page) {
  if (page === 'home')          return homeView();
  if (page === 'ai-disease')    return aiToolView('disease');
  if (page === 'ai-ripeness')   return aiToolView('ripeness');
  if (page === 'ai-quality')    return aiToolView('quality');
  if (page === 'demand-forecast') return demandForecastView();
  if (page === 'how-it-works')  return howItWorksView();
  if (page === 'about')         return aboutView();
  if (page === 'contact')       return contactView();
  return notFoundView();
}

export function render() {
  const root = document.getElementById('app-root');
  if (!root) return;
  const s = window.state;
  document.documentElement.lang = s.lang;
  document.body.classList.toggle('lang-hi', s.lang === 'hi');

  root.innerHTML =
    headerHTML() +
    `<main>${getViewHTML(s.page)}</main>` +
    footerHTML() +
    loginModalHTML() +
    searchOverlayHTML();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}
window.render = render;

/* =========================================================
   Router
   ========================================================= */
const ROUTE_MAP = {
  '/home':         'home',
  '/ai-disease':   'ai-disease',
  '/ai-ripeness':  'ai-ripeness',
  '/ai-quality':   'ai-quality',
  '/demand-forecast': 'demand-forecast',
  '/how-it-works': 'how-it-works',
  '/about':        'about',
  '/contact':      'contact',
};

function routeFromHash() {
  const hash = location.hash.replace('#', '');
  return ROUTE_MAP[hash] || 'home';
}

window.go = function(page) {
  window.state.page = page;
  window.state.mobileNavOpen = false;
  history.pushState(null, '', '#/' + page);
  render();
};

window.setDemandCrop = function(crop) {
  window.state.demandProduce = crop.trim() || 'tomato';
};
window.setDemandLocation = function(location) {
  window.state.demandLocation = location.trim() || 'Jaipur';
};
window.setDemandHorizon = function(days) {
  window.state.demandHorizon = Number(days) || 30;
};
window.selectDemandProduce = function(crop) {
  window.state.demandProduce = crop;
  window.loadPublicDemandForecast(crop);
};
window.loadPublicDemandForecast = async function(crop) {
  window.state.demandLoading = true;
  window.state.demandError = null;
  render();
  try {
    const response = await fetch('http://localhost:8001/api/v1/ai/demand-forecast', {
      method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ crop, location: window.state.demandLocation, horizon_days: window.state.demandHorizon }),
    });
    if (!response.ok) throw new Error((await response.json()).detail || `API error ${response.status}`);
    const result = await response.json();
    window.state.demandData = {
      produce: result.crop, unit: result.unit, history: [],
      forecast: result.daily.map(point => ({ date: point.date, forecast: point.predicted_demand })),
      trend: 'stable', trend_pct: 0, total_forecast: result.predicted_demand,
      insight: `${result.crop} demand in ${result.location} is forecast at ${result.predicted_demand} ${result.unit} for ${result.forecast_period}.`,
    };
  } catch (error) { window.state.demandError = error.message; }
  window.state.demandLoading = false;
  render();
};

window.addEventListener('popstate', () => {
  window.state.page = routeFromHash();
  render();
});

/* =========================================================
   Header actions
   ========================================================= */
window.toggleLang = function() {
  window.state.lang = window.state.lang === 'en' ? 'hi' : 'en';
  localStorage.setItem('kk_lang', window.state.lang);
  render();
};
window.toggleMobileNav = function() { window.state.mobileNavOpen = !window.state.mobileNavOpen; render(); };
window.toggleMobileSub = function() {
  const el = document.getElementById('mobileSub');
  if (el) el.style.display = el.style.display === 'none' ? 'flex' : 'none';
};
window.toggleAiDropdown = function(e) {
  e.stopPropagation();
  document.getElementById('aiDropdown')?.classList.toggle('open');
};
document.addEventListener('click', () => document.getElementById('aiDropdown')?.classList.remove('open'));

window.openSearch = function() {
  window.state.searchOpen = true;
  render();
  setTimeout(() => document.getElementById('searchInput')?.focus(), 30);
};
window.closeSearch = function() { window.state.searchOpen = false; render(); };
window.handleSearchBgClick = function(e) { if (e.target === e.currentTarget) window.closeSearch(); };
window.submitSearch = function(e) {
  e.preventDefault();
  window.closeSearch();
  // Redirect to dashboard marketplace if logged in, else to about
  if (window.state.token) {
    window.location.href = 'dashboard/index.html';
  } else {
    go('about');
  }
};

/* =========================================================
   Auth modal
   ========================================================= */
window.openLogin  = function() {
  window.state.loginOpen = true;
  window.state.authStep  = 'login';
  render();
};
window.closeLogin = function() { window.state.loginOpen = false; render(); };
window.handleModalBgClick = function(e) { if (e.target === e.currentTarget) window.closeLogin(); };
window.setLoginTab = function(tab)  { window.state.loginTab = tab; render(); };
window.setAuthStep = function(step) {
  window.state.authStep = step;
  render();
  setTimeout(() => document.querySelector('.modal-box input')?.focus(), 50);
};

function _authError(msg) {
  const el = document.getElementById('auth-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = msg ? 'block' : 'none';
}
function _authLoading(on, label) {
  const btn = document.getElementById('auth-submit-btn');
  if (!btn) return;
  btn.disabled = on;
  if (on) btn.textContent = label || 'Please wait…';
}

/* ── Login ── */
window.submitLogin = async function(e) {
  e.preventDefault();
  const email    = document.getElementById('auth-email')?.value.trim();
  const password = document.getElementById('auth-password')?.value;
  if (!email || !password) return;
  _authError('');
  _authLoading(true, 'Signing in…');
  try {
    const data    = await apiLogin(email, password);
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    window.state.token = data.access_token;
    window.state.user  = { id: payload.sub, role: payload.role, name: payload.name || email };
    saveAuth();
    window.closeLogin();
    showToast(`Welcome back, ${window.state.user.name.split(' ')[0]}! 🌾`);
    setTimeout(() => { window.location.href = 'dashboard/index.html'; }, 500);
  } catch(err) {
    _authError(err.message);
    _authLoading(false);
  }
};

/* ── Register Step 1: Send OTP ── */
window.submitRegisterSendOTP = async function(e) {
  e.preventDefault();
  const name     = document.getElementById('reg-name')?.value.trim();
  const email    = document.getElementById('reg-email')?.value.trim();
  const password = document.getElementById('reg-password')?.value;
  const role     = window.state.loginTab;
  if (!name || !email || !password) return;
  _authError('');
  _authLoading(true, 'Sending code…');
  try {
    const resp = await apiSendOTP(email, name, role);
    window.state.pendingReg = { email, full_name: name, role, password };
    window.setAuthStep('otp-verify');
    // Try to get OTP from dev endpoint for convenience
    try {
      const devR = await fetch(`http://localhost:8001/api/v1/auth/dev-otp?email=${encodeURIComponent(email)}`);
      if (devR.ok) {
        const devData = await devR.json();
        if (devData.otp) {
          setTimeout(() => {
            const otpInput = document.getElementById('otp-code');
            if (otpInput) otpInput.value = devData.otp;
          }, 100);
          showToast(`Dev mode: OTP auto-filled (${devData.otp}) 🔑`);
          return;
        }
      }
    } catch(_) {}
    showToast(`Verification code sent to ${email} 📧`);
  } catch(err) {
    _authError(err.message);
    _authLoading(false);
  }
};

/* ── Register Step 2: Verify OTP ── */
window.submitVerifyOTP = async function(e) {
  e.preventDefault();
  const code    = document.getElementById('otp-code')?.value.trim();
  const pending = window.state.pendingReg;
  if (!code || !pending) return;
  _authError('');
  _authLoading(true, 'Verifying…');
  try {
    const data    = await apiVerifyOTPRegister(pending.email, code, pending.password, pending.full_name, pending.role);
    const payload = JSON.parse(atob(data.access_token.split('.')[1]));
    window.state.token      = data.access_token;
    window.state.user       = { id: payload.sub, role: payload.role, name: payload.name || pending.email };
    window.state.pendingReg = null;
    saveAuth();
    window.closeLogin();
    showToast(`Welcome to Krishi Karya, ${pending.full_name}! 🌾`);
    setTimeout(() => { window.location.href = 'dashboard/index.html'; }, 600);
  } catch(err) {
    _authError(err.message);
    _authLoading(false);
  }
};

/* ── Resend OTP ── */
window.resendOTP = async function() {
  const pending = window.state.pendingReg;
  if (!pending) return;
  const btn = document.getElementById('resend-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
  try {
    await apiSendOTP(pending.email, pending.full_name, pending.role);
    showToast(`New code sent to ${pending.email}`);
  } catch(e) {
    showToast('Could not resend: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = 'Resend code'; }
  }
};

/* ── Forgot password ── */
window.submitForgotPassword = async function(e) {
  e.preventDefault();
  const email = document.getElementById('forgot-email')?.value.trim();
  if (!email) return;
  _authError('');
  _authLoading(true, 'Sending…');
  try {
    await apiForgotPassword(email);
    window.state.resetEmail = email;
    window.setAuthStep('reset-verify');
    showToast(`Reset code sent to ${email}`);
  } catch(_) {
    window.state.resetEmail = email;
    window.setAuthStep('reset-verify');
  }
};

/* ── Reset password ── */
window.submitResetPassword = async function(e) {
  e.preventDefault();
  const code     = document.getElementById('reset-otp')?.value.trim();
  const password = document.getElementById('reset-password')?.value;
  const email    = window.state.resetEmail;
  if (!code || !password || !email) return;
  _authError('');
  _authLoading(true, 'Resetting…');
  try {
    await apiResetPassword(email, code, password);
    window.setAuthStep('login');
    showToast('Password reset! Please log in with your new password.');
  } catch(err) {
    _authError(err.message);
    _authLoading(false);
  }
};

/* ── Logout ── */
window.logout = function() {
  window.state.token = null;
  window.state.user  = null;
  saveAuth();
  showToast('Logged out successfully');
  render();
};

/* =========================================================
   Cart (lightweight, for header badge on main site)
   ========================================================= */
window.addToCart = function(id) {
  const existing = window.state.cart.find(c => c.id === id);
  if (existing) existing.qty += 1;
  else window.state.cart.push({ id, qty: 1 });
  saveCart();
  showToast(t('toast_added_cart'));
  render();
};
window.removeFromCart = function(id) {
  window.state.cart = window.state.cart.filter(c => c.id !== id);
  saveCart();
  showToast(t('toast_removed_cart'));
  render();
};
window.changeQty = function(id, delta) {
  const item = window.state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  render();
};

/* =========================================================
   AI Tool actions (public pages)
   ========================================================= */
window.handleFileInput = function(e, tool) { processFile(e.target.files[0], tool); };
window.handleDrop = function(e, tool) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag');
  processFile(e.dataTransfer.files[0], tool);
};
window.selectHistory = function(tool, id) {
  const entry = window.state.aiHistory[tool].find(h => h.id === id);
  if (entry) { window.state.aiCurrent[tool] = entry; render(); }
};

window.showToastGlobal = showToast;

/* =========================================================
   Boot
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {
  window.state.page = routeFromHash();
  render();
});
