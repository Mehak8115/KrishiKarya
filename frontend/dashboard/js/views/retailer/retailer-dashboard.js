import { dt } from '../../dashboard-i18n.js';
import { cardsGrid, quickActions, activityRow } from '../../components/cards.js';
import { api } from '../../dashboard-api.js';
import { renderBarChart } from '../../components/charts.js';

export async function retailerDashboardView() {
  let orders = [], aiHistory = [];
  try { orders     = await api.orders.list(); }    catch(_) {}
  try { aiHistory  = await api.ai.history(5); }    catch(_) {}

  const pending   = orders.filter(o => o.status === 'pending').length;
  const confirmed = orders.filter(o => o.status === 'confirmed').length;

  const cards = cardsGrid([
    { icon:'📋', iconClass:'green',  value:'—',      label: dt('activeDemand') },
    { icon:'🌾', iconClass:'gold',   value:'—',      label: dt('matchedFarmers') },
    { icon:'📦', iconClass:'blue',   value: pending, label: dt('pendingOrders') },
    { icon:'📈', iconClass:'orange', value:'—',      label: dt('expectedDemand') },
    { icon:'🚚', iconClass:'green',  value:'—',      label: dt('upcomingDeliveries') },
    { icon:'🤝', iconClass:'red',    value: confirmed, label: dt('procurementStatus') },
  ]);

  const qas = quickActions([
    { label: dt('browseProduce'),   icon:'🔍', action:"kkNav('retailer-browse')",  variant:'primary' },
    { label: dt('addRequirement'),  icon:'➕', action:"kkNav('retailer-add-req')", variant:'gold' },
    { label: dt('demandForecast'),  icon:'📊', action:"kkNav('retailer-demand')",  variant:'secondary' },
    { label: dt('matchedFarmersList'), icon:'🌾', action:"kkNav('retailer-matched')", variant:'secondary' },
  ]);

  const chartData = ['Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => ({
    label: m, value: Math.round(100 + i * 12 + Math.sin(i) * 30),
  }));

  const recentOrders = orders.slice(0,5).map(o => activityRow({
    icon: '📦',
    text: `Order <strong>#${o.id.slice(-8)}</strong> — ₹${parseFloat(o.total_amount).toFixed(0)}`,
    time: new Date(o.created_at).toLocaleDateString(),
    badge: { cls: o.status === 'delivered' ? 'active' : o.status === 'cancelled' ? 'cancelled' : 'pending', label: o.status },
  })).join('');

  return `
  <div class="kk-page-header">
    <h1>${dt('welcomeBack')}, ${window.kkState.user?.name?.split(' ')[0] || ''} 👋</h1>
    <p>${new Date().toLocaleDateString('en-IN', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
  </div>
  ${cards}
  ${qas}
  <div class="kk-grid-2">
    <div class="kk-panel">
      <div class="kk-panel-header"><h2>📈 Procurement Activity</h2></div>
      <div class="kk-panel-body">
        ${renderBarChart(chartData, { height:160, color:'#43A047' })}
      </div>
    </div>
    <div class="kk-panel">
      <div class="kk-panel-header">
        <h2>📦 Recent Orders</h2>
        <button class="kk-btn sm secondary" onclick="kkNav('retailer-orders')">${dt('viewAll')}</button>
      </div>
      <div class="kk-panel-body">
        ${recentOrders || `<div class="kk-empty"><p>No orders yet.</p></div>`}
      </div>
    </div>
  </div>`;
}
