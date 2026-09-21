import { ic } from '../icons.js';
import { t } from '../i18n.js';
import { PRODUCE } from '../data.js';

export function cartView() {
  const lang = window.state.lang;
  const items = window.state.cart.map(c => {
    const p = PRODUCE.find(pp => pp.id === c.id);
    return p ? { ...c, p } : null;
  }).filter(Boolean);

  if (items.length === 0) {
    return `
    <div class="container">
      <div class="page-head"><h1>${t('cart_h')}</h1><p>${t('cart_p')}</p></div>
      <div class="empty-state" style="max-width:640px;">
        <p style="margin-bottom:20px;">${t('cart_empty_h')}</p>
        <button class="btn btn-primary" onclick="go('marketplace')">${t('cart_empty_btn')}</button>
      </div>
    </div>`;
  }

  const subtotal = items.reduce((s, it) => s + it.p.price * it.qty, 0);
  const delivery = 49;
  const taxes    = Math.round(subtotal * 0.02);
  const total    = subtotal + delivery + taxes;

  return `
  <div class="container">
    <div class="page-head"><h1>${t('cart_h')}</h1><p>${t('cart_p')}</p></div>
    <div class="cart-layout">
      <div class="scroll-x">
        <table class="cart-table">
          <thead><tr>
            <th>${t('cart_item')}</th>
            <th>${t('cart_price')}</th>
            <th>${t('cart_qty')}</th>
            <th>${t('cart_subtotal')}</th>
            <th></th>
          </tr></thead>
          <tbody>
          ${items.map(it => `
            <tr>
              <td>
                <div class="cart-item-name">
                  <div class="thumb" style="color:var(--leaf-2)">${ic(it.p.icon)}</div>
                  <div>
                    <div style="font-weight:600;">${it.p.name[lang]}</div>
                    <div style="font-size:.8rem;color:var(--ink-muted);">${it.p.location}</div>
                  </div>
                </div>
              </td>
              <td>₹${it.p.price} ${t(it.p.unit)}</td>
              <td>
                <div class="qty-stepper">
                  <button onclick="changeQty('${it.p.id}',-1)" aria-label="Decrease">−</button>
                  <span>${it.qty}</span>
                  <button onclick="changeQty('${it.p.id}',1)" aria-label="Increase">+</button>
                </div>
              </td>
              <td>₹${it.p.price * it.qty}</td>
              <td><button class="remove-link" onclick="removeFromCart('${it.p.id}')">${t('cart_remove')}</button></td>
            </tr>
          `).join('')}
          </tbody>
        </table>
      </div>
      <div class="cart-summary">
        <h3 style="font-size:1.1rem;margin-bottom:14px;">${t('order_summary')}</h3>
        <div class="cart-summary-row"><span>${t('subtotal')}</span><span>₹${subtotal}</span></div>
        <div class="cart-summary-row"><span>${t('delivery')}</span><span>₹${delivery}</span></div>
        <div class="cart-summary-row"><span>${t('taxes')}</span><span>₹${taxes}</span></div>
        <div class="cart-summary-row total"><span>${t('total')}</span><span>₹${total}</span></div>
        <button class="btn btn-primary" style="width:100%;margin-top:16px;"
          onclick="window.showToastGlobal('${t('checkout')} — demo only')">${t('checkout')}</button>
      </div>
    </div>
  </div>`;
}
