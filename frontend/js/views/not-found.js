import { t } from '../i18n.js';

export function notFoundView() {
  return `
  <div class="container">
    <div class="notfound">
      <div class="code">404</div>
      <h3>${t('nf_h')}</h3>
      <p>${t('nf_p')}</p>
      <button class="btn btn-primary" onclick="go('home')">${t('nf_btn')}</button>
    </div>
  </div>`;
}
