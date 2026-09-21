import { ic } from '../icons.js';
import { t } from '../i18n.js';

const API = 'http://localhost:8001/api/v1';

/* ── Auth state for the multi-step OTP flow ── */
// authStep: 'login' | 'register-form' | 'otp-verify' | 'forgot' | 'reset-verify'
// pendingReg: { email, full_name, role, password }

export function loginModalHTML() {
  const state    = window.state;
  if (!state.loginOpen) return '';
  const tab      = state.loginTab  || 'farmer';
  const authStep = state.authStep  || 'login';

  let content = '';

  if (authStep === 'login') {
    content = `
      <h3 style="margin-bottom:4px;">${t('login_title')}</h3>
      <p class="sub">${t('login_sub')}</p>
      <div class="modal-tabs">
        <button class="${tab==='farmer'?'active':''}" onclick="setLoginTab('farmer')">${t('login_tab1')}</button>
        <button class="${tab==='retailer'?'active':''}" onclick="setLoginTab('retailer')">${t('login_tab2')}</button>
      </div>
      <form onsubmit="submitLogin(event)">
        <div class="form-row"><label>${t('login_email')}</label>
          <input id="auth-email" type="email" required placeholder="you@example.com" autocomplete="email"></div>
        <div class="form-row"><label>${t('login_password')}</label>
          <input id="auth-password" type="password" required placeholder="••••••••" autocomplete="current-password"></div>
        <div id="auth-error" style="color:var(--danger);font-size:.82rem;margin-bottom:8px;display:none;"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px;" type="submit" id="auth-submit-btn">${t('login_btn')}</button>
      </form>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;font-size:.82rem;color:var(--ink-muted);">
        <span>Don't have an account?
          <button onclick="setAuthStep('register-form')" style="background:none;border:none;color:var(--leaf-2);cursor:pointer;font-weight:600;">Register</button>
        </span>
        <button onclick="setAuthStep('forgot')" style="background:none;border:none;color:var(--leaf-2);cursor:pointer;font-size:.82rem;">Forgot password?</button>
      </div>`;

  } else if (authStep === 'register-form') {
    content = `
      <h3 style="margin-bottom:4px;">Create your account</h3>
      <p class="sub">Join as a ${tab} — we'll send a verification code to your email.</p>
      <div class="modal-tabs">
        <button class="${tab==='farmer'?'active':''}" onclick="setLoginTab('farmer')">${t('login_tab1')}</button>
        <button class="${tab==='retailer'?'active':''}" onclick="setLoginTab('retailer')">${t('login_tab2')}</button>
      </div>
      <form onsubmit="submitRegisterSendOTP(event)">
        <div class="form-row"><label>Full Name*</label>
          <input id="reg-name" type="text" required placeholder="Your full name" autocomplete="name"></div>
        <div class="form-row"><label>${t('login_email')}*</label>
          <input id="reg-email" type="email" required placeholder="you@example.com" autocomplete="email"></div>
        <div class="form-row"><label>${t('login_password')}* <span style="font-size:.74rem;color:var(--ink-muted);">(min 8 characters)</span></label>
          <input id="reg-password" type="password" required minlength="8" placeholder="••••••••" autocomplete="new-password"></div>
        <div id="auth-error" style="color:var(--danger);font-size:.82rem;margin-bottom:8px;display:none;"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px;" type="submit" id="auth-submit-btn">
          📧 Send Verification Code
        </button>
      </form>
      <p style="font-size:.82rem;color:var(--ink-muted);text-align:center;margin-top:14px;">
        Already have an account?
        <button onclick="setAuthStep('login')" style="background:none;border:none;color:var(--leaf-2);cursor:pointer;font-weight:600;">Log in</button>
      </p>`;

  } else if (authStep === 'otp-verify') {
    const pending = window.state.pendingReg || {};
    content = `
      <h3 style="margin-bottom:4px;">✉️ Check your email</h3>
      <p class="sub" style="margin-bottom:20px;">
        We sent a 6-digit code to <strong>${pending.email || 'your email'}</strong>.<br>
        <span style="font-size:.78rem;color:var(--ink-soft);">Check your inbox and spam folder. Expires in 10 minutes.</span>
      </p>
      <form onsubmit="submitVerifyOTP(event)">
        <div class="form-row">
          <label>Verification Code*</label>
          <input id="otp-code" type="text" inputmode="numeric" pattern="[0-9]{6}" maxlength="6" required
            placeholder="Enter 6-digit code" autocomplete="one-time-code"
            style="font-size:1.4rem;letter-spacing:8px;text-align:center;font-weight:700;">
        </div>
        <div id="auth-error" style="color:var(--danger);font-size:.82rem;margin-bottom:8px;display:none;"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px;" type="submit" id="auth-submit-btn">
          ✅ Verify & Create Account
        </button>
      </form>
      <div style="text-align:center;margin-top:14px;font-size:.82rem;color:var(--ink-muted);">
        Didn't receive it?
        <button onclick="resendOTP()" style="background:none;border:none;color:var(--leaf-2);cursor:pointer;font-weight:600;" id="resend-btn">
          Resend code
        </button>
        &nbsp;·&nbsp;
        <button onclick="setAuthStep('register-form')" style="background:none;border:none;color:var(--ink-soft);cursor:pointer;font-size:.82rem;">
          Change email
        </button>
      </div>`;

  } else if (authStep === 'forgot') {
    content = `
      <h3 style="margin-bottom:4px;">🔑 Reset Password</h3>
      <p class="sub">Enter your email to receive a reset code.</p>
      <form onsubmit="submitForgotPassword(event)">
        <div class="form-row"><label>${t('login_email')}*</label>
          <input id="forgot-email" type="email" required placeholder="you@example.com"></div>
        <div id="auth-error" style="color:var(--danger);font-size:.82rem;margin-bottom:8px;display:none;"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px;" type="submit" id="auth-submit-btn">
          📧 Send Reset Code
        </button>
      </form>
      <p style="text-align:center;margin-top:14px;font-size:.82rem;">
        <button onclick="setAuthStep('login')" style="background:none;border:none;color:var(--leaf-2);cursor:pointer;font-weight:600;">← Back to login</button>
      </p>`;

  } else if (authStep === 'reset-verify') {
    const resetEmail = window.state.resetEmail || '';
    content = `
      <h3 style="margin-bottom:4px;">🔑 Set New Password</h3>
      <p class="sub">Enter the code sent to <strong>${resetEmail}</strong> and your new password.</p>
      <form onsubmit="submitResetPassword(event)">
        <div class="form-row"><label>Reset Code*</label>
          <input id="reset-otp" type="text" inputmode="numeric" maxlength="6" required
            placeholder="6-digit code" style="font-size:1.2rem;letter-spacing:6px;text-align:center;"></div>
        <div class="form-row"><label>New Password* <span style="font-size:.74rem;color:var(--ink-muted)">(min 8 chars)</span></label>
          <input id="reset-password" type="password" minlength="8" required placeholder="••••••••"></div>
        <div id="auth-error" style="color:var(--danger);font-size:.82rem;margin-bottom:8px;display:none;"></div>
        <button class="btn btn-primary" style="width:100%;margin-top:4px;" type="submit" id="auth-submit-btn">
          Set New Password
        </button>
      </form>
      <p style="text-align:center;margin-top:14px;font-size:.82rem;">
        <button onclick="setAuthStep('login')" style="background:none;border:none;color:var(--leaf-2);cursor:pointer;font-weight:600;">← Back to login</button>
      </p>`;
  }

  return `
  <div class="modal-overlay open" id="loginModal" onclick="handleModalBgClick(event)">
    <div class="modal-box" role="dialog" aria-modal="true" style="max-width:420px;">
      <button class="modal-close" onclick="closeLogin()" aria-label="Close">${ic('close')}</button>
      ${content}
    </div>
  </div>`;
}

export function searchOverlayHTML() {
  const state = window.state;
  if (!state.searchOpen) return '';
  return `
  <div class="search-overlay open" id="searchOverlay" onclick="handleSearchBgClick(event)">
    <div class="search-box">
      <form onsubmit="submitSearch(event)">
        <input id="searchInput" type="text" placeholder="${t('search_placeholder')}" autocomplete="off" aria-label="Search">
      </form>
    </div>
  </div>`;
}

/* ── API helpers ── */
export async function apiLogin(email, password) {
  const form = new URLSearchParams({ username: email, password });
  const res  = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.detail || 'Login failed'); }
  return res.json();
}

export async function apiSendOTP(email, full_name, role) {
  const res = await fetch(`${API}/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, full_name, role }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.detail || 'Failed to send OTP'); }
  return res.json();
}

export async function apiVerifyOTPRegister(email, otp_code, password, full_name, role) {
  const res = await fetch(`${API}/auth/verify-otp-register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp_code, password, full_name, role }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.detail || 'Verification failed'); }
  return res.json();
}

export async function apiForgotPassword(email) {
  const res = await fetch(`${API}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function apiResetPassword(email, otp_code, new_password) {
  const res = await fetch(`${API}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp_code, new_password }),
  });
  if (!res.ok) { const e = await res.json().catch(()=>{}); throw new Error(e?.detail || 'Reset failed'); }
  return res.json();
}
