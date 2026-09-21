import { dt } from '../dashboard-i18n.js';

const PAGE_TITLES = {
  'farmer-dashboard':'Dashboard','retailer-dashboard':'Dashboard','admin-dashboard':'Dashboard',
  'farmer-profile':'Farm Profile','farmer-farm':'Farm Details',
  'farmer-add-produce':'Add Produce','farmer-listings':'My Listings',
  'farmer-availability':'Update Availability',
  'farmer-ai-disease':'Disease Detection','farmer-ai-ripeness':'Ripeness Detection',
  'farmer-ai-quality':'Quality Grading','farmer-ai-history':'Inspection History',
  'farmer-advisory':'Advisory','farmer-procurement':'Procurement',
  'retailer-requirements':'Retailer Requirements','farmer-matched':'Matched Retailers',
  'farmer-requests':'Procurement Requests','farmer-orders':'Orders',
  'farmer-logistics':'Logistics','farmer-sustainability':'Sustainability',
  'farmer-notifications':'Notifications','farmer-settings':'Settings',
  'retailer-add-req':'Add Requirement','retailer-active-req':'Active Requirements',
  'retailer-req-history':'Requirement History','retailer-browse':'Browse Produce',
  'retailer-ai-results':'AI Quality Results','retailer-ai-quality':'Quality Grade',
  'retailer-ai-ripeness':'Ripeness Analysis','retailer-ai-disease':'Disease Status',
  'retailer-shelf-life':'Shelf-Life Prediction','retailer-demand':'Demand Forecast',
  'retailer-matched':'Matched Farmers','retailer-send-req':'Send Request',
  'retailer-orders':'Orders','retailer-logistics':'Logistics',
  'retailer-sustainability':'Sustainability','retailer-notifications':'Notifications',
  'retailer-settings':'Settings',
  'admin-farmers':'Manage Farmers','admin-retailers':'Manage Retailers',
  'admin-verify':'User Verification','admin-produce':'Produce Listings',
  'admin-categories':'Categories','admin-orders':'All Orders',
  'admin-requests':'Procurement Requests','admin-ai-records':'AI Inspection Records',
  'admin-ai-results':'Model Results','admin-demand':'Demand Trends',
  'admin-proc-analytics':'Procurement Analytics','admin-sustainability':'Sustainability',
  'admin-reports':'Reports','admin-settings':'System Settings',
  'retailer-requirements':'Retailer Requirements',
};

export function topbarHTML() {
  const state    = window.kkState;
  const user     = state.user;
  const name     = user?.name || user?.email || 'User';
  const role     = user?.role || '';
  const initials = name.slice(0,2).toUpperCase();
  const lang     = state.lang;
  const title    = PAGE_TITLES[state.page] || 'Dashboard';
  const notifCount = (state.notifications || []).filter(n => !n.read).length;

  return `
  <header class="kk-topbar">
    <button class="kk-topbar-burger" onclick="kkToggleSidebar()" aria-label="Menu">☰</button>
    <div class="kk-topbar-title">${title}</div>
    <div class="kk-topbar-actions">
      <button class="kk-lang-btn" onclick="kkToggleLang()">
        🌐 ${lang === 'en' ? 'EN' : 'हिंदी'}
      </button>
      <button class="kk-icon-btn" onclick="kkNav('${role}-notifications')" aria-label="Notifications">
        🔔
        ${notifCount > 0 ? `<span class="kk-notif-badge">${notifCount}</span>` : ''}
      </button>
      <div class="kk-topbar-user" onclick="kkToggleUserMenu(event)">
        <div class="kk-avatar" style="width:32px;height:32px;font-size:.78rem;">${initials}</div>
        <div class="user-info">
          <span class="user-name">${name.split(' ')[0]}</span>
          <span class="user-role" style="text-transform:capitalize;">${role}</span>
        </div>
        ▾
        <div class="kk-user-dropdown" id="userDropdown">
          <a onclick="kkNav('${role}-profile')">👤 &nbsp;${dt('profile')}</a>
          <a onclick="kkNav('${role}-settings')">⚙️ &nbsp;${dt('settings')}</a>
          <div class="divider"></div>
          <button class="logout-btn" onclick="kkLogout()">🚪 &nbsp;${dt('logout')}</button>
        </div>
      </div>
    </div>
  </header>`;
}
