import { ic } from '../icons.js';
import { t } from '../i18n.js';

let contactSubmitted = false;

export function submitContact(e) {
  e.preventDefault();
  contactSubmitted = true;
  window.render();
}

// expose to global scope for inline onsubmit
window.submitContact = submitContact;

export function contactView() {
  return `
  <div class="container">
    <div class="page-head"><h1>${t('contact_h')}</h1><p>${t('contact_p')}</p></div>
    <div class="contact-layout">
      <div>
        <div class="contact-info-item">
          <div class="ic">${ic('phone')}</div>
          <div><h5>${t('contact_phone')}</h5><p>+91 80 4718 2200</p></div>
        </div>
        <div class="contact-info-item">
          <div class="ic">${ic('mail')}</div>
          <div><h5>${t('contact_email')}</h5><p>krishikarya@gmail.com</p></div>
        </div>
        <div class="contact-info-item">
          <div class="ic">${ic('pin')}</div>
          <div><h5>${t('contact_address')}</h5><p>Pune, Maharashtra, India</p></div>
        </div>
      </div>
      <div>
        ${contactSubmitted ? `<div class="success-msg">${t('form_success')}</div>` : ''}
        <form onsubmit="submitContact(event)">
          <div class="form-row"><label>${t('form_name')}</label><input type="text" required autocomplete="name"></div>
          <div class="form-row"><label>${t('form_email')}</label><input type="email" required autocomplete="email"></div>
          <div class="form-row"><label>${t('form_message')}</label><textarea required></textarea></div>
          <button class="btn btn-primary" type="submit">${t('form_send')}</button>
        </form>
      </div>
    </div>
  </div>`;
}
