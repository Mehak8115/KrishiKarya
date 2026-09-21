// ============================================================
// Retailer Requirements View
// ============================================================
import { t } from '../../dashboard-i18n.js';
import { renderTable } from '../../components/table.js';
import { badge, gradeBadge } from '../../components/badges.js';
import { showDashToast } from '../../components/toast-helper.js';

let requirements = [
  { id: '1', produce: 'Tomato', quantity: 500, grade: 'A', delivery_date: '2025-08-20', location: 'Mumbai', status: 'active' },
  { id: '2', produce: 'Onion', quantity: 300, grade: 'B', delivery_date: '2025-08-25', location: 'Delhi', status: 'active' },
  { id: '3', produce: 'Potato', quantity: 1000, grade: 'B', delivery_date: '2025-09-05', location: 'Pune', status: 'inactive' },
];

export async function renderRetailerRequirements(container) {
  container.innerHTML = `
    <div class="kk-page-header">
      <div><h1>📋 ${t('nav_requirements')}</h1><p>Manage your produce requirements</p></div>
      <div class="kk-page-header-actions">
        <button class="kk-btn kk-btn-primary" onclick="showAddReqModal()">${t('btn_add_req')}</button>
      </div>
    </div>
    <div class="kk-tabs">
      <button class="kk-tab-btn active" onclick="switchReqTab('active', this)">Active</button>
      <button class="kk-tab-btn" onclick="switchReqTab('all', this)">All Requirements</button>
      <button class="kk-tab-btn" onclick="switchReqTab('inactive', this)">Closed</button>
    </div>
    <div class="kk-section">
      <div id="req-table"><div class="kk-loading-center"><div class="kk-spinner"></div></div></div>
    </div>
    <div id="req-modal-slot"></div>`;

  window.showAddReqModal = showAddReqModal;
  window.switchReqTab = switchReqTab;
  window.deleteReq = deleteReq;
  window.toggleReqStatus = toggleReqStatus;

  renderReqTable('active');
}

function switchReqTab(filter, btn) {
  document.querySelectorAll('.kk-tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderReqTable(filter);
}

function renderReqTable(filter) {
  const filtered = filter === 'all' ? requirements : requirements.filter(r => r.status === filter);
  renderTable(document.getElementById('req-table'), [
    { key: 'produce', label: t('th_produce') },
    { key: 'quantity', label: t('th_quantity'), render: v => `${v} kg` },
    { key: 'grade', label: t('th_grade'), render: v => gradeBadge(v) },
    { key: 'location', label: t('th_location') },
    { key: 'delivery_date', label: 'Delivery Date' },
    { key: 'status', label: t('th_status'), render: v => badge(v) },
    { key: 'id', label: t('th_actions'), sortable: false, render: (id, row) => `
      <div style="display:flex;gap:6px">
        <button class="kk-btn kk-btn-sm kk-btn-primary" onclick="kkNavigate('retailer-procurement')">${t('btn_send_request')}</button>
        <button class="kk-btn kk-btn-sm kk-btn-secondary" onclick="toggleReqStatus('${id}')">${row.status === 'active' ? 'Close' : 'Reopen'}</button>
        <button class="kk-btn kk-btn-sm kk-btn-danger-outline" onclick="deleteReq('${id}')">${t('btn_delete')}</button>
      </div>` },
  ], filtered, { emptyMessage: t('empty_results') });
}

function showAddReqModal() {
  document.getElementById('req-modal-slot').innerHTML = `
    <div class="kk-modal-overlay" id="add-req-modal" onclick="if(event.target===this)this.remove()">
      <div class="kk-modal">
        <div class="kk-modal-header">
          <span class="kk-modal-title">${t('btn_add_req')}</span>
          <button class="kk-modal-close" onclick="document.getElementById('add-req-modal')?.remove()">✕</button>
        </div>
        <div class="kk-modal-body">
          <form id="add-req-form">
            <div class="kk-form-grid">
              <div class="kk-form-row">
                <label class="kk-label">${t('label_produce_name')} <span class="kk-required">*</span></label>
                <input class="kk-input" id="ar-produce" type="text" required placeholder="${t('ph_produce_name')}">
              </div>
              <div class="kk-form-row">
                <label class="kk-label">${t('label_quantity')} <span class="kk-required">*</span></label>
                <input class="kk-input" id="ar-qty" type="number" required min="1" placeholder="500">
              </div>
              <div class="kk-form-row">
                <label class="kk-label">${t('label_grade')}</label>
                <select class="kk-select" id="ar-grade">
                  <option value="A">Grade A</option>
                  <option value="B" selected>Grade B</option>
                  <option value="C">Grade C</option>
                </select>
              </div>
              <div class="kk-form-row">
                <label class="kk-label">${t('label_delivery_date')}</label>
                <input class="kk-input" id="ar-date" type="date">
              </div>
              <div class="kk-form-row span-2">
                <label class="kk-label">${t('label_location')} <span class="kk-required">*</span></label>
                <input class="kk-input" id="ar-location" type="text" required placeholder="${t('ph_location')}">
              </div>
            </div>
          </form>
        </div>
        <div class="kk-modal-footer">
          <button class="kk-btn kk-btn-secondary" onclick="document.getElementById('add-req-modal')?.remove()">${t('btn_cancel')}</button>
          <button class="kk-btn kk-btn-primary" onclick="submitAddReq()">${t('btn_add')}</button>
        </div>
      </div>
    </div>`;

  window.submitAddReq = function() {
    const produce = document.getElementById('ar-produce').value.trim();
    const qty = parseInt(document.getElementById('ar-qty').value);
    const grade = document.getElementById('ar-grade').value;
    const date = document.getElementById('ar-date').value;
    const location = document.getElementById('ar-location').value.trim();
    if (!produce || !qty || !location) return;
    requirements.unshift({ id: Date.now().toString(), produce, quantity: qty, grade, delivery_date: date || '—', location, status: 'active' });
    document.getElementById('add-req-modal')?.remove();
    renderReqTable('active');
    showDashToast(t('success_req_added'), 'success');
  };
}

function deleteReq(id) {
  if (!confirm(t('confirm_delete'))) return;
  requirements = requirements.filter(r => r.id !== id);
  renderReqTable('all');
  showDashToast('Requirement removed.', 'success');
}

function toggleReqStatus(id) {
  const req = requirements.find(r => r.id === id);
  if (req) { req.status = req.status === 'active' ? 'inactive' : 'active'; renderReqTable('all'); }
}
