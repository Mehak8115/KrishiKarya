export function badge(status) {
  const map = {
    pending:   'pending',   active:    'active',
    confirmed: 'confirmed', shipped:   'shipped',
    delivered: 'delivered', cancelled: 'cancelled',
    A:         'grade-a',   B:         'grade-b',  C: 'grade-c',
    good:      'good',      warn:      'warn',      bad: 'bad',
    farmer:    'active',    retailer:  'confirmed', admin: 'shipped',
    true:      'active',    false:     'cancelled',
  };
  const cls = map[status] || 'pending';
  return `<span class="kk-badge ${cls}">${status}</span>`;
}

export function gradeBadge(g) {
  const colors = { A:'#2E7D32', B:'#E65100', C:'#C62828' };
  const bgs    = { A:'#E8F5E9', B:'#FFF3E0', C:'#FFEBEE' };
  return `<span class="kk-badge" style="background:${bgs[g]||'#f5f5f5'};color:${colors[g]||'#555'}">Grade ${g}</span>`;
}

export function statusDot(active) {
  return `<span style="display:inline-flex;align-items:center;gap:5px;">
    <span style="width:8px;height:8px;border-radius:50%;background:${active ? 'var(--kk-success)' : 'var(--kk-danger)'};"></span>
    ${active ? 'Active' : 'Inactive'}
  </span>`;
}

export function toolBadge(tool) {
  const map = { disease:'#C62828', ripeness:'#2E7D32', quality:'#1565C0' };
  const bg  = { disease:'#FFEBEE', ripeness:'#E8F5E9', quality:'#E3F2FD' };
  return `<span class="kk-badge" style="background:${bg[tool]||'#f5f5f5'};color:${map[tool]||'#555'}">${tool}</span>`;
}
