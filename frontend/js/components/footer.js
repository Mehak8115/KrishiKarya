import { ic } from '../icons.js';
import { t } from '../i18n.js';

export function footerHTML() {
  const lang = window.state.lang;
  const brandName = lang === 'hi' ? 'कृषि कार्य' : 'Krishi Karya';
  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div>
          <div class="footer-brand">
            <div class="brand-mark">${ic('leaf')}</div>
            <div class="footer-brand-name">${brandName}</div>
          </div>
          <p class="footer-tagline">${t('footer_tag')}</p>
        </div>
        <div class="footer-col">
          <h5>${t('footer_platform')}</h5>
          <a href="#" onclick="event.preventDefault();go('ai-disease')">${t('ai_disease')}</a>
          <a href="#" onclick="event.preventDefault();go('ai-ripeness')">${t('ai_ripeness')}</a>
          <a href="#" onclick="event.preventDefault();go('ai-quality')">Quality Grading</a>
        </div>
        <div class="footer-col">
          <h5>${t('footer_company')}</h5>
          <a href="#" onclick="event.preventDefault();go('about')">${t('footer_about')}</a>
          <a href="#" onclick="event.preventDefault();go('how-it-works')">${t('footer_how')}</a>
          <a href="#" onclick="event.preventDefault();go('contact')">${t('footer_contact_link')}</a>
        </div>
        <div class="footer-col">
          <h5>${t('footer_contact')}</h5>
          <p class="footer-contact-item">${ic('phone')} +91 80 4718 2200</p>
          <p class="footer-contact-item">${ic('mail')} krishikarya@gmail.com</p>
          <p class="footer-contact-item">${ic('pin')} Pune, Maharashtra</p>
        </div>
      </div>
      <div class="footer-bottom">${t('footer_rights')}</div>
    </div>
  </footer>`;
}
