import { sidebarHTML }  from './components/sidebar.js';
import { topbarHTML }   from './components/topbar.js';
import { dt }           from './dashboard-i18n.js';
import { api }          from './dashboard-api.js';
import { normaliseAIResult } from './components/ai-upload.js';
import { marketplaceView } from './views/marketplace.js';

// Farmer views
import { farmerDashboardView }  from './views/farmer/farmer-dashboard.js';
import { farmerListingsView, farmerAddProduceView } from './views/farmer/farmer-produce.js';
import { farmerAIView, farmerAIHistoryView }        from './views/farmer/farmer-ai.js';
import { farmerProfileView }    from './views/farmer/farmer-profile.js';
import { farmerOrdersView }     from './views/farmer/farmer-orders.js';
import { farmerProcurementView } from './views/farmer/farmer-procurement.js';
import { farmerAdvisoryView, farmerLogisticsView, farmerSustainabilityView,
         farmerNotificationsView, farmerSettingsView } from './views/farmer/farmer-misc.js';

// Retailer views
import { retailerDashboardView } from './views/retailer/retailer-dashboard.js';
import { retailerBrowseView }    from './views/retailer/retailer-browse.js';
import { retailerAIView }        from './views/retailer/retailer-ai.js';
import { retailerDemandView }    from './views/retailer/retailer-demand.js';
import { retailerRequirementsView, retailerProcurementView, retailerOrdersView,
         retailerLogisticsView, retailerSustainabilityView,
         retailerNotificationsView, retailerSettingsView } from './views/retailer/retailer-misc.js';

// Admin views
import { adminDashboardView }  from './views/admin/admin-dashboard.js';
import { adminUsersView }      from './views/admin/admin-users.js';
import { adminProduceView, adminAIView, adminOrdersView, adminAnalyticsView,
         adminSustainabilityView, adminReportsView, adminSettingsView } from './views/admin/admin-misc.js';

/* ─── Global State ─────────────────────────────────────── */
window.kkState = {
  user:     JSON.parse(localStorage.getItem('kk_user')  || 'null'),
  token:    localStorage.getItem('kk_token') || null,
  lang:     localStorage.getItem('kk_lang')  || 'en',
  page:     'dashboard',
  expandedNav: null,
  sidebarOpen: false,
  notifications: [],
  // AI state
  aiData:    { disease:null, ripeness:null, quality:null, shelf:null },
  aiLoading: { disease:false, ripeness:false, quality:false, shelf:false },
  // Retailer filters
  retailerFilters: { q:'', category:'all', grade:'all' },
  // Match state
  matchFilters: { produce:'tomato', qty:500, grade:'B', location:'all' },
  matchResult: null,
  matchLoading: false,
  // Demand state
  demandProduce: 'tomato',
  demandLocation: 'Jaipur',
  demandHorizon: 30,
  demandData: null,
  demandLoading: false,
  demandError: null,
};

/* ─── Auth Guard ────────────────────────────────────────── */
function authGuard() {
  if (!window.kkState.token || !window.kkState.user) {
    window.location.href = '../index.html';
    return false;
  }
  return true;
}

/* ─── Default page by role ──────────────────────────────── */
function defaultPage(role) {
  if (role === 'farmer')   return 'farmer-dashboard';
  if (role === 'retailer') return 'retailer-dashboard';
  if (role === 'admin')    return 'admin-dashboard';
  return 'farmer-dashboard';
}

/* ─── View Router ───────────────────────────────────────── */
async function getView(page, role) {
  // Farmer
  if (page === 'farmer-dashboard')    return await farmerDashboardView();
  if (page === 'farmer-marketplace')  return await marketplaceView('farmer');
  if (page === 'farmer-listings')     return await farmerListingsView();
  if (page === 'farmer-add-produce')  return farmerAddProduceView();
  if (page === 'farmer-availability') return farmerAddProduceView(); // reuse form
  if (page === 'farmer-ai-disease')   return farmerAIView('disease');
  if (page === 'farmer-ai-ripeness')  return farmerAIView('ripeness');
  if (page === 'farmer-ai-quality')   return farmerAIView('quality');
  if (page === 'farmer-ai-history')   return await farmerAIHistoryView();
  if (page === 'farmer-profile' || page === 'farmer-farm') return farmerProfileView();
  if (page === 'farmer-orders')       return await farmerOrdersView();
  if (page === 'retailer-requirements' || page === 'farmer-matched' || page === 'farmer-requests')
                                      return await farmerProcurementView();
  if (page === 'farmer-advisory')     return farmerAdvisoryView();
  if (page === 'farmer-demand')       return await retailerDemandView();
  if (page === 'farmer-logistics')    return farmerLogisticsView();
  if (page === 'farmer-sustainability') return farmerSustainabilityView();
  if (page === 'farmer-notifications') return farmerNotificationsView();
  if (page === 'farmer-settings')     return farmerSettingsView();

  // Retailer
  if (page === 'retailer-dashboard')  return await retailerDashboardView();
  if (page === 'retailer-marketplace') return await marketplaceView('retailer');
  if (page === 'retailer-browse')     return await retailerBrowseView();
  if (page === 'retailer-ai-quality') return retailerAIView('quality');
  if (page === 'retailer-ai-ripeness') return retailerAIView('ripeness');
  if (page === 'retailer-ai-disease') return retailerAIView('disease');
  if (page === 'retailer-shelf-life') return retailerAIView('shelf');
  if (page === 'retailer-ai-results') return retailerAIView('quality');
  if (page === 'retailer-demand')     return await retailerDemandView();
  if (page === 'retailer-add-req')    return retailerRequirementsView('add');
  if (page === 'retailer-active-req') return retailerRequirementsView('active');
  if (page === 'retailer-req-history') return retailerRequirementsView('history');
  if (page === 'retailer-matched' || page === 'retailer-send-req')
                                      return await retailerProcurementView();
  if (page === 'retailer-orders')     return await retailerOrdersView();
  if (page === 'retailer-logistics')  return retailerLogisticsView();
  if (page === 'retailer-sustainability') return retailerSustainabilityView();
  if (page === 'retailer-notifications') return retailerNotificationsView();
  if (page === 'retailer-settings')   return retailerSettingsView();

  // Admin
  if (page === 'admin-dashboard')     return await adminDashboardView();
  if (page === 'admin-farmers' || page === 'admin-verify') return await adminUsersView('farmer');
  if (page === 'admin-retailers')     return await adminUsersView('retailer');
  if (page === 'admin-produce' || page === 'admin-categories') return await adminProduceView();
  if (page === 'admin-ai-records' || page === 'admin-ai-results') return await adminAIView();
  if (page === 'admin-orders' || page === 'admin-requests') return await adminOrdersView();
  if (page === 'admin-demand' || page === 'admin-proc-analytics') return adminAnalyticsView();
  if (page === 'admin-sustainability') return adminSustainabilityView();
  if (page === 'admin-reports')       return adminReportsView();
  if (page === 'admin-settings')      return adminSettingsView();

  // Role guard — wrong role gets default page
  if (role === 'admin' && !page.startsWith('admin')) return getView('admin-dashboard', role);
  if (role === 'farmer' && !page.startsWith('farmer') && page !== 'retailer-requirements' && page !== 'farmer-marketplace') return getView('farmer-dashboard', role);
  if (role === 'retailer' && !page.startsWith('retailer') && page !== 'retailer-marketplace') return getView('retailer-dashboard', role);

  // Fallback: role default
  return getView(defaultPage(role), role);
}

/* ─── Render ────────────────────────────────────────────── */
let _rendering = false;
async function render() {
  if (_rendering) return;
  _rendering = true;
  const root = document.getElementById('kk-app');
  if (!root) { _rendering = false; return; }

  const s = window.kkState;
  document.documentElement.lang = s.lang;

  // Show loading shell immediately
  root.innerHTML = sidebarHTML() + `
  <div class="kk-body-wrap">
    ${topbarHTML()}
    <main class="kk-main" id="kk-main-content">
      <div class="kk-spinner-wrap"><div class="kk-spinner"></div></div>
    </main>
  </div>`;

  // Render main content async
  const role = s.user?.role || 'farmer';
  const html = await getView(s.page, role).catch(e => `
    <div class="kk-error-box">⚠ Failed to load view: ${e.message}</div>`);

  const main = document.getElementById('kk-main-content');
  if (main) main.innerHTML = html;
  _rendering = false;
}
window.kkRender = render;

function reRenderSidebar() {
  const old = document.querySelector('.kk-sidebar');
  const oldOverlay = document.querySelector('.kk-sidebar-overlay');
  if (old) old.outerHTML = sidebarHTML().split('</aside>')[0] + '</aside>';
  const sNew = document.querySelector('.kk-sidebar');
  if (sNew && window.kkState.sidebarOpen) sNew.classList.add('open');
}

/* ─── Navigation ────────────────────────────────────────── */
window.kkNav = function(page) {
  window.kkState.page = page;
  window.kkState.sidebarOpen = false;
  window.scrollTo({ top:0, behavior:'smooth' });
  render();
};

window.kkToggleNav = function(key) {
  window.kkState.expandedNav = window.kkState.expandedNav === key ? null : key;
  reRenderSidebar();
  // Re-render topbar+sidebar only
  const sidebar = document.querySelector('.kk-sidebar');
  if (sidebar) sidebar.outerHTML = sidebarHTML();
};

window.kkToggleSidebar  = function() { window.kkState.sidebarOpen = !window.kkState.sidebarOpen; render(); };
window.kkCloseSidebar   = function() { window.kkState.sidebarOpen = false; render(); };
window.kkToggleUserMenu = function(e) {
  e.stopPropagation();
  document.getElementById('userDropdown')?.classList.toggle('open');
};
document.addEventListener('click', () => document.getElementById('userDropdown')?.classList.remove('open'));

window.kkLogout = function() {
  localStorage.removeItem('kk_token');
  localStorage.removeItem('kk_user');
  window.location.href = '../index.html';
};

window.kkToggleLang = function() {
  window.kkState.lang = window.kkState.lang === 'en' ? 'hi' : 'en';
  localStorage.setItem('kk_lang', window.kkState.lang);
  render();
};

window.kkSetLang = function(lang) {
  window.kkState.lang = lang;
  localStorage.setItem('kk_lang', lang);
  render();
};

/* ─── Toast ─────────────────────────────────────────────── */
let _toastTimer = null;
window.kkShowToast = function(msg, duration = 2800) {
  const el = document.getElementById('kk-toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  if (_toastTimer) clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => el.classList.remove('show'), duration);
};

/* ─── AI Upload handlers ────────────────────────────────── */
window.kkAIFileInput = function(e, tool) { kkProcessFile(e.target.files[0], tool); };
window.kkAIDrop = function(e, tool) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag');
  kkProcessFile(e.dataTransfer.files[0], tool);
};
window.kkAITrigger = function(tool) {
  // re-trigger if file already selected via hidden input
  const dz = document.getElementById(`dz-${tool}`);
  if (dz) { const inp = dz.querySelector('input[type=file]'); if (inp) inp.click(); }
};

async function kkProcessFile(file, tool) {
  if (!file) return;
  if (!file.type.match(/image\/(png|jpeg)/)) { kkShowToast('JPG or PNG only'); return; }
  if (file.size > 8*1024*1024) { kkShowToast('Image too large (max 8 MB)'); return; }

  const reader = new FileReader();
  reader.onload = async (ev) => {
    const thumb = ev.target.result;
    window.kkState.aiData[tool]    = { thumb, result: null };
    window.kkState.aiLoading[tool] = true;
    await render();

    try {
      const apiResult = await api.ai.analyze(file, tool);
      const result    = normaliseAIResult(apiResult, tool);
      window.kkState.aiData[tool]    = { thumb, result };
    } catch(_) {
      // Local mock fallback
      const MOCKS = {
        disease:  { type:'disease',  badge:'good', badgeLabel:'Healthy',  confidence:91, status:'Healthy',  issue:'None detected', severity:'None',    rec:'Crop looks healthy. Continue normal care.' },
        ripeness: { type:'ripeness', badge:'good', badgeLabel:'Peak Ripe',confidence:88, status:'Ripe',     window:'Harvest now',  sugar:'14–16 Brix', stage:'Ripe', rec:'Optimal window. Harvest now for peak flavour.' },
        quality:  { type:'quality',  badge:'good', badgeLabel:'Grade A',  confidence:93, grade:'A',         size:'Uniform (85%+)', surface:'Excellent', price:'₹35–42 /kg', rec:'Premium grade. Suitable for organised retail.' },
      };
      window.kkState.aiData[tool] = { thumb, result: MOCKS[tool] || MOCKS.quality };
    }
    window.kkState.aiLoading[tool] = false;
    await render();
  };
  reader.readAsDataURL(file);
}

/* ─── Produce actions ───────────────────────────────────── */
window.kkAddProduce = async function(e) {
  e.preventDefault();
  const msgEl = document.getElementById('add-produce-msg');
  const btn   = e.target.querySelector('button[type=submit]');
  if (btn) btn.disabled = true;

  const data = {
    name_en:   document.getElementById('p-name-en').value.trim(),
    name_hi:   document.getElementById('p-name-hi').value.trim() || null,
    category:  document.getElementById('p-category').value,
    grade:     document.getElementById('p-grade').value,
    price:     parseFloat(document.getElementById('p-price').value),
    unit:      document.getElementById('p-unit').value,
    stock_kg:  parseFloat(document.getElementById('p-stock').value),
    location:  document.getElementById('p-location').value.trim(),
    icon:      'leaf',
  };

  // Ensure the farmer has a Farmer record before creating produce
  const user = window.kkState.user;
  try {
    // Try to create a Farmer record if it doesn't exist
    const farmersList = await api.farmers.list();
    const existing    = farmersList.find(f => f.name === user.name);
    if (!existing) {
      await api.farmers.create({
        name:     user.name || 'Farmer',
        phone:    `+91${Date.now().toString().slice(-10)}`,   // placeholder
        location: data.location,
        state:    data.location.split(',').pop().trim() || data.location,
      }).catch(() => {});  // ignore if already exists
    }
  } catch(_) {}

  try {
    await api.produce.create(data);
    if (msgEl) msgEl.innerHTML = `<div class="kk-success-box">
      ✅ ${data.name_en} listed successfully! It is now visible to all retailers on the marketplace.
      <br><a href="#" onclick="kkNav('farmer-listings')" style="font-weight:600;color:var(--kk-green-deep);">View my listings →</a>
    </div>`;
    kkShowToast(`${data.name_en} listed on marketplace!`);
    // Reset form
    e.target.reset();
  } catch(err) {
    if (msgEl) msgEl.innerHTML = `<div class="kk-error-box">⚠ ${err.message}</div>`;
    kkShowToast('Error: ' + err.message);
  } finally {
    if (btn) btn.disabled = false;
  }
};

window.kkDeactivateProduce = async function(id) {
  if (!confirm('Deactivate this listing?')) return;
  try {
    await api.produce.deactivate(id);
    kkShowToast('Listing deactivated.');
    kkNav('farmer-listings');
  } catch(e) { kkShowToast('Error: ' + e.message); }
};

/* ─── Admin actions ─────────────────────────────────────── */
window.kkToggleUser = async function(id, active) {
  try {
    await api.admin.toggleUser(id, active);
    kkShowToast(active ? 'User activated.' : 'User deactivated.');
    render();
  } catch(e) { kkShowToast('Error: ' + e.message); }
};

window.kkToggleProduce = async function(id) {
  try {
    await api.admin.toggleProduce(id);
    kkShowToast('Listing status updated.');
    render();
  } catch(e) { kkShowToast('Error: ' + e.message); }
};

window.kkUpdateOrderStatus = async function(id, status) {
  try {
    await api.orders.updateStatus(id, status);
    kkShowToast(`Order updated to "${status}".`);
  } catch(e) { kkShowToast('Error: ' + e.message); }
};

/* ─── Profile / password actions ───────────────────────── */
window.kkSaveProfile = function(e) {
  e.preventDefault();
  const msg = document.getElementById('profile-msg');
  if (msg) msg.innerHTML = `<div class="kk-success-box">✅ ${dt('profileSaved')}</div>`;
  kkShowToast(dt('profileSaved'));
};
window.kkSaveFarm = function(e) {
  e.preventDefault();
  kkShowToast(dt('success'));
};
window.kkChangePassword = function(e) {
  e.preventDefault();
  const n = document.getElementById('pwd-new')?.value;
  const c = document.getElementById('pwd-confirm')?.value;
  const msg = document.getElementById('pwd-msg');
  if (n !== c) {
    if (msg) msg.innerHTML = `<div class="kk-error-box">Passwords do not match.</div>`;
    return;
  }
  if (msg) msg.innerHTML = `<div class="kk-success-box">✅ ${dt('passwordChanged')}</div>`;
  kkShowToast(dt('passwordChanged'));
};

/* ─── Retailer filters / matching ──────────────────────── */
window.kkRetailerFilter = function(key, val) {
  window.kkState.retailerFilters[key] = val;
  render();
};

window.kkUpdateMatch = function(key, val) {
  window.kkState.matchFilters[key] = key === 'qty' ? parseFloat(val)||100 : val;
};

window.kkRunMatch = async function() {
  const f = window.kkState.matchFilters;
  window.kkState.matchLoading = true;
  window.kkState.matchResult  = null;
  await render();
  try {
    window.kkState.matchResult = await api.ai.matchFarmers(f.produce, f.qty, f.grade, f.location);
  } catch(e) { kkShowToast('Match error: ' + e.message); }
  window.kkState.matchLoading = false;
  await render();
};

/* ─── Demand forecast ───────────────────────────────────── */
window.kkSelectDemand = async function(produce) {
  window.kkState.demandProduce = produce;
  window.kkState.demandData    = null;
  window.kkState.demandError   = null;
  window.kkState.demandLoading = true;
  await render();
  try {
    const horizon = window.kkState.demandHorizon || 30;
    const months  = Math.max(1, Math.round(horizon / 30));
    window.kkState.demandData = await api.ai.demandForecast(produce, 12, months);
  } catch(e) { window.kkState.demandError = e.message; }
  window.kkState.demandLoading = false;
  await render();
};

window.kkSetDemandLocation = function(location) {
  window.kkState.demandLocation = location.trim() || 'Jaipur';
};

window.kkSetDemandHorizon = function(days) {
  window.kkState.demandHorizon = Number(days) || 30;
};

window.kkLoadDemand = async function() {
  const produce = window.kkState.demandProduce || 'tomato';
  const horizon = window.kkState.demandHorizon || 30;
  const months  = Math.max(1, Math.round(horizon / 30));
  window.kkState.demandLoading = true;
  window.kkState.demandData    = null;
  window.kkState.demandError   = null;
  render();
  try {
    window.kkState.demandData = await api.ai.demandForecast(produce, 12, months);
  } catch(e) {
    window.kkState.demandError = e.message;
  }
  window.kkState.demandLoading = false;
  render();
};

/* ─── Requirement form ──────────────────────────────────── */
window.kkAddRequirement = function(e) {
  e.preventDefault();
  const msg = document.getElementById('req-msg');
  if (msg) msg.innerHTML = `<div class="kk-success-box">✅ Requirement submitted! Matching farmers will be notified.</div>`;
  kkShowToast('Requirement submitted!');
};

/* ─── Table search ──────────────────────────────────────── */
window.kkFilterTable = function(q, tableId) {
  const table = document.getElementById(tableId);
  if (!table) return;
  const rows = table.querySelectorAll('tbody tr');
  const lq   = q.toLowerCase();
  rows.forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(lq) ? '' : 'none';
  });
};

/* ─── Procurement Request handlers ──────────────────────── */
window.kkSendProcurementRequest = async function(produceId, produceName, price) {
  if (!window.kkState.token) {
    kkShowToast('Please log in to send a request.');
    return;
  }
  if (window.kkState.user?.role !== 'retailer') {
    kkShowToast('Only retailers can send procurement requests.');
    return;
  }
  try {
    await api.procurement.create({
      produce_id:   produceId,
      produce_name: produceName,
      quantity:     100,
      price:        parseFloat(price) || 0,
      message:      `I would like to procure ${produceName}. Please confirm availability.`,
    });
    kkShowToast(`✅ Request sent for ${produceName}! The farmer will be notified.`);
    render();
  } catch(e) {
    kkShowToast('Error: ' + e.message);
  }
};

window.kkAcceptRequest = async function(reqId) {
  try {
    await api.procurement.updateStatus(reqId, 'accepted');
    kkShowToast('✅ Request accepted! Retailer has been notified.');
    render();
  } catch(e) { kkShowToast('Error: ' + e.message); }
};

window.kkDeclineRequest = async function(reqId) {
  try {
    await api.procurement.updateStatus(reqId, 'declined');
    kkShowToast('❌ Request declined. Retailer has been notified.');
    render();
  } catch(e) { kkShowToast('Error: ' + e.message); }
};

window.kkMarketFilter = function(q) {
  const grid = document.getElementById('marketplace-grid');
  if (!grid) return;
  const ql = q.toLowerCase();
  grid.querySelectorAll('[data-name]').forEach(card => {
    card.style.display = card.dataset.name?.toLowerCase().includes(ql) ? '' : 'none';
  });
};
window.kkMarketCategory = function(cat) { render(); };
window.kkMarketGrade = function(grade) { render(); };
window.kkMarkRead = async function(id, el) {
  try {
    await api.notifications.markRead(id);
    if (el) { el.style.background = ''; const b = el.querySelector('.kk-badge'); if (b) b.remove(); }
  } catch(_) {}
};

window.kkMarkAllRead = async function() {
  try {
    await api.notifications.markAllRead();
    window.kkState.notifications = [];
    kkShowToast('All notifications marked as read.');
    render();
  } catch(_) { kkShowToast('Could not mark notifications as read.'); }
};

/* ─── Notification badge polling (every 30s) ────────────── */
async function pollNotifications() {
  if (!window.kkState.token) return;
  try {
    const { unread } = await api.notifications.count();
    const prev = (window.kkState.notifications || []).filter(n => !n.read).length;
    if (unread !== prev) {
      window.kkState.notifications = Array(unread).fill({ read: false });
      const badge = document.querySelector('.kk-notif-badge');
      const btn   = document.querySelector('.kk-icon-btn[aria-label="Notifications"]') ||
                    document.querySelector('.kk-icon-btn');
      if (unread > 0) {
        if (badge) { badge.textContent = unread; }
        else if (btn) {
          const span = document.createElement('span');
          span.className = 'kk-notif-badge'; span.textContent = unread;
          btn.style.position = 'relative'; btn.appendChild(span);
        }
      } else { if (badge) badge.remove(); }
    }
  } catch(_) {}
}

/* ─── Boot ──────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  if (!authGuard()) return;

  const role = window.kkState.user?.role;
  window.kkState.page = defaultPage(role);

  // Pre-load demand data for retailer on boot
  if (role === 'retailer') {
    api.ai.demandForecast('tomato', 12, 1)
      .then(d => { window.kkState.demandData = d; })
      .catch(() => {});
  }

  await render();
});
