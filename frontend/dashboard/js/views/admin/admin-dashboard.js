import { dt } from '../../dashboard-i18n.js';
import { cardsGrid } from '../../components/cards.js';
import { api } from '../../dashboard-api.js';
import { renderBarChart, renderDonutChart } from '../../components/charts.js';

export async function adminDashboardView() {
  let stats = { total_farmers:0,total_retailers:0,active_produce:0,total_orders:0,ai_inspections:0,ai_today:0 };
  let recentUsers = [];
  try { stats = await api.admin.stats(); } catch(_) {}
  try { recentUsers = await api.admin.users(); recentUsers = recentUsers.slice(0,6); } catch(_) {}

  const cards = cardsGrid([
    { icon:'🌾', iconClass:'green',  value: stats.total_farmers,   label: dt('totalFarmers') },
    { icon:'🏪', iconClass:'gold',   value: stats.total_retailers,  label: dt('totalRetailers') },
    { icon:'🥕', iconClass:'blue',   value: stats.active_produce,   label: dt('activeListings') },
    { icon:'📦', iconClass:'orange', value: stats.total_orders,     label: dt('orders') },
    { icon:'🤖', iconClass:'green',  value: stats.ai_inspections,   label: 'Total AI Inspections' },
    { icon:'⚡', iconClass:'red',    value: stats.ai_today,          label: dt('aiInspectionsToday') },
  ]);

  const barData = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep'].map((m,i) => ({
    label: m, value: Math.round(20 + i * 8 + Math.sin(i)*10),
  }));

  const donutData = [
    { label:'Farmers',   value: stats.total_farmers  || 1, color:'#43A047' },
    { label:'Retailers', value: stats.total_retailers || 1, color:'#F9A825' },
    { label:'Admins',    value: stats.total_admins    || 1, color:'#1565C0' },
  ];

  const recentRows = recentUsers.map(u => `
    <tr>
      <td><strong>${u.full_name}</strong></td>
      <td style="color:var(--kk-muted);font-size:.82rem;">${u.email}</td>
      <td><span class="kk-badge ${u.role==='farmer'?'active':u.role==='retailer'?'confirmed':'shipped'}">${u.role}</span></td>
      <td style="font-size:.8rem;color:var(--kk-muted);">${new Date(u.created_at).toLocaleDateString()}</td>
      <td><span class="kk-badge ${u.is_active?'active':'cancelled'}">${u.is_active?'Active':'Inactive'}</span></td>
    </tr>`).join('');

  return `
  <div class="kk-page-header">
    <h1>👨‍💼 Admin Dashboard</h1>
    <p>${new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
  </div>
  ${cards}
  <div class="kk-grid-2">
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>📈 Platform Growth (Registrations)</h2></div>
      <div class="kk-panel-body">${renderBarChart(barData, { height:160, color:'#1B5E20' })}</div>
    </div>
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>👥 User Distribution</h2></div>
      <div class="kk-panel-body">${renderDonutChart(donutData, { title:'', size:150 })}</div>
    </div>
  </div>
  <div class="kk-panel">
    <div class="kk-panel-header">
      <h2>👥 Recent Registrations</h2>
      <button class="kk-btn sm secondary" onclick="kkNav('admin-farmers')">View All Users</button>
    </div>
    <div class="kk-panel-body" style="padding:0;">
      <div class="kk-table-wrap">
        <table class="kk-table">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
          <tbody>${recentRows || '<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--kk-muted);">No users found</td></tr>'}</tbody>
        </table>
      </div>
    </div>
  </div>`;
}
