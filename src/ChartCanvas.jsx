import { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { canonicalName, shortName, useSelection } from './selection';

function idsFromElement(el, chart) {
  if (!el || !chart) return [];
  const ds = chart.data.datasets[el.datasetIndex];
  if (!ds) return [];
  if (ds.selectNames?.[el.index]) return ds.selectNames[el.index];
  const raw = ds.data?.[el.index];
  if (raw && typeof raw === 'object') {
    if (raw.name) return [raw.name];
    if (raw.id) return [raw.id];
    if (Array.isArray(raw.names)) return raw.names;
  }
  const label = chart.data.labels?.[el.index];
  if (typeof label === 'string' && /iso_\d+/.test(label)) return [label];
  if (typeof ds.label === 'string' && /iso_\d+/.test(ds.label)) return [ds.label];
  return [];
}

function idsFromCtx(ctx) {
  return idsFromElement({ datasetIndex: ctx.datasetIndex, index: ctx.dataIndex }, ctx.chart);
}

function pointIsSelected(ctx, selected) {
  if (!selected || !selected.size) return false;
  return idsFromCtx(ctx).some((id) => selected.has(canonicalName(id)));
}

function resolveStyle(value, ctx) {
  if (typeof value === 'function') return value(ctx);
  if (Array.isArray(value)) return value[ctx.dataIndex];
  return value;
}

function applySelectionStyle(data, selected) {
  if (!data?.datasets) return data;
  return {
    ...data,
    datasets: data.datasets.map((ds) => {
      const baseRadius = ds.pointRadius;
      const baseBorderWidth = ds.pointBorderWidth;
      const basePointBorder = ds.pointBorderColor ?? ds.borderColor;
      const baseBorder = ds.borderColor;
      const baseWidth = ds.borderWidth;
      return {
        ...ds,
        data: Array.isArray(ds.data)
          ? ds.data.map((pt) => {
            if (pt && typeof pt === 'object' && typeof pt.r === 'number') {
              const id = canonicalName(pt.name || pt.id);
              if (id && selected.has(id)) return { ...pt, r: pt.r + 3 };
            }
            return pt;
          })
          : ds.data,
        pointRadius: (ctx) => {
          const r = resolveStyle(baseRadius, ctx);
          const n = typeof r === 'number' ? r : 5;
          return pointIsSelected(ctx, selected) ? n + 3 : n;
        },
        pointBorderWidth: (ctx) => {
          const w = resolveStyle(baseBorderWidth, ctx);
          const n = typeof w === 'number' ? w : 1.5;
          return pointIsSelected(ctx, selected) ? Math.max(n, 3) : n;
        },
        pointBorderColor: (ctx) => (
          pointIsSelected(ctx, selected) ? '#185FA5' : resolveStyle(basePointBorder, ctx)
        ),
        borderWidth: (ctx) => {
          const w = resolveStyle(baseWidth, ctx);
          const n = typeof w === 'number' ? w : 1;
          return pointIsSelected(ctx, selected) ? Math.max(n, 3) : n;
        },
        borderColor: (ctx) => (
          pointIsSelected(ctx, selected) ? '#185FA5' : resolveStyle(baseBorder, ctx)
        ),
      };
    }),
  };
}

function fmtNum(v) {
  if (v == null || Number.isNaN(Number(v))) return String(v ?? '');
  const n = Number(v);
  if (Math.abs(n) >= 100) return n.toFixed(1);
  if (Math.abs(n) >= 10) return n.toFixed(2);
  return parseFloat(n.toFixed(3)).toString();
}

function defaultTooltip() {
  return {
    enabled: true,
    callbacks: {
      title(items) {
        const item = items?.[0];
        if (!item) return '';
        const raw = item.raw;
        if (raw && typeof raw === 'object') {
          if (raw.name) return shortName(raw.name);
          if (raw.id) return shortName(raw.id);
          if (Array.isArray(raw.names) && raw.names.length) {
            return `${raw.names.length} molecule${raw.names.length === 1 ? '' : 's'}`;
          }
        }
        const ds = item.chart?.data?.datasets?.[item.datasetIndex];
        const named = ds?.selectNames?.[item.dataIndex];
        if (named?.length === 1) return shortName(named[0]);
        if (named?.length > 1) return `${item.label || ds?.label || ''} · ${named.length} molecules`;
        if (item.label) return item.label;
        if (typeof ds?.label === 'string' && ds.label) return ds.label;
        return '';
      },
      label(item) {
        const raw = item.raw;
        const lines = [];
        if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
          if (raw.x != null && raw.y != null) lines.push(`x: ${fmtNum(raw.x)}   y: ${fmtNum(raw.y)}`);
          else if (raw.y != null) lines.push(`${item.dataset.label || 'Value'}: ${fmtNum(raw.y)}`);
          if (raw.agg != null) lines.push(`Aggregation: ${fmtNum(raw.agg)}%`);
          if (raw.sec != null) lines.push(`SEC: ${fmtNum(raw.sec)}%`);
          if (raw.delta != null) lines.push(`ΔKD: ${fmtNum(raw.delta)} nM`);
        } else if (item.formattedValue != null) {
          const label = item.dataset.label && item.dataset.label !== 'null' ? item.dataset.label : 'Value';
          lines.push(`${label}: ${item.formattedValue}`);
        }
        return lines.length ? lines : (item.formattedValue ?? '');
      },
    },
  };
}

function mergeOptions(options, { select, clear, openProfile }) {
  const userPlugins = options?.plugins || {};
  const userTooltip = userPlugins.tooltip || {};
  const userOnClick = options?.onClick;
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    interaction: { mode: 'nearest', intersect: true },
    ...options,
    onHover(event, elements) {
      const canvas = event?.native?.target;
      if (canvas && canvas.style) canvas.style.cursor = elements.length ? 'pointer' : 'default';
      options?.onHover?.(event, elements);
    },
    onClick(event, elements, chart) {
      userOnClick?.(event, elements, chart);
      const native = event?.native || event;
      const additive = !!(native?.shiftKey || native?.metaKey || native?.ctrlKey);
      if (!elements.length) {
        if (!additive) clear();
        return;
      }
      const ids = elements.flatMap((el) => idsFromElement(el, chart));
      if (ids.length) select(ids, { additive });
    },
    plugins: {
      legend: { display: false },
      ...userPlugins,
      tooltip: {
        ...defaultTooltip(),
        ...userTooltip,
        enabled: userTooltip.enabled !== false,
        callbacks: {
          ...defaultTooltip().callbacks,
          ...(userTooltip.callbacks || {}),
        },
      },
    },
    scales: options?.scales,
  };
}

export default function ChartCanvas({
  id, type, data, options, height,
}) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const { selected, select, clear, openProfile } = useSelection();
  const selectedKey = [...selected].sort().join(',');

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    const merged = mergeOptions(options, { select, clear, openProfile });
    const styled = applySelectionStyle(data, selected);
    chartRef.current = new Chart(canvasRef.current, { type, data: styled, options: merged });

    const canvas = canvasRef.current;
    const onDblClick = (e) => {
      const chart = chartRef.current;
      if (!chart) return;
      const els = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
      const ids = els.flatMap((el) => idsFromElement(el, chart)).map(canonicalName).filter(Boolean);
      if (ids[0]) {
        select([ids[0]]);
        openProfile(ids[0]);
      }
    };
    canvas.addEventListener('dblclick', onDblClick);

    return () => {
      canvas.removeEventListener('dblclick', onDblClick);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
    // Rebuild when the linked selection changes so selected points get a halo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type, data, options, selectedKey, select, clear, openProfile]);

  return (
    <div className="chart-wrap" style={{ height: height || '100%' }}>
      <canvas ref={canvasRef} id={id} role="img" aria-label={id} />
    </div>
  );
}
