/** Pure SVG charts — no external libraries */

export function renderBarChart(data = [], opts = {}) {
  const {
    title = '', height = 180, color = '#43A047',
    forecastColor = '#81C784', yLabel = '',
    showLegend = false, legendItems = [],
  } = opts;

  if (!data.length) return `<div class="kk-empty"><p>No chart data</p></div>`;

  const maxVal = Math.max(...data.map(d => Math.max(d.value || 0, d.forecast || 0))) * 1.15 || 1;
  const barW   = 28;
  const gap    = 10;
  const padL   = 40;
  const padB   = 40;
  const chartW = data.length * (barW + gap) + padL;
  const chartH = height + padB;

  const bars = data.map((d, i) => {
    const x    = padL + i * (barW + gap);
    const val  = d.value ?? d.actual ?? 0;
    const fval = d.forecast;
    const bH   = Math.round((val / maxVal) * height);
    const bY   = height - bH;

    let bars = `<rect x="${x}" y="${bY}" width="${barW}" height="${bH}"
      fill="${color}" rx="4" opacity="0.9">
      <title>${d.label}: ${val} ${yLabel}</title>
    </rect>`;

    if (fval != null) {
      const fH = Math.round((fval / maxVal) * height);
      const fY = height - fH;
      bars += `<rect x="${x}" y="${fY}" width="${barW}" height="${fH}"
        fill="${forecastColor}" rx="4" opacity="0.7">
        <title>${d.label} (forecast): ${fval} ${yLabel}</title>
      </rect>`;
    }

    const label = d.label?.toString().slice(-5) || '';
    return bars + `
    <text x="${x + barW / 2}" y="${height + 14}" text-anchor="middle"
      font-size="9" fill="#8A9E8A"
      transform="rotate(-40,${x + barW / 2},${height + 14})">${label}</text>`;
  }).join('');

  // Y axis ticks
  const ticks = [0, 0.25, 0.5, 0.75, 1].map(frac => {
    const yPos = height - Math.round(frac * height);
    const val  = Math.round(frac * maxVal);
    return `<line x1="${padL - 4}" y1="${yPos}" x2="${chartW}" y2="${yPos}"
      stroke="#E0EAD8" stroke-width="1"/>
    <text x="${padL - 6}" y="${yPos + 4}" text-anchor="end"
      font-size="9" fill="#8A9E8A">${val}</text>`;
  }).join('');

  const legendHTML = showLegend && legendItems.length
    ? `<div class="kk-chart-legend">${legendItems.map(li =>
        `<span><span class="dot" style="background:${li.color}"></span>${li.label}</span>`
      ).join('')}</div>`
    : '';

  return `
  ${title ? `<div class="kk-chart-title">${title}</div>` : ''}
  <div class="kk-chart-wrap">
    <svg viewBox="0 0 ${chartW} ${chartH}" width="100%" preserveAspectRatio="xMinYMin meet">
      ${ticks}
      ${bars}
    </svg>
  </div>
  ${legendHTML}`;
}

export function renderLineChart(data = [], opts = {}) {
  const { title = '', height = 160, color = '#1B5E20', fillColor = 'rgba(67,160,71,0.12)' } = opts;

  if (!data.length) return `<div class="kk-empty"><p>No chart data</p></div>`;

  const maxVal = Math.max(...data.map(d => d.value)) * 1.15 || 1;
  const padL   = 40;
  const padB   = 36;
  const w      = Math.max(data.length * 50, 320);
  const chartH = height + padB;

  const pts = data.map((d, i) => {
    const x = padL + (i / (data.length - 1)) * (w - padL);
    const y = height - Math.round((d.value / maxVal) * height);
    return { x, y, d };
  });

  const polyline = pts.map(p => `${p.x},${p.y}`).join(' ');
  const area     = `${padL},${height} ` + pts.map(p => `${p.x},${p.y}`).join(' ') + ` ${pts[pts.length-1].x},${height}`;

  const dots = pts.map(p =>
    `<circle cx="${p.x}" cy="${p.y}" r="4" fill="${color}">
       <title>${p.d.label}: ${p.d.value}</title>
     </circle>`
  ).join('');

  const labels = pts.filter((_, i) => i % Math.max(1, Math.floor(pts.length / 8)) === 0)
    .map(p => `<text x="${p.x}" y="${height + 16}" text-anchor="middle"
      font-size="9" fill="#8A9E8A">${p.d.label?.toString().slice(-5) || ''}</text>`)
    .join('');

  return `
  ${title ? `<div class="kk-chart-title">${title}</div>` : ''}
  <div class="kk-chart-wrap">
    <svg viewBox="0 0 ${w} ${chartH}" width="100%" preserveAspectRatio="xMinYMin meet">
      <polygon points="${area}" fill="${fillColor}"/>
      <polyline points="${polyline}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round"/>
      ${dots}
      ${labels}
    </svg>
  </div>`;
}

export function renderDonutChart(data = [], opts = {}) {
  const { title = '', size = 140 } = opts;
  if (!data.length) return '';

  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const cx = size / 2, cy = size / 2, r = size * 0.38, innerR = size * 0.24;

  let angle = -Math.PI / 2;
  const segments = data.map(d => {
    const frac  = d.value / total;
    const sweep = frac * 2 * Math.PI;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle + sweep);
    const y2 = cy + r * Math.sin(angle + sweep);
    const ix1 = cx + innerR * Math.cos(angle);
    const iy1 = cy + innerR * Math.sin(angle);
    const ix2 = cx + innerR * Math.cos(angle + sweep);
    const iy2 = cy + innerR * Math.sin(angle + sweep);
    const large = sweep > Math.PI ? 1 : 0;
    const path  = `M ${ix1} ${iy1} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${large} 0 ${ix1} ${iy1}`;
    angle += sweep;
    return `<path d="${path}" fill="${d.color || '#43A047'}"><title>${d.label}: ${d.value}</title></path>`;
  }).join('');

  const legend = data.map(d =>
    `<div style="display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--kk-text);">
       <span style="width:10px;height:10px;border-radius:50%;background:${d.color};flex-shrink:0;"></span>
       ${d.label} <strong>${Math.round(d.value / total * 100)}%</strong>
     </div>`
  ).join('');

  return `
  ${title ? `<div class="kk-chart-title">${title}</div>` : ''}
  <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="flex-shrink:0;">
      ${segments}
    </svg>
    <div style="display:flex;flex-direction:column;gap:8px;">${legend}</div>
  </div>`;
}
