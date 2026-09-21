// ============================================================
// Farmer Settings View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { showDashToast } from '../../components/toast-helper.js';

export async function renderFarmerSettings(container) {
  const lang = window.kkState?.lang || 'en';

  container.innerHTML = `
    <div class="kk-page-header">
      <div><h1>⚙️ ${t('nav_settings')}</h1><p>Manage your account preferences</p></div>
    </div>
    <div class="kk-grid-2">
      <div>
        <div class="kk-section" style="margin-bottom:16px">
          <div class="kk-section-header"><span class="kk-section-title">Language</span></div>
          <div class="kk-section-body">
            <p style="font-size:.87rem;color:var(--kk-muted);margin-bottom:16px">Choose your preferred language for the dashboard.</p>
            <div style="display:flex;gap:10px">
              <button class="kk-btn ${lang==='en' ? 'kk-btn-primary' : 'kk-btn-secondary'}" onclick="setLang('en')">🇬🇧 English</button>
              <button class="kk-btn ${lang==='hi' ? 'kk-btn-primary' : 'kk-btn-secondary'}" onclick="setLang('hi')">🇮🇳 हिंदी</button>
            </div>
          </div>
        </div>
        <div class="kk-section">
          <div class="kk-section-header"><span class="kk-section-title">Notification Preferences</span></div>
          <div class="kk-section-body">
            ${[
              { id: 'notif-orders', label: 'New order notifications', checked: true },
              { id: 'notif-ai', label: 'AI inspection results', checked: true },
              { id: 'notif-matches', label: 'Retailer match alerts', checked: true },
              { id: 'notif-delivery', label: 'Delivery status updates', checked: false },
              { id: 'notif-tips', label: 'Farming tips and advisory', checked: false },
            ].map(item => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--kk-border)">
                <label for="${item.id}" style="font-size:.87rem;cursor:pointer">${item.label}</label>
                <input type="checkbox" id="${item.id}" ${item.checked ? 'checked' : ''} style="width:18px;height:18px;cursor:pointer;accent-color:var(--kk-green-fresh)">
              </div>`).join('')}
            <button class="kk-btn kk-btn-primary kk-btn-sm" style="margin-top:16px" onclick="saveNotifPrefs()">${t('btn_save')}</button>
          </div>
        </div>
      </div>
      <div>
        <div class="kk-section" style="margin-bottom:16px">
          <div class="kk-section-header"><span class="kk-section-title">Security</span></div>
          <div class="kk-section-body">
            <form id="pw-settings-form">
              <div class="kk-form-row">
                <label class="kk-label">${t('label_old_password')}</label>
                <input class="kk-input" type="password" id="s-pw-old" required>
              </div>
              <div class="kk-form-row">
                <label class="kk-label">${t('label_new_password')}</label>
                <input class="kk-input" type="password" id="s-pw-new" required minlength="8">
              </div>
              <div class="kk-form-row">
                <label class="kk-label">${t('label_confirm_password')}</label>
                <input class="kk-input" type="password" id="s-pw-confirm" required>
              </div>
              <div id="s-pw-error" class="kk-form-error" style="display:none"></div>
              <button type="submit" class="kk-btn kk-btn-primary">${t('btn_change_password')}</button>
            </form>
          </div>
        </div>
        <div class="kk-section">
          <div class="kk-section-header"><span class="kk-section-title">Account</span></div>
          <div class="kk-section-body">
            <p style="font-size:.87rem;color:var(--kk-muted);margin-bottom:16px">
              Logged in as <strong>${window.kkState?.user?.name || window.kkState?.user?.full_name || 'Farmer'}</strong>
            </p>
            <button class="kk-btn kk-btn-danger-outline" onclick="kkLogout()">Logout from Dashboard</button>
          </div>
        </div>
      </div>
    </div>`;

  window.setLang = function(lang) {
    window.kkState.lang = lang;
    localStorage.setItem('kk_lang', lang);
    document.body.classList.toggle('lang-hi', lang === 'hi');
    window.kkRender();
  };

  window.saveNotifPrefs = function() {
    showDashToast(t('success_save'), 'success');
  };

  document.getElementById('pw-settings-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const nw = document.getElementById('s-pw-new').value;
    const cf = document.getElementById('s-pw-confirm').value;
    const err = document.getElementById('s-pw-error');
    if (nw !== cf) { err.style.display = 'block'; err.textContent = 'Passwords do not match.'; return; }
    err.style.display = 'none';
    showDashToast(t('success_password_changed'), 'success');
    e.target.reset();
  });
}
