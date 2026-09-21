/** Reusable data table */
export function renderTable({ columns, rows, emptyMessage = 'No data found.', id = '' }) {
  if (!rows || rows.length === 0) {
    return `<div class="kk-empty"><div class="empty-icon">📋</div><h3>${emptyMessage}</h3></div>`;
  }
  return `
  <div class="kk-table-wrap">
    <table class="kk-table" ${id ? `id="${id}"` : ''}>
      <thead>
        <tr>${columns.map(c => `<th>${c.label}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(row => `
          <tr>
            ${columns.map(c => `<td>${c.render ? c.render(row) : (row[c.key] ?? '—')}</td>`).join('')}
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

export function paginationHTML(page, total, perPage, onChangeFn) {
  const pages = Math.ceil(total / perPage);
  if (pages <= 1) return '';
  const btns = Array.from({ length: pages }, (_, i) => `
    <button class="kk-btn sm ${i + 1 === page ? 'primary' : 'secondary'}"
      onclick="${onChangeFn}(${i + 1})">${i + 1}</button>`).join('');
  return `<div style="display:flex;gap:6px;margin-top:14px;justify-content:flex-end;">${btns}</div>`;
}
