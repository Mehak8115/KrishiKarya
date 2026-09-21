// ============================================================
// Dashboard Toast Helper
// ============================================================

export function showDashToast(message, type = 'success') {
  const toast = document.getElementById('kk-toast');
  if (!toast) return;
  const item = document.createElement('div');
  item.className = `kk-toast-item ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  item.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toast.appendChild(item);
  setTimeout(() => { item.style.opacity = '0'; item.style.transform = 'translateX(20px)'; item.style.transition = '0.3s'; setTimeout(() => item.remove(), 300); }, 3500);
}
