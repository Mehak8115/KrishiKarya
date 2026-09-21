import { dt } from '../../dashboard-i18n.js';

export function farmerProfileView() {
  const user = window.kkState.user;
  return `
  <div class="kk-page-header">
    <h1>👤 ${dt('farmProfile')}</h1>
    <p>Your farm and personal details.</p>
  </div>
  <div class="kk-grid-2" style="align-items:start;">
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>Personal Information</h2></div>
      <div class="kk-panel-body">
        <div id="profile-msg"></div>
        <form onsubmit="kkSaveProfile(event)">
          <div class="kk-form-row">
            <label>${dt('fullName')}*</label>
            <input class="kk-input" id="pf-name" value="${user?.name || ''}" required>
          </div>
          <div class="kk-form-row">
            <label>${dt('email')}*</label>
            <input class="kk-input" id="pf-email" type="email" value="${user?.email || ''}" required>
          </div>
          <div class="kk-form-row">
            <label>${dt('phone')}</label>
            <input class="kk-input" id="pf-phone" type="tel" placeholder="+91 98765 43210">
          </div>
          <button class="kk-btn primary" type="submit">💾 ${dt('save')}</button>
        </form>
      </div>
    </div>
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>🌾 ${dt('farmDetails')}</h2></div>
      <div class="kk-panel-body">
        <form onsubmit="kkSaveFarm(event)">
          <div class="kk-form-row">
            <label>${dt('farmName')}</label>
            <input class="kk-input" id="farm-name" placeholder="e.g. Krishna Farms">
          </div>
          <div class="kk-form-row">
            <label>${dt('location')}</label>
            <input class="kk-input" id="farm-loc" placeholder="Village, District">
          </div>
          <div class="kk-form-row">
            <label>${dt('state')}</label>
            <input class="kk-input" id="farm-state" placeholder="e.g. Maharashtra">
          </div>
          <div class="kk-form-row">
            <label>${dt('soilType')}</label>
            <select class="kk-select" id="farm-soil">
              <option>Black Cotton Soil</option>
              <option>Red Soil</option>
              <option>Alluvial Soil</option>
              <option>Sandy Loam</option>
              <option>Clay Soil</option>
            </select>
          </div>
          <div class="kk-form-row">
            <label>${dt('farmSize')}</label>
            <input class="kk-input" id="farm-size" type="number" min="0" step="0.1" placeholder="e.g. 5.5">
          </div>
          <button class="kk-btn primary" type="submit">💾 ${dt('save')}</button>
        </form>
      </div>
    </div>
  </div>
  <div class="kk-panel kk-mt" style="max-width:480px;">
    <div class="kk-panel-header"><h2>🔒 Change Password</h2></div>
    <div class="kk-panel-body">
      <div id="pwd-msg"></div>
      <form onsubmit="kkChangePassword(event)">
        <div class="kk-form-row">
          <label>Current Password</label>
          <input class="kk-input" id="pwd-current" type="password" required>
        </div>
        <div class="kk-form-row">
          <label>${dt('newPassword')}</label>
          <input class="kk-input" id="pwd-new" type="password" minlength="8" required>
        </div>
        <div class="kk-form-row">
          <label>${dt('confirmPassword')}</label>
          <input class="kk-input" id="pwd-confirm" type="password" required>
        </div>
        <button class="kk-btn primary" type="submit">🔑 ${dt('resetPassword')}</button>
      </form>
    </div>
  </div>`;
}
