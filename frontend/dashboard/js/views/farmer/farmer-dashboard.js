import { dt } from '../../dashboard-i18n.js';
import { cardsGrid, quickActions, activityRow } from '../../components/cards.js';
import { api } from '../../dashboard-api.js';
import { renderBarChart } from '../../components/charts.js';
import { gradeBadge, badge } from '../../components/badges.js';

export async function farmerDashboardView() {
  let produceList = [], aiHistory = [], orders = [];
  try { produceList = await api.produce.list({ limit: 20 }); } catch(_) {}
  try { aiHistory   = await api.ai.history(5); }               catch(_) {}
  try { orders      = await api.orders.list(); }                catch(_) {}

  const totalProduce  = produceList.length;
  const totalStock    = produceList.reduce((s, p) => s + parseFloat(p.stock_kg || 0), 0).toFixed(0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const cards = cardsGrid([
    { icon:'🌾', iconClass:'green',  value: totalProduce,   label: dt('totalProduce') },
    { icon:'⚖️', iconClass:'gold',   value: `${totalStock} kg`, label: dt('availableQty') },
    { icon:'🤝', iconClass:'blue',   value: '—',            label: dt('activeProcurement') },
    { icon:'🏪', iconClass:'orange', value: '—',            label: dt('matchedRetailers') },
    { icon:'📦', iconClass:'red',    value: pendingOrders,  label: dt('pendingOrders') },
    { icon:'🤖', iconClass:'green',  value: aiHistory.length, label: dt('recentAI') },
  ]);

  const qas = quickActions([
    { label: dt('addProduce'),      icon:'➕', action:"kkNav('farmer-add-produce')", variant:'primary' },
    { label: dt('aiInspection'),    icon:'🤖', action:"kkNav('farmer-ai-quality')",  variant:'gold' },
    { label: dt('viewAll'),         icon:'📦', action:"kkNav('farmer-orders')",       variant:'secondary' },
    { label: dt('goToMarketplace'), icon:'🛒', action:"window.open('../index.html','_blank')", variant:'secondary' },
  ]);

  // Monthly stock chart (mock from produce prices)
  const chartData = ['Jan','Feb','Mar','Apr','May','Jun'].map((m, i) => ({
    label: m,
    value: Math.round(parseInt(totalStock) * (0.7 + Math.sin(i * 0.9) * 0.3) * (0.8 + Math.random() * 0.4)),
  }));
  const chart = `
  <div class="kk-panel kk-mb">
    <div class="kk-panel-header"><h2>📊 Stock Overview (kg)</h2></div>
    <div class="kk-panel-body">
      ${renderBarChart(chartData, { height: 160, color: '#1B5E20' })}
    </div>
  </div>`;

  // Recent produce
  const recentProduce = produceList.slice(0, 5).map(p => activityRow({
    icon: '🥕',
    text: `<strong>${p.name_en}</strong> — ${p.location} — ₹${p.price}/${p.unit}`,
    time: new Date(p.listed_at).toLocaleDateString(),
    badge: { cls: p.grade === 'A' ? 'active' : p.grade === 'B' ? 'pending' : 'cancelled', label: `Grade ${p.grade}` },
  })).join('');

  // Recent AI inspections
  const recentAI = aiHistory.slice(0, 5).map(h => activityRow({
    icon: h.tool === 'disease' ? '🦠' : h.tool === 'ripeness' ? '🍅' : '⭐',
    text: `${h.tool.charAt(0).toUpperCase() + h.tool.slice(1)} inspection — confidence: ${h.confidence}%`,
    time: new Date(h.analyzed_at).toLocaleDateString(),
    badge: { cls: h.badge === 'good' ? 'active' : h.badge === 'warn' ? 'pending' : 'cancelled', label: h.grade_result || h.badge },
  })).join('');

  return `
  <div class="kk-page-header">
    <h1>${dt('welcomeBack')}, ${window.kkState.user?.name?.split(' ')[0] || ''} 👋</h1>
    <p>${new Date().toLocaleDateString('en-IN', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
  </div>
  ${cards}
  ${qas}
  <div class="kk-grid-2">
    <div>
      ${chart}
      <div class="kk-panel">
        <div class="kk-panel-header">
          <h2>🌾 ${dt('myProduce')}</h2>
          <button class="kk-btn sm secondary" onclick="kkNav('farmer-listings')">${dt('viewAll')}</button>
        </div>
        <div class="kk-panel-body">
          ${recentProduce || `<div class="kk-empty"><p>${dt('noData')}</p></div>`}
        </div>
      </div>
    </div>
    <div>
      <div class="kk-panel">
        <div class="kk-panel-header">
          <h2>🤖 ${dt('recentAI')}</h2>
          <button class="kk-btn sm secondary" onclick="kkNav('farmer-ai-history')">${dt('viewAll')}</button>
        </div>
        <div class="kk-panel-body">
          ${recentAI || `<div class="kk-empty"><p>${dt('noAnalysis')}</p></div>`}
        </div>
      </div>
    </div>
  </div>`;
}
