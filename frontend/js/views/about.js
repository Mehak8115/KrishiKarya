import { t } from '../i18n.js';

export function aboutView() {
  return `
  <div class="container">
    <div class="page-head"><h1>${t('about_h')}</h1><p>${t('about_p')}</p></div>
    <div style="padding-bottom:70px;">
      <div class="stats-row">
        <div class="stat-box"><div class="num">${t('stat1_n')}</div><div class="label">${t('stat1_l')}</div></div>
        <div class="stat-box"><div class="num">${t('stat2_n')}</div><div class="label">${t('stat2_l')}</div></div>
        <div class="stat-box"><div class="num">${t('stat3_n')}</div><div class="label">${t('stat3_l')}</div></div>
        <div class="stat-box"><div class="num">${t('stat4_n')}</div><div class="label">${t('stat4_l')}</div></div>
      </div>
      <div class="about-story">
        <h3 style="font-size:1.3rem;margin-bottom:16px;">${t('about_mission_h')}</h3>
        <p>${t('about_p1')}</p>
        <p>${t('about_p2')}</p>
        <p>${t('about_p3')}</p>
      </div>
    </div>
  </div>`;
}
