import { t } from '../i18n.js';

export function howItWorksView() {
  const fSteps = [
    ['f_step1_h','f_step1_p'],['f_step2_h','f_step2_p'],
    ['f_step3_h','f_step3_p'],['f_step4_h','f_step4_p']
  ];
  const rSteps = [
    ['r_step1_h','r_step1_p'],['r_step2_h','r_step2_p'],
    ['r_step3_h','r_step3_p'],['r_step4_h','r_step4_p']
  ];

  const stepsHTML = (steps) => steps.map((s,i) => `
    <div class="step-row">
      <div class="step-num">${i+1}</div>
      <div><h4>${t(s[0])}</h4><p>${t(s[1])}</p></div>
    </div>`).join('');

  return `
  <div class="container">
    <div class="page-head"><h1>${t('how_h')}</h1><p>${t('how_p')}</p></div>
    <div class="two-col" style="padding-bottom:70px;">
      <div>
        <h3 style="margin-bottom:16px;font-size:1.3rem;">${t('how_farmers')}</h3>
        <div class="steps-col">${stepsHTML(fSteps)}</div>
      </div>
      <div>
        <h3 style="margin-bottom:16px;font-size:1.3rem;">${t('how_retailers')}</h3>
        <div class="steps-col">${stepsHTML(rSteps)}</div>
      </div>
    </div>
  </div>`;
}
