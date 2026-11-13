import PptxGenJS from 'pptxgenjs';
import {
  aggClass, avgT, fmt, hlClass, kdClass, runLabels, secClass,
} from './dashboardData';

const FONT = 'Calibri';
const FILL = { g: 'C8E6C9', a: 'FFF9C4', r: 'FFCDD2', na: 'F7F8FA' };
const INK = { g: '1B5E20', a: '6D5300', r: '7F0000', na: '595959' };

function slug(text) {
  return String(text || 'molecule')
    .replace(/[^\w.-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'molecule';
}

function chartPng(canvas) {
  if (!canvas || !canvas.width || !canvas.height) return null;
  const painted = document.createElement('canvas');
  painted.width = canvas.width;
  painted.height = canvas.height;
  const ctx = painted.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, painted.width, painted.height);
  ctx.drawImage(canvas, 0, 0);
  return { data: painted.toDataURL('image/png'), w: painted.width, h: painted.height };
}

function header(slide, title) {
  slide.addShape('rect', {
    x: 0, y: 0, w: 13.333, h: 0.78,
    fill: { color: '1B2430' },
  });
  slide.addText('Luma   ·   TFR-001   ·   Lab meeting', {
    x: 0.42, y: 0.08, w: 8, h: 0.24,
    fontFace: FONT, fontSize: 11, color: 'A8B3C2', margin: 0,
  });
  slide.addText(title, {
    x: 0.42, y: 0.3, w: 12.4, h: 0.38,
    fontFace: FONT, fontSize: 20, bold: true, color: 'F4F7FB', margin: 0,
  });
}

function footer(slide, page, pages) {
  slide.addText('hTfR1 screening  ·  Molecule profile', {
    x: 0.42, y: 7.16, w: 9, h: 0.22,
    fontFace: FONT, fontSize: 11, color: '8C8C8C', margin: 0,
  });
  slide.addText(`${page} / ${pages}`, {
    x: 10.4, y: 7.16, w: 2.5, h: 0.22,
    fontFace: FONT, fontSize: 11, color: '8C8C8C', align: 'right', margin: 0,
  });
}

function headCell(text, align = 'center') {
  return {
    text,
    options: {
      fill: { color: 'F7F8FA' }, color: '595959', bold: true, align, valign: 'middle',
    },
  };
}

function bodyCell(text, tone, align = 'center') {
  const known = tone && FILL[tone];
  return {
    text: text == null || text === '' ? '—' : String(text),
    options: {
      align,
      valign: 'middle',
      bold: !!known && tone !== 'na',
      color: known ? INK[tone] : '141414',
      fill: known ? { color: FILL[tone] } : { color: 'FFFFFF' },
    },
  };
}

function metricCard(slide, x, label, value, tone) {
  slide.addShape('roundRect', {
    x, y: 1.55, w: 3.9, h: 0.95,
    fill: { color: FILL[tone] || 'F7F8FA' },
    rectRadius: 0.08,
  });
  slide.addText(label, {
    x, y: 1.64, w: 3.9, h: 0.28,
    fontFace: FONT, fontSize: 12, color: '595959', align: 'center', margin: 0,
  });
  slide.addText(value, {
    x, y: 1.92, w: 3.9, h: 0.42,
    fontFace: FONT, fontSize: 22, bold: true, color: INK[tone] || '141414', align: 'center', margin: 0,
  });
}

export function profileFlags(run) {
  const flags = [];
  if (run) {
    flags.push(run.kd < 2
      ? { tone: 'g', text: `KD ${fmt(run.kd)} nM — in preferred range for the hTfR1 program` }
      : { tone: 'a', text: `KD ${fmt(run.kd)} nM — marginal, monitor across runs` });
    flags.push(run.sec >= 90
      ? { tone: 'g', text: `SEC purity ${fmt(run.sec, 0)}% — within the green threshold` }
      : { tone: 'a', text: `SEC purity ${fmt(run.sec, 0)}% — below the 90% target, assess aggregation drivers` });
    flags.push(run.agg < 10
      ? { tone: 'g', text: `Aggregation ${fmt(run.agg, 0)}% — low` }
      : { tone: 'r', text: `Aggregation ${fmt(run.agg, 0)}% — elevated, flag for developability review` });
    if (run.hl > 30) flags.push({ tone: 'g', text: `t½ ${fmt(run.hl, 1)} min — strong receptor engagement` });
    else if (run.hl > 10) flags.push({ tone: 'a', text: `t½ ${fmt(run.hl, 1)} min — moderate, may need format engineering` });
    else flags.push({ tone: 'r', text: `t½ ${fmt(run.hl, 1)} min — short, consider format or affinity optimization` });
    if (run.mac) {
      const ratio = run.mac / run.kd;
      if (ratio < 2) flags.push({ tone: 'g', text: `Mac/Hu KD ratio ${ratio.toFixed(2)}× — excellent cross-species profile` });
      else if (ratio < 4) flags.push({ tone: 'a', text: `Mac/Hu KD ratio ${ratio.toFixed(2)}× — moderate drift, confirm in in vivo models` });
      else flags.push({ tone: 'r', text: `Mac/Hu KD ratio ${ratio.toFixed(2)}× — high drift, cross-species coverage at risk` });
    }
  }
  flags.push({ tone: 'a', text: 'Lys ADC coupling site unconfirmed — resolve before advancing to lead selection' });
  return flags;
}

function scoreRows(screen, run) {
  const rows = [[headCell('Metric', 'left'), headCell('Value', 'left')]];
  const add = (label, value, tone) => rows.push([bodyCell(label, null, 'left'), bodyCell(value, tone, 'left')]);
  if (screen) {
    add('Screen KD (nM)', fmt(screen.kd), kdClass(screen.kd));
    add('% Blockade', `${fmt(screen.block, 1)}%`, screen.block >= 80 ? 'g' : screen.block >= 65 ? 'a' : 'r');
    add('Cluster', String(screen.c));
  }
  if (run) {
    const titer = avgT(run);
    add('Best KD (nM)', fmt(run.kd), kdClass(run.kd));
    add('Mac KD (nM)', fmt(run.mac));
    add('Best t½ (min)', fmt(run.hl, 1), hlClass(run.hl));
    add('Best SEC %', `${fmt(run.sec, 0)}%`, secClass(run.sec));
    add('Best aggregation %', `${fmt(run.agg, 0)}%`, aggClass(run.agg));
    add('Best titer', titer ? `${fmt(titer, 2)} g/L` : 'NA');
  }
  if (rows.length === 1) rows.push([bodyCell('Profile', null, 'left'), bodyCell('No screening or run data', 'na', 'left')]);
  return rows;
}

const TABLE = {
  fontFace: FONT,
  fontSize: 13,
  color: '141414',
  border: [
    { pt: 0.5, color: 'E5E8EB' },
    { pt: 0.5, color: 'E5E8EB' },
    { pt: 0.5, color: 'E5E8EB' },
    { pt: 0.5, color: 'E5E8EB' },
  ],
  valign: 'middle',
};

export async function downloadProfileSlides({
  name, clone, cluster, screen, run, lead, uniqueness,
}) {
  const short = name.replace('a-hTfR1_iso_', 'a-hTfR1 iso_');
  const chart = chartPng(document.getElementById('c-prof-trend'));
  const hasRuns = !!(lead && lead.runs && lead.runs.length);
  const pages = 3 + (hasRuns ? 1 : 0);
  let page = 1;

  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  pptx.author = 'Luma';
  pptx.title = `${short} — TFR-001 lab meeting`;
  pptx.subject = 'Molecule profile';

  const overview = pptx.addSlide();
  header(overview, short);
  overview.addText(`${clone}   ·   ${cluster}   ·   Target hTfR1   ·   Program TFR-001`, {
    x: 0.42, y: 0.98, w: 12.4, h: 0.32,
    fontFace: FONT, fontSize: 14, color: '595959', margin: 0,
  });
  if (run) {
    metricCard(overview, 0.42, 'Best KD', `${fmt(run.kd)} nM`, kdClass(run.kd));
    metricCard(overview, 4.7, 'Best SEC', `${fmt(run.sec, 0)}%`, secClass(run.sec));
    metricCard(overview, 8.98, 'Best t½', `${fmt(run.hl, 1)} min`, hlClass(run.hl));
  }
  overview.addTable(scoreRows(screen, run), {
    ...TABLE,
    x: 0.42,
    y: run ? 2.75 : 1.5,
    w: 8.4,
    colW: [3.2, 5.2],
  });
  footer(overview, page, pages);
  page += 1;

  const trend = pptx.addSlide();
  header(trend, 'KD & t½ across runs');
  if (chart && hasRuns) {
    const boxW = 12.4;
    const boxH = 5.5;
    const scale = Math.min(boxW / chart.w, boxH / chart.h);
    const w = chart.w * scale;
    const h = chart.h * scale;
    trend.addImage({
      data: chart.data,
      x: 0.42 + (boxW - w) / 2,
      y: 1.05 + (boxH - h) / 2,
      w,
      h,
    });
  } else {
    trend.addText('No registered runs to plot for this molecule.', {
      x: 0.42, y: 1.4, w: 12, h: 0.4,
      fontFace: FONT, fontSize: 18, color: '595959',
    });
  }
  footer(trend, page, pages);
  page += 1;

  if (hasRuns) {
    const runs = pptx.addSlide();
    header(runs, 'Run-by-run detail');
    const table = [[
      headCell('TPR ID', 'left'),
      headCell('Run', 'left'),
      headCell('Titer g/L'),
      headCell('SEC %'),
      headCell('Agg %'),
      headCell('KD nM'),
      headCell('t½ min'),
      headCell('Mac KD'),
    ]];
    lead.runs.forEach((row, index) => {
      const titer = avgT(row);
      table.push([
        bodyCell(row.tpr || '—', null, 'left'),
        bodyCell(runLabels[index] || `Run ${index + 1}`, null, 'left'),
        bodyCell(titer ? fmt(titer, 3) : 'NA'),
        bodyCell(row.sec == null ? 'NA' : `${fmt(row.sec, 0)}%`, secClass(row.sec)),
        bodyCell(row.agg == null ? 'NA' : `${fmt(row.agg, 0)}%`, aggClass(row.agg)),
        bodyCell(fmt(row.kd), kdClass(row.kd)),
        bodyCell(fmt(row.hl, 1), hlClass(row.hl)),
        bodyCell(fmt(row.mac)),
      ]);
    });
    runs.addTable(table, {
      ...TABLE,
      x: 0.35,
      y: 1.05,
      w: 12.6,
      colW: [1.9, 1.85, 1.35, 1.25, 1.25, 1.3, 1.3, 1.4],
      fontSize: 12,
    });
    footer(runs, page, pages);
    page += 1;
  }

  const notes = pptx.addSlide();
  header(notes, 'Crosslinks, flags, and uniqueness');
  notes.addText('Crosslinks registered', {
    x: 0.42, y: 0.98, w: 6, h: 0.3,
    fontFace: FONT, fontSize: 14, bold: true, color: '141414', margin: 0,
  });
  notes.addTable([
    [headCell('Link', 'left'), headCell('Sites', 'left'), headCell('Note', 'left')],
    [bodyCell('Disulfide', null, 'left'), bodyCell('A:23:R3 – A:96:R3', null, 'left'), bodyCell('Layer 2 — off by default', 'a', 'left')],
    [bodyCell('N-Glyco', null, 'left'), bodyCell('GlcNAc:R1 – A:317:R3', null, 'left'), bodyCell('Layer 4 — contributes to uniqueness', 'g', 'left')],
    [bodyCell('Lys coupling', null, 'left'), bodyCell('Linker:R1 – Lys:[unspec]', null, 'left'), bodyCell('Layer 5 — site unconfirmed', 'r', 'left')],
  ], {
    ...TABLE,
    x: 0.42, y: 1.32, w: 12.4, colW: [2.1, 4.2, 6.1], fontSize: 13,
  });

  notes.addText('Flags and recommendations', {
    x: 0.42, y: 3.15, w: 8, h: 0.3,
    fontFace: FONT, fontSize: 14, bold: true, color: '141414', margin: 0,
  });
  const flags = profileFlags(run);
  notes.addTable(flags.map((flag) => [
    bodyCell(flag.tone === 'g' ? 'OK' : flag.tone === 'r' ? 'Risk' : 'Watch', flag.tone),
    bodyCell(flag.text, null, 'left'),
  ]), {
    ...TABLE,
    x: 0.42, y: 3.5, w: 12.4, colW: [1.3, 11.1], fontSize: 13,
  });

  const chosen = (uniqueness || []).filter((item) => item.on).map((item) => item.label);
  const skipped = (uniqueness || []).filter((item) => !item.on).map((item) => item.label);
  const search = [
    chosen.length ? `On: ${chosen.join(', ')}` : 'No uniqueness layers selected',
    skipped.length ? `Off: ${skipped.join(', ')}` : '',
  ].filter(Boolean).join('    ');
  notes.addText(search, {
    x: 0.42, y: 6.55, w: 12.4, h: 0.4,
    fontFace: FONT, fontSize: 12, color: '595959', margin: 0,
  });
  footer(notes, page, pages);

  const fileName = `TFR-001-${slug(name.replace('a-hTfR1_iso_', 'iso_'))}-lab-meeting.pptx`;
  await pptx.writeFile({ fileName });
}
