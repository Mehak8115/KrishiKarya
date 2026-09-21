// ============================================================
// Farmer Notifications View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { showDashToast } from '../../components/toast-helper.js';

const MOCK_NOTIFICATIONS = [
  { id: '1', type: 'order', icon: '📦', title: 'New order received', text: 'GreenBasket placed an order for 200 kg of Tomato.', time: '2 hours ago', read: false },
  { id: '2', type: 'ai', icon: '🔬', title: 'AI inspection complete', text: 'Your tomato crop quality graded as Grade A (92% confidence).', time: '5 hours ago', read: false },
  { id: '3', type: 'match', icon: '🤝', title: 'New retailer match', text: 'FreshMart Ltd. is looking for Grade A Tomato — 500 kg.', time: '1 day ago', read: true },
  { id: '4', type: 'order', icon: '🚛', title: 'Order shipped', text: 'Order #SHP001 has been picked up by the courier.', time: '1 day ago', read: true },
  { id: '5', type: 'ai', icon: '⚠️', title: 'Disease alert', text: 'Potential early blight detected in your wheat field. Take action soon.', time: '2 days ago', read: true },
  { id: '6', type: 'order', icon: '✅', title: 'Order delivered', text: 'Order #ORD003 was successfully delivered to Delhi.', time: '3 days ago', read: true },
];

export async function renderFarmerNotifications(container) {
  let notifications = [...MOCK_NOTIFICATIONS];

  function renderNotifications() {
    const unread = notifications.filter(n => !n.read).length;
    container.innerHTML = `
      <div class="kk-page-header">
        <div>
          <h1>🔔 ${t('nav_notifications')}${unread > 0 ? ` <span class="kk-notif-badge" style="position:relative;top:0;right:0;margin-left:8px">${unread}</span>` : ''}</h1>
          <p>Stay updated on orders, AI results, and matches</p>
        </div>
        <div class="kk-page-header-actions">
          <button class="kk-btn kk-btn-secondary kk-btn-sm" onclick="markAllRead()">${t('btn_mark_all_read')}</button>
        </div>
      </div>
      <div class="kk-section">
        <div class="kk-section-header">
          <span class="kk-section-title">All Notifications</span>
        </div>
        ${notifications.length === 0
          ? `<div class="kk-empty"><div class="kk-empty-icon">🎉</div><div class="kk-empty-title">${t('empty_notifications')}</div></div>`
          : notifications.map(n => `
            <div class="kk-notif-item ${n.read ? '' : 'unread'}" id="notif-${n.id}" onclick="markNotifRead('${n.id}')">
              <div class="kk-notif-icon" style="background:${n.read ? 'var(--kk-cream)' : 'var(--kk-success-bg)'}">${n.icon}</div>
              <div class="kk-notif-body">
                <div class="kk-notif-title">${n.title}</div>
                <div class="kk-notif-text">${n.text}</div>
                <div class="kk-notif-time">🕐 ${n.time}</div>
              </div>
              ${!n.read ? `<span class="kk-badge kk-badge-info" style="font-size:.68rem;padding:2px 6px">New</span>` : ''}
            </div>`).join('')}
      </div>`;

    window.markNotifRead = function(id) {
      const notif = notifications.find(n => n.id === id);
      if (notif) { notif.read = true; renderNotifications(); }
    };

    window.markAllRead = function() {
      notifications.forEach(n => n.read = true);
      renderNotifications();
      showDashToast(t('btn_mark_all_read') + ' ✓', 'success');
    };
  }

  renderNotifications();
}
