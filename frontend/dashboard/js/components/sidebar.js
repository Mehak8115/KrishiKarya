import { dt } from '../dashboard-i18n.js';

const FARMER_NAV = [
  { key:'farmer-dashboard', icon:'🏠', label:'dashboard' },
  { key:'my-farm', icon:'🌾', label:'myFarm', children:[
    { key:'farmer-profile',  label:'farmProfile' },
    { key:'farmer-farm',     label:'farmDetails' },
  ]},
  { key:'my-produce', icon:'🥕', label:'myProduce', children:[
    { key:'farmer-add-produce',  label:'addProduce' },
    { key:'farmer-listings',     label:'myListings' },
    { key:'farmer-availability', label:'updateAvailability' },
  ]},
  { key:'farmer-marketplace', icon:'🛒', label:'marketplace' },
  { key:'ai-inspection', icon:'🤖', label:'aiInspection', children:[
    { key:'farmer-ai-disease',   label:'diseaseDetection' },
    { key:'farmer-ai-ripeness',  label:'ripenessDetection' },
    { key:'farmer-ai-quality',   label:'qualityGrading' },
    { key:'farmer-ai-history',   label:'inspectionHistory' },
  ]},
  { key:'farmer-advisory',     icon:'🌤', label:'advisory' },
  { key:'farmer-procurement',  icon:'🤝', label:'procurement', children:[
    { key:'retailer-requirements', label:'retailerRequirements' },
    { key:'farmer-matched',        label:'matchedRetailers' },
    { key:'farmer-requests',       label:'procurementRequests' },
  ]},
  { key:'farmer-orders',       icon:'📦', label:'orders' },
  { key:'farmer-logistics',    icon:'🚚', label:'logistics' },
  { key:'farmer-sustainability', icon:'♻️', label:'sustainability' },
  { key:'farmer-notifications', icon:'🔔', label:'notifications' },
  { key:'farmer-settings',     icon:'⚙️', label:'settings' },
];

const FARMER_DEMAND_NAV = { key:'farmer-demand', icon:'📊', label:'demandForecast' };
FARMER_NAV.push(FARMER_DEMAND_NAV);

const RETAILER_NAV = [
  { key:'retailer-dashboard',  icon:'🏠', label:'dashboard' },
  { key:'retailer-marketplace', icon:'🛒', label:'marketplace' },
  { key:'my-requirements', icon:'📋', label:'myRequirements', children:[
    { key:'retailer-add-req',     label:'addRequirement' },
    { key:'retailer-active-req',  label:'activeRequirements' },
    { key:'retailer-req-history', label:'requirementHistory' },
  ]},
  { key:'find-produce', icon:'🔍', label:'findProduce', children:[
    { key:'retailer-browse',    label:'browseProduce' },
    { key:'retailer-ai-results', label:'aiQualityResults' },
  ]},
  { key:'retailer-ai', icon:'🤖', label:'aiInsights', children:[
    { key:'retailer-ai-quality',  label:'qualityGrade' },
    { key:'retailer-ai-ripeness', label:'ripeness' },
    { key:'retailer-ai-disease',  label:'disease' },
    { key:'retailer-shelf-life',  label:'shelfLife' },
  ]},
  { key:'retailer-demand',      icon:'📊', label:'demandForecast' },
  { key:'retailer-procurement', icon:'🤝', label:'procurement', children:[
    { key:'retailer-matched',  label:'matchedFarmersList' },
    { key:'retailer-send-req', label:'sendRequest' },
    { key:'retailer-orders',   label:'orders' },
  ]},
  { key:'retailer-logistics',      icon:'🚚', label:'logistics' },
  { key:'retailer-sustainability', icon:'♻️', label:'sustainability' },
  { key:'retailer-notifications',  icon:'🔔', label:'notifications' },
  { key:'retailer-settings',       icon:'⚙️', label:'settings' },
];

const ADMIN_NAV = [
  { key:'admin-dashboard',   icon:'🏠', label:'dashboard' },
  { key:'user-management', icon:'👥', label:'userManagement', children:[
    { key:'admin-farmers',    label:'farmers' },
    { key:'admin-retailers',  label:'retailers' },
    { key:'admin-verify',     label:'userVerification' },
  ]},
  { key:'produce-management', icon:'🥕', label:'produceManagement', children:[
    { key:'admin-produce',    label:'produceListings' },
    { key:'admin-categories', label:'categories' },
  ]},
  { key:'procurement-mgmt', icon:'🤝', label:'procurementMgmt', children:[
    { key:'admin-orders',   label:'allOrders' },
    { key:'admin-requests', label:'requests' },
  ]},
  { key:'ai-management', icon:'🤖', label:'aiManagement', children:[
    { key:'admin-ai-records',  label:'aiRecords' },
    { key:'admin-ai-results',  label:'modelResults' },
  ]},
  { key:'admin-analytics', icon:'📊', label:'analytics', children:[
    { key:'admin-demand',    label:'demandTrends' },
    { key:'admin-proc-analytics', label:'procurementAnalytics' },
  ]},
  { key:'admin-sustainability', icon:'♻️', label:'sustainability' },
  { key:'admin-reports',   icon:'📄', label:'reports' },
  { key:'admin-settings',  icon:'⚙️', label:'systemSettings' },
];

function navForRole(role) {
  if (role === 'farmer')   return FARMER_NAV;
  if (role === 'retailer') return RETAILER_NAV;
  if (role === 'admin')    return ADMIN_NAV;
  return [];
}

function roleBadgeLabel(role) {
  if (role === 'farmer')   return '🌾 ' + dt('farmer');
  if (role === 'retailer') return '🏪 ' + dt('retailer');
  if (role === 'admin')    return '👨‍💼 ' + dt('admin');
  return role;
}

export function sidebarHTML() {
  const state  = window.kkState;
  const user   = state.user;
  const role   = user?.role || 'farmer';
  const page   = state.page;
  const nav    = navForRole(role);
  const name   = user?.name || user?.email || 'User';
  const initials = name.slice(0,2).toUpperCase();

  function navItems(items) {
    return items.map(item => {
      const isActive = page === item.key;
      const hasChildren = item.children?.length > 0;
      const isParentActive = hasChildren && item.children.some(c => c.key === page);
      const isExpanded = isParentActive || state.expandedNav === item.key;

      if (hasChildren) {
        return `
        <div class="kk-nav-item ${isParentActive ? 'active' : ''} ${isExpanded ? 'expanded' : ''}"
             onclick="kkToggleNav('${item.key}')">
          <span>${item.icon}</span>
          <span>${dt(item.label)}</span>
          <span class="nav-arrow">›</span>
        </div>
        <div class="kk-nav-sub ${isExpanded ? 'open' : ''}">
          ${item.children.map(c => `
            <div class="kk-nav-sub-item ${page === c.key ? 'active' : ''}"
                 onclick="kkNav('${c.key}')">
              ${dt(c.label)}
            </div>`).join('')}
        </div>`;
      }

      return `
      <div class="kk-nav-item ${isActive ? 'active' : ''}"
           onclick="kkNav('${item.key}')">
        <span>${item.icon}</span>
        <span>${dt(item.label)}</span>
      </div>`;
    }).join('');
  }

  return `
  <div class="kk-sidebar-overlay ${state.sidebarOpen && window.innerWidth < 768 ? 'open' : ''}"
       onclick="kkCloseSidebar()"></div>
  <aside class="kk-sidebar ${state.sidebarOpen || window.innerWidth >= 768 ? '' : ''}">
    <div class="kk-sidebar-brand">
      <div class="brand-icon">🌾</div>
      <div>
        <div class="brand-name">Krishi Karya</div>
        <div class="brand-tag">Agricultural Platform</div>
      </div>
    </div>
    <div class="kk-sidebar-user">
      <div class="kk-avatar">${initials}</div>
      <div style="overflow:hidden;">
        <div class="user-name">${name}</div>
        <span class="kk-role-badge ${role}">${roleBadgeLabel(role)}</span>
      </div>
    </div>
    <nav class="kk-nav">
      ${navItems(nav)}
    </nav>
    <div class="kk-sidebar-footer">
      <button onclick="kkNav('${role}-settings')">⚙️ &nbsp;${dt('settings')}</button>
      <button onclick="kkLogout()" style="color:rgba(255,120,120,.8);">🚪 &nbsp;${dt('logout')}</button>
    </div>
  </aside>`;
}
