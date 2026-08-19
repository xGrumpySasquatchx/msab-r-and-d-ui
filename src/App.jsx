import { useEffect, useMemo, useRef, useState } from 'react';
import './AntibodyDashboard.css';
import ChartCanvas from './ChartCanvas';
import { MoleculeRow, SelectionBar, useSelection } from './selection';
import {
  G, A, R, GF, AF, RF, clusterColors, runLabels,
  screening, leads,
  kdClass, secClass, aggClass, hlClass, fmt, avgT, getBestRun,
} from './dashboardData';

// sendPrompt: if this dashboard is embedded in an environment that provides a
// global sendPrompt() (e.g. Claude's Visualizer), use it. Otherwise no-op/log.
function sendPrompt(text) {
  if (typeof window !== 'undefined' && typeof window.sendPrompt === 'function') {
    window.sendPrompt(text);
  } else {
    // eslint-disable-next-line no-console
    console.log('[sendPrompt]', text);
  }
}

const FONT9 = { font: { size: 12 } };
const FONT8 = { font: { size: 11 } };
const legendTop = { legend: { display: true, position: 'top', labels: { font: { size: 12 }, boxWidth: 12 } } };

const MAIN_TABS = [
  { id: 'screening', label: 'Screening & functional' },
  { id: 'structure', label: 'Structure & format' },
  { id: 'biophysics', label: 'Biophysics & developability' },
  { id: 'bioactivity', label: 'Biological activity' },
  { id: 'production', label: 'Production & format' },
  { id: 'registration', label: 'Registration & uniqueness', className: 'regtab' },
  { id: 'compare', label: 'Comparison' },
  { id: 'profile', label: 'Molecule profile', className: 'ptab' },
  { id: 'config', label: 'Threshold config', className: 'ptab' },
];

const SCALE_MIN = 80;
const SCALE_MAX = 150;

export default function App() {
  const [activeTabs, setActiveTabs] = useState(['screening']);
  const [subTabs, setSubTabs] = useState({
    sc: 'sc-a', st: 'st-a', bp: 'bp-a', ba: 'ba-std', pr: 'pr-a', reg: 'reg-a',
  });
  const [clusterFilterTop, setClusterFilterTop] = useState(0);
  const [tblCluster, setTblCluster] = useState(0);
  const [tblKdFilter, setTblKdFilter] = useState('all');
  const [xlMode, setXlMode] = useState('desc');
  const [xlAssayFilter, setXlAssayFilter] = useState('All mechanisms');
  const [layers, setLayers] = useState({ 2: false, 3: true, 4: true, 5: true });
  const [runAbFilter, setRunAbFilter] = useState('all');
  const [profileName, setProfileName] = useState('a-hTfR1_iso_326');
  const [savedLabel, setSavedLabel] = useState('Save preset');
  const [uiScale, setUiScale] = useState(100);
  const [dragOverId, setDragOverId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const dragPanelId = useRef(null);
  const { registerOpen, selected } = useSelection();

  const openProfile = (name) => {
    setProfileName(name);
    setActiveTabs(['profile']);
  };

  const focusTab = (id) => setActiveTabs([id]);

  const nudgeScale = (delta) => {
    setUiScale((prev) => Math.min(SCALE_MAX, Math.max(SCALE_MIN, prev + delta)));
  };

  const onMainTabClick = (id, e) => {
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    if (!additive) {
      focusTab(id);
      return;
    }
    setActiveTabs((prev) => {
      if (prev.includes(id)) {
        return prev.length > 1 ? prev.filter((t) => t !== id) : prev;
      }
      return [...prev, id];
    });
  };

  const movePanel = (fromId, toId) => {
    if (!fromId || !toId || fromId === toId) return;
    setActiveTabs((prev) => {
      const from = prev.indexOf(fromId);
      const to = prev.indexOf(toId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  useEffect(() => {
    registerOpen(openProfile);
  }, [registerOpen]);

  useEffect(() => {
    if (selected.size === 1) setProfileName([...selected][0]);
  }, [selected]);

  const showSub = (group, id) => setSubTabs((prev) => ({ ...prev, [group]: id }));

  const stats = useMemo(() => ({
    green: screening.filter((d) => d.kd < 5).length,
    yellow: screening.filter((d) => d.kd >= 5 && d.kd < 50).length,
    red: screening.filter((d) => d.kd >= 50).length,
    block: screening.filter((d) => d.block >= 80).length,
  }), []);

  const selectedTabIds = activeTabs;
  const combined = selectedTabIds.length > 1;

  const renderPanel = (id) => {
    switch (id) {
      case 'screening':
        return (
          <ScreeningPanel
            sub={subTabs.sc}
            onSub={(sid) => showSub('sc', sid)}
            clusterFilterTop={clusterFilterTop}
            tblCluster={tblCluster}
            setTblCluster={setTblCluster}
            tblKdFilter={tblKdFilter}
            setTblKdFilter={setTblKdFilter}
            stats={stats}
            openProfile={openProfile}
          />
        );
      case 'structure':
        return (
          <StructurePanel
            sub={subTabs.st}
            onSub={(sid) => showSub('st', sid)}
            xlMode={xlMode}
            setXlMode={setXlMode}
          />
        );
      case 'biophysics':
        return <BiophysicsPanel sub={subTabs.bp} onSub={(sid) => showSub('bp', sid)} />;
      case 'bioactivity':
        return (
          <BioactivityPanel
            sub={subTabs.ba}
            onSub={(sid) => showSub('ba', sid)}
            xlAssayFilter={xlAssayFilter}
            setXlAssayFilter={setXlAssayFilter}
          />
        );
      case 'production':
        return (
          <ProductionPanel
            sub={subTabs.pr}
            onSub={(sid) => showSub('pr', sid)}
            runAbFilter={runAbFilter}
            setRunAbFilter={setRunAbFilter}
            openProfile={openProfile}
          />
        );
      case 'registration':
        return (
          <RegistrationPanel
            sub={subTabs.reg}
            onSub={(sid) => showSub('reg', sid)}
            layers={layers}
            setLayers={setLayers}
          />
        );
      case 'compare':
        return <ComparePanel openProfile={openProfile} />;
      case 'profile':
        return <ProfilePanel name={profileName} setProfileName={setProfileName} />;
      case 'config':
        return <ConfigPanel savedLabel={savedLabel} setSavedLabel={setSavedLabel} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-shell" style={{ '--ui-scale': uiScale / 100 }}>
      <h2 style={{
        position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)',
      }}
      >
        Anti-hTfR1 antibody R&amp;D dashboard with real screening data and full characterization views
      </h2>

      <div className="topbar">
        <div className="logo">Luma</div>
        <div className="prog-info">
          Target: hTfR1 (Transferrin Receptor 1) &nbsp;&middot;&nbsp; 50 screened &nbsp;&middot;&nbsp; 15 leads &nbsp;&middot;&nbsp; Program: TFR-001
        </div>
        <div className="tl-legend">
          <span className="tl-dot" style={{ background: '#2E7D32' }} />
          <span className="tl-txt">Preferred</span>
          <span className="tl-dot" style={{ background: '#F9C200' }} />
          <span className="tl-txt">Marginal</span>
          <span className="tl-dot" style={{ background: '#C62828' }} />
          <span className="tl-txt">High risk</span>
          <select
            value={clusterFilterTop}
            onChange={(e) => setClusterFilterTop(parseInt(e.target.value, 10))}
          >
            <option value={0}>All clusters</option>
            <option value={1}>Cluster 1</option>
            <option value={2}>Cluster 2</option>
            <option value={3}>Cluster 3</option>
            <option value={4}>Cluster 4</option>
            <option value={5}>Cluster 5</option>
          </select>
          <div className="scale-ctl">
            <span>Scale</span>
            <button
              type="button"
              className="scale-btn"
              aria-label="Decrease scale"
              disabled={uiScale <= SCALE_MIN}
              onClick={() => nudgeScale(-1)}
            >
              −
            </button>
            <input
              type="range"
              min={SCALE_MIN}
              max={SCALE_MAX}
              step="1"
              value={uiScale}
              onChange={(e) => setUiScale(parseInt(e.target.value, 10))}
            />
            <button
              type="button"
              className="scale-btn"
              aria-label="Increase scale"
              disabled={uiScale >= SCALE_MAX}
              onClick={() => nudgeScale(1)}
            >
              +
            </button>
            <span className="scale-val">{uiScale}%</span>
          </div>
          <button type="button" className="primary" onClick={() => focusTab('config')}>Thresholds</button>
        </div>
      </div>

      <div className="tabrow">
        {MAIN_TABS.map((t) => (
          <div
            key={t.id}
            className={`tab${t.className ? ` ${t.className}` : ''}${activeTabs.includes(t.id) ? ' active' : ''}`}
            onClick={(e) => onMainTabClick(t.id, e)}
          >
            {t.label}
          </div>
        ))}
      </div>
      <div className="tab-hint">
        {combined
          ? `Combined view: ${selectedTabIds.map((id) => MAIN_TABS.find((t) => t.id === id)?.label).join(' · ')}. Shift-click to add or remove a tab. Drag a panel title to rearrange.`
          : 'Shift-click tabs to show their plots together. Drag the corner of any chart to resize it.'}
      </div>

      <SelectionBar />

      <div className="content">
        {combined ? (
          <div className="combined-grid" data-count={selectedTabIds.length}>
            {selectedTabIds.map((id) => (
              <section
                key={id}
                className={`combined-section${dragOverId === id && draggingId !== id ? ' drop-target' : ''}${draggingId === id ? ' dragging' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  if (dragOverId !== id) setDragOverId(id);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromId = dragPanelId.current || e.dataTransfer.getData('text/plain');
                  movePanel(fromId, id);
                  dragPanelId.current = null;
                  setDraggingId(null);
                  setDragOverId(null);
                }}
              >
                <div
                  className="combined-section-title"
                  draggable
                  onDragStart={(e) => {
                    dragPanelId.current = id;
                    setDraggingId(id);
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', id);
                    const section = e.currentTarget.closest('.combined-section');
                    if (section) e.dataTransfer.setDragImage(section, 24, 16);
                  }}
                  onDragEnd={() => {
                    dragPanelId.current = null;
                    setDraggingId(null);
                    setDragOverId(null);
                  }}
                >
                  <span className="drag-handle" aria-hidden="true" title="Drag to rearrange">⋮⋮</span>
                  <span>{MAIN_TABS.find((t) => t.id === id)?.label}</span>
                </div>
                {renderPanel(id)}
              </section>
            ))}
          </div>
        ) : (
          renderPanel(selectedTabIds[0])
        )}
      </div>
    </div>
  );
}

/* ============================== SCREENING ============================== */
function ScreeningPanel({
  sub, onSub, clusterFilterTop, tblCluster, setTblCluster, tblKdFilter, setTblKdFilter, stats, openProfile,
}) {
  const scatterData = useMemo(() => {
    const cf = clusterFilterTop;
    const datasets = [1, 2, 3, 4, 5]
      .filter((c) => !cf || cf === c)
      .map((c) => ({
        label: `Cluster ${c}`,
        data: screening.filter((d) => d.c === c).map((d) => ({ x: d.kd, y: d.block, name: d.name })),
        backgroundColor: `${clusterColors[c]}55`,
        borderColor: clusterColors[c],
        pointRadius: 5,
        pointBorderWidth: 1.5,
      }));
    return { datasets };
  }, [clusterFilterTop]);

  const scatterOptions = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { type: 'logarithmic', min: 0.5, max: 600, title: { display: true, text: 'hTfR1 KD (nM)', ...FONT9 }, ticks: FONT8 },
      y: { min: 45, max: 100, title: { display: true, text: '% Blockade', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const speciesData = useMemo(() => {
    const pts = screening.map((d) => ({ x: d.kd, y: d.mac, delta: d.mac - d.kd, name: d.name }));
    return {
      datasets: [
        { label: 'ΔKD <2', data: pts.filter((p) => p.delta < 2), backgroundColor: GF, borderColor: G, pointRadius: 5, pointBorderWidth: 1.5 },
        { label: 'ΔKD 2–5', data: pts.filter((p) => p.delta >= 2 && p.delta < 5), backgroundColor: AF, borderColor: A, pointRadius: 5, pointBorderWidth: 1.5 },
        { label: 'ΔKD >5', data: pts.filter((p) => p.delta >= 5), backgroundColor: RF, borderColor: R, pointRadius: 5, pointBorderWidth: 1.5 },
      ],
    };
  }, []);

  const speciesOptions = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { type: 'logarithmic', min: 0.5, max: 600, title: { display: true, text: 'hTfR1 KD (nM)', ...FONT9 }, ticks: FONT8 },
      y: { type: 'logarithmic', min: 0.5, max: 600, title: { display: true, text: 'Mac KD (nM)', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const clLabels = ['Cluster 1', 'Cluster 2', 'Cluster 3', 'Cluster 4', 'Cluster 5'];

  const clMedKD = useMemo(() => [1, 2, 3, 4, 5].map((c) => {
    const v = screening.filter((d) => d.c === c).map((d) => d.kd).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  }), []);

  const clMedBlock = useMemo(() => [1, 2, 3, 4, 5].map((c) => {
    const v = screening.filter((d) => d.c === c).map((d) => d.block).sort((a, b) => a - b);
    return v[Math.floor(v.length / 2)];
  }), []);

  const clusterMembers = useMemo(
    () => [1, 2, 3, 4, 5].map((c) => screening.filter((d) => d.c === c).map((d) => d.name)),
    [],
  );

  const clusterData = useMemo(() => ({
    labels: clLabels,
    datasets: [
      {
        label: 'Median KD', data: clMedKD, backgroundColor: clusterColors.slice(1).map((c) => `${c}55`), borderColor: clusterColors.slice(1), borderWidth: 1.5, yAxisID: 'y', selectNames: clusterMembers,
      },
      {
        label: 'Median blockade %', data: clMedBlock, type: 'line', borderColor: '#888', pointRadius: 5, yAxisID: 'y2', fill: false, selectNames: clusterMembers,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [clMedKD, clMedBlock, clusterMembers]);

  const clusterOptions = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { ticks: FONT8 },
      y: { type: 'logarithmic', title: { display: true, text: 'Median KD (nM)', ...FONT9 }, ticks: FONT8 },
      y2: {
        position: 'right', min: 50, max: 100, title: { display: true, text: 'Median blockade %', ...FONT9 }, ticks: FONT8, grid: { drawOnChartArea: false },
      },
    },
  }), []);

  const blockClusterData = useMemo(() => ({
    labels: clLabels,
    datasets: [{
      data: clMedBlock, backgroundColor: clusterColors.slice(1).map((c) => `${c}55`), borderColor: clusterColors.slice(1), borderWidth: 1.5, selectNames: clusterMembers,
    }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [clMedBlock, clusterMembers]);

  const blockClusterOptions = useMemo(() => ({
    scales: {
      x: { ticks: FONT8 },
      y: { min: 50, max: 100, title: { display: true, text: 'Median blockade %', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const clusterPieData = useMemo(() => ({
    labels: clLabels,
    datasets: [{
      data: [1, 2, 3, 4, 5].map((c) => screening.filter((d) => d.c === c).length),
      backgroundColor: clusterColors.slice(1).map((c) => `${c}88`),
      borderColor: clusterColors.slice(1),
      borderWidth: 1,
      selectNames: clusterMembers,
    }],
  }), [clusterMembers]);

  const clusterPieOptions = useMemo(() => ({
    plugins: { legend: { display: true, position: 'right', labels: { font: { size: 12 }, boxWidth: 12 } } },
  }), []);

  const filteredTable = useMemo(() => screening.filter((d) => (!tblCluster || d.c === tblCluster)
    && (tblKdFilter === 'all'
      || (tblKdFilter === 'green' && d.kd < 5)
      || (tblKdFilter === 'yellow' && d.kd >= 5 && d.kd < 50)
      || (tblKdFilter === 'red' && d.kd >= 50))), [tblCluster, tblKdFilter]);

  return (
    <div>
      <div className="subtabrow">
        <div className={`stab${sub === 'sc-a' ? ' active' : ''}`} onClick={() => onSub('sc-a')}>A — KD vs blockade</div>
        <div className={`stab${sub === 'sc-b' ? ' active' : ''}`} onClick={() => onSub('sc-b')}>B — Cluster overview</div>
        <div className={`stab${sub === 'sc-c' ? ' active' : ''}`} onClick={() => onSub('sc-c')}>C — Full table</div>
      </div>

      {sub === 'sc-a' && (
        <div>
          <div className="stat-grid">
            <div className="stat"><div className="stat-label">Total screened</div><div className="stat-val">50</div></div>
            <div className="stat"><div className="stat-label">KD &lt;5 nM</div><div className="stat-val g">{stats.green}</div></div>
            <div className="stat"><div className="stat-label">KD 5–50 nM</div><div className="stat-val a">{stats.yellow}</div></div>
            <div className="stat"><div className="stat-label">KD &gt;50 nM</div><div className="stat-val r">{stats.red}</div></div>
            <div className="stat"><div className="stat-label">Blockade &gt;80%</div><div className="stat-val g">{stats.block}</div></div>
            <div className="stat"><div className="stat-label">Leads carried fwd</div><div className="stat-val">15</div></div>
          </div>
          <div className="g2">
            <div className="card">
              <div className="card-title">hTfR1 KD vs % blockade of Alexa488</div>
              <div className="card-desc">X = KD (nM, log) &middot; Y = % blockade &middot; color = cluster &middot; hover for name &middot; click to select · Shift/⌘-click to multi-select · double-click opens profile</div>
              <ChartCanvas id="c-scatter" type="scatter" data={scatterData} options={scatterOptions} height={280} />
              <div className="tl-row"><span className="tl g">KD &lt;5 nM</span><span className="tl a">5–50 nM</span><span className="tl r">&gt;50 nM</span></div>
            </div>
            <div className="card">
              <div className="card-title">hTfR1 vs macaque TfR1 KD (cross-species)</div>
              <div className="card-desc">X = human KD &middot; Y = macaque KD &middot; color = &Delta;KD &middot; below diagonal = tighter human binding</div>
              <ChartCanvas id="c-species" type="scatter" data={speciesData} options={speciesOptions} height={280} />
              <div className="tl-row"><span className="tl g">&Delta;KD &lt;2 nM</span><span className="tl a">2–5 nM</span><span className="tl r">&gt;5 nM</span></div>
            </div>
          </div>
        </div>
      )}

      {sub === 'sc-b' && (
        <div>
          <div className="card">
            <div className="card-title">Cluster summary — median KD and % blockade</div>
            <ChartCanvas id="c-cluster" type="bar" data={clusterData} options={clusterOptions} height={260} />
          </div>
          <div className="g2">
            <div className="card">
              <div className="card-title">Blockade distribution by cluster</div>
              <ChartCanvas id="c-block-cluster" type="bar" data={blockClusterData} options={blockClusterOptions} height={200} />
            </div>
            <div className="card">
              <div className="card-title">Candidates per cluster</div>
              <ChartCanvas id="c-cluster-pie" type="doughnut" data={clusterPieData} options={clusterPieOptions} height={200} />
            </div>
          </div>
        </div>
      )}

      {sub === 'sc-c' && (
        <div className="subpanel active">
          <div className="card">
            <div className="card-title">Full screening panel</div>
            <div style={{
              display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap',
            }}
            >
              <select value={tblCluster} onChange={(e) => setTblCluster(parseInt(e.target.value, 10))}>
                <option value={0}>All clusters</option>
                <option value={1}>Cluster 1</option>
                <option value={2}>Cluster 2</option>
                <option value={3}>Cluster 3</option>
                <option value={4}>Cluster 4</option>
                <option value={5}>Cluster 5</option>
              </select>
              <select value={tblKdFilter} onChange={(e) => setTblKdFilter(e.target.value)}>
                <option value="all">All KD</option>
                <option value="green">KD &lt;5 nM</option>
                <option value="yellow">KD 5–50 nM</option>
                <option value="red">KD &gt;50 nM</option>
              </select>
            </div>
            <div className="tbl-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th><th>Cluster</th><th>hTfR1 KD (nM)</th><th>% Blockade</th><th>Mac KD (nM)</th><th>ΔKD</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTable.map((d) => {
                    const delta = d.mac - d.kd;
                    return (
                      <MoleculeRow key={d.name} name={d.name}>
                        <td>{d.name.replace('a-hTfR1_iso_', 'iso_')}</td>
                        <td><span className="cluster-badge" style={{ background: clusterColors[d.c] }}>{d.c}</span></td>
                        <td className={kdClass(d.kd)}>{fmt(d.kd)}</td>
                        <td className={d.block >= 80 ? 'g' : d.block >= 65 ? 'a' : 'r'}>{fmt(d.block, 1)}%</td>
                        <td>{fmt(d.mac)}</td>
                        <td className={delta < 2 ? 'g' : delta < 5 ? 'a' : 'r'}>{`+${fmt(delta, 2)}`}</td>
                      </MoleculeRow>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== STRUCTURE ============================== */
function StructurePanel({ sub, onSub, xlMode, setXlMode }) {
  const cloneGroups = useMemo(() => {
    const groups = {};
    leads.forEach((l) => {
      const grp = l.clone.split('_')[0];
      if (!groups[grp]) groups[grp] = [];
      const b = getBestRun(l);
      if (b) groups[grp].push(b.r.kd);
    });
    return groups;
  }, []);

  const cGLabels = Object.keys(cloneGroups);
  const cGData = cGLabels.map((g) => {
    const v = cloneGroups[g];
    return v.reduce((a, b) => a + b, 0) / v.length;
  });

  const cs1Data = useMemo(() => {
    const cloneMembers = {};
    leads.forEach((l) => {
      const grp = l.clone.split('_')[0];
      if (!cloneMembers[grp]) cloneMembers[grp] = [];
      cloneMembers[grp].push(l.name);
    });
    return {
      labels: cGLabels.map((g) => `Clone ${g}`),
      datasets: [{
        data: cGData,
        backgroundColor: cGData.map((v) => (v < 2 ? GF : v < 10 ? AF : RF)),
        borderColor: cGData.map((v) => (v < 2 ? G : v < 10 ? A : R)),
        borderWidth: 1.5,
        selectNames: cGLabels.map((g) => cloneMembers[g] || []),
      }],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloneGroups]);

  const cs1Options = useMemo(() => ({
    scales: {
      y: { type: 'logarithmic', title: { display: true, text: 'Mean best KD (nM)', ...FONT9 }, ticks: FONT8 },
      x: { ticks: FONT8 },
    },
  }), []);

  const cs2Data = useMemo(() => ({
    labels: ['VH', 'VL', 'CH1', 'CH2', 'CH3', 'Hinge', 'Linker'],
    datasets: [
      { label: 'Median KD contrib.', data: [1.1, 1.3, 2.1, 2.5, 2.2, 3.0, 1.8], backgroundColor: GF, borderColor: G, borderWidth: 1 },
      { label: 'Agg risk', data: [1, 2, 3, 5, 4, 6, 3], backgroundColor: RF, borderColor: R, borderWidth: 1 },
    ],
  }), []);

  const cs2Options = useMemo(() => ({
    plugins: legendTop,
    scales: { x: { ticks: FONT8 }, y: { ticks: FONT8 } },
  }), []);

  const cs3Data = useMemo(() => ({
    labels: ['CHO', 'HEK293', 'Yeast'],
    datasets: [
      {
        label: 'Avg SEC%', data: [91, 87, 78], backgroundColor: [GF, AF, RF], borderColor: [G, A, R], borderWidth: 1.5, yAxisID: 'y',
      },
      {
        label: 'Avg titer (g/L)', data: [0.82, 0.54, 0.28], backgroundColor: 'rgba(55,138,221,.2)', borderColor: '#378ADD', borderWidth: 1, yAxisID: 'y2',
      },
    ],
  }), []);

  const cs3Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { ticks: FONT8 },
      y: {
        min: 60, max: 100, title: { display: true, text: 'SEC %', ...FONT9 }, ticks: FONT8,
      },
      y2: {
        position: 'right', title: { display: true, text: 'Titer g/L', ...FONT9 }, ticks: FONT8, grid: { drawOnChartArea: false },
      },
    },
  }), []);

  return (
    <div>
      <div className="subtabrow">
        <div className={`stab${sub === 'st-a' ? ' active' : ''}`} onClick={() => onSub('st-a')}>A — Building block &amp; component</div>
        <div className={`stab${sub === 'st-b' ? ' active' : ''}`} onClick={() => onSub('st-b')}>B — CDR / FR flags</div>
        <div className={`stab${sub === 'st-c' ? ' active' : ''}`} onClick={() => onSub('st-c')}>C — Host comparison</div>
        <div
          className={`stab${sub === 'st-d' ? ' active' : ''}`}
          onClick={() => onSub('st-d')}
          style={{
            background: '#EAF3DE', color: '#1B5E20', borderColor: '#66BB6A', fontWeight: 600,
          }}
        >
          D — Crosslink map
        </div>
      </div>

      {sub === 'st-a' && (
        <div className="g2">
          <div className="card">
            <div className="card-title">Building block potency by clone group</div>
            <div className="card-desc">Median KD per clone family from lead panel &middot; top/bottom highlighted</div>
            <ChartCanvas id="cs1" type="bar" data={cs1Data} options={cs1Options} height={220} />
          </div>
          <div className="card">
            <div className="card-title">Component contribution heatmap</div>
            <div className="card-desc">Median KD and SEC% by structural component (illustrative)</div>
            <ChartCanvas id="cs2" type="bar" data={cs2Data} options={cs2Options} height={220} />
          </div>
        </div>
      )}

      {sub === 'st-b' && (
        <div className="card">
          <div className="card-title">CDR / FR region flags</div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Region</th><th>Variants</th><th>Median ΔKD vs parent</th><th>Hydrophobicity</th><th>Charge risk</th></tr>
              </thead>
              <tbody>
                <tr><td>CDR-H1</td><td>8</td><td style={{ color: '#1B5E20' }}>−1.8&times; improved</td><td><span className="tl g">Low</span></td><td><span className="tl g">None</span></td></tr>
                <tr><td>CDR-H2</td><td>12</td><td style={{ color: '#6D5300' }}>+0.6&times; marginal</td><td><span className="tl a">Moderate</span></td><td><span className="tl g">None</span></td></tr>
                <tr><td>CDR-H3</td><td>15</td><td style={{ color: '#1B5E20' }}>−3.1&times; improved</td><td><span className="tl g">Low</span></td><td><span className="tl a">Cluster noted</span></td></tr>
                <tr><td>CDR-L1</td><td>6</td><td style={{ color: '#7F0000' }}>+1.9&times; worse</td><td><span className="tl r">High</span></td><td><span className="tl g">None</span></td></tr>
                <tr><td>CDR-L3</td><td>9</td><td style={{ color: '#555' }}>0.2&times; neutral</td><td><span className="tl g">Low</span></td><td><span className="tl g">None</span></td></tr>
                <tr><td>FR-H3</td><td>5</td><td style={{ color: '#6D5300' }}>+0.4&times;</td><td><span className="tl a">Moderate</span></td><td><span className="tl a">Watch</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sub === 'st-c' && (
        <div className="card">
          <div className="card-title">Host system comparison — %SEC purity and yield</div>
          <ChartCanvas id="cs3" type="bar" data={cs3Data} options={cs3Options} height={220} />
        </div>
      )}

      {sub === 'st-d' && <CrosslinkMapPanel xlMode={xlMode} setXlMode={setXlMode} />}
    </div>
  );
}

function CrosslinkMapPanel({ xlMode, setXlMode }) {
  return (
    <div>
      <div className="g2">
        <div className="card">
          <div className="card-title">Crosslink definition <span className="badge new">new</span></div>
          <div className="card-desc" style={{ marginBottom: 8 }}>
            Registered crosslinks for selected lead. Toggle between descriptive and atomic (R-label) view.
          </div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
            <span className={`assay-chip${xlMode === 'desc' ? ' sel' : ''}`} onClick={() => setXlMode('desc')}>Descriptive</span>
            <span className={`assay-chip${xlMode === 'atom' ? ' sel' : ''}`} onClick={() => setXlMode('atom')}>Atomic (R-label)</span>
          </div>
          {xlMode === 'desc' && (
            <div>
              <div className="xl-row"><span className="xl-tag">Disulfide</span><span style={{ fontSize: 13, color: '#555' }}>Chain A &middot; Res 23</span><span className="xl-arrow">↔</span><span style={{ fontSize: 13, color: '#555' }}>Chain A &middot; Res 96</span><span className="badge" style={{ background: '#FFF9C4', color: '#6D5300', borderColor: '#F9C200' }}>Layer 2 (optional)</span></div>
              <div className="xl-row"><span className="xl-tag chem">Glyco-N</span><span style={{ fontSize: 13, color: '#555' }}>Chain A &middot; Asn 317</span><span className="xl-arrow">→</span><span style={{ fontSize: 13, color: '#555' }}>N-glycan</span><span className="badge" style={{ background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' }}>Layer 4</span></div>
              <div className="xl-row"><span className="xl-tag desc">Lys coupling</span><span style={{ fontSize: 13, color: '#555' }}>Lys &middot; unknown site</span><span className="xl-arrow">↔</span><span style={{ fontSize: 13, color: '#555' }}>Linker payload</span><span className="badge" style={{ background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' }}>Layer 5</span><span className="badge warn">Site unconfirmed</span></div>
            </div>
          )}
          {xlMode === 'atom' && (
            <div>
              <div className="xl-row"><span className="xl-tag">Disulfide</span><span className="xl-atom">A:23:R3</span><span className="xl-arrow">↔</span><span className="xl-atom">A:96:R3</span><span className="badge" style={{ background: '#FFF9C4', color: '#6D5300', borderColor: '#F9C200' }}>Layer 2</span></div>
              <div className="xl-row"><span className="xl-tag chem">Glyco-N</span><span className="xl-atom">GlcNAc:R1</span><span className="xl-arrow">→</span><span className="xl-atom">A:317:R3</span><span className="badge" style={{ background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' }}>Layer 4</span></div>
              <div className="xl-row"><span className="xl-tag desc">Lys coupling</span><span className="xl-atom">Linker:R1</span><span className="xl-arrow">↔</span><span className="xl-atom">Lys:[unspecified]</span><span className="badge" style={{ background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' }}>Layer 5</span></div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-title">Sequence crosslink arc map <span className="badge mod">enhanced</span></div>
          <div className="card-desc" style={{ marginBottom: 8 }}>Intrachain S-S (red dashed) and interchain XL (purple) overlaid on sequence strip.</div>
          <svg viewBox="0 0 320 100" width="100%" style={{ display: 'block', border: '1px solid #e8e8e8', borderRadius: 6, background: '#fafafa' }}>
            <text x="8" y="24" fontSize="8" fill="#555" fontWeight="600">Chain A (VH)</text>
            <rect x="8" y="28" width="304" height="13" rx="3" fill="#E6F1FB" stroke="#85B7EB" strokeWidth="0.7" />
            <rect x="55" y="28" width="11" height="13" rx="2" fill="#378ADD" /><text x="58" y="38" fontSize="7" fill="#fff" fontWeight="700">C</text>
            <rect x="230" y="28" width="11" height="13" rx="2" fill="#378ADD" /><text x="233" y="38" fontSize="7" fill="#fff" fontWeight="700">C</text>
            <text x="52" y="50" fontSize="6" fill="#378ADD">23</text><text x="228" y="50" fontSize="6" fill="#378ADD">96</text>
            <text x="8" y="68" fontSize="8" fill="#555" fontWeight="600">Chain B (VL)</text>
            <rect x="8" y="72" width="304" height="13" rx="3" fill="#E1F5EE" stroke="#5DCAA5" strokeWidth="0.7" />
            <rect x="140" y="72" width="11" height="13" rx="2" fill="#1D9E75" /><text x="143" y="82" fontSize="7" fill="#fff" fontWeight="700">C</text>
            <text x="137" y="94" fontSize="6" fill="#1D9E75">45</text>
            <path d="M 60,28 Q 143,5 235,28" fill="none" stroke="#C62828" strokeWidth="1.5" strokeDasharray="3,2" />
            <text x="130" y="8" fontSize="7" fill="#C62828" fontWeight="700">S-S (L2)</text>
            <path d="M 235,41 Q 200,58 145,72" fill="none" stroke="#7F77DD" strokeWidth="1.5" />
            <text x="205" y="62" fontSize="7" fill="#534AB7" fontWeight="700">XL (L3)</text>
          </svg>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
            <span className="badge" style={{ background: '#FFCDD2', color: '#7F0000', borderColor: '#E53935' }}>S-S intrachain (L2)</span>
            <span className="badge" style={{ background: '#EEEDFE', color: '#3C3489', borderColor: '#AFA9EC' }}>XL interchain (L3)</span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-title">PTM / modification matrix <span className="badge new">new</span></div>
        <div className="card-desc">Confirmed / predicted / flagged PTMs across residue ranges for TFR-001 leads.</div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead><tr><th>Modification</th><th>[1–50]</th><th>[51–150]</th><th>[151–250]</th><th>[251–350]</th><th>Unknown site</th><th>Layer</th></tr></thead>
            <tbody>
              <tr>
                <td>Disulfide</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ background: '#C8E6C9', color: '#1B5E20', textAlign: 'center', fontWeight: 600 }}>✓ Res 23</td>
                <td style={{ background: '#C8E6C9', color: '#1B5E20', textAlign: 'center', fontWeight: 600 }}>✓ Res 96</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td><span className="badge" style={{ background: '#FFF9C4', color: '#6D5300', borderColor: '#F9C200' }}>L2</span></td>
              </tr>
              <tr>
                <td>N-glycosylation</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ background: '#C8E6C9', color: '#1B5E20', textAlign: 'center', fontWeight: 600 }}>✓ Asn317</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td><span className="badge" style={{ background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' }}>L4</span></td>
              </tr>
              <tr>
                <td>Lys ADC coupling</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ background: '#FFF9C4', color: '#6D5300', textAlign: 'center' }}>? predicted</td>
                <td style={{ background: '#FFCDD2', color: '#7F0000', textAlign: 'center', fontWeight: 600 }}>! flag</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ background: '#FFF9C4', color: '#6D5300', textAlign: 'center' }}>Lys coupling</td>
                <td><span className="badge" style={{ background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' }}>L5</span></td>
              </tr>
              <tr>
                <td>Click chemistry ring</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ background: '#FFF9C4', color: '#6D5300', textAlign: 'center' }}>? in design</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td style={{ textAlign: 'center', color: '#ccc' }}>—</td>
                <td><span className="badge" style={{ background: '#E6F1FB', color: '#0C447C', borderColor: '#85B7EB' }}>L3 ring</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================== BIOPHYSICS ============================== */
function BiophysicsPanel({ sub, onSub }) {
  const devPts = useMemo(() => leads.map((l) => {
    const b = getBestRun(l);
    return b ? {
      x: b.r.kd, y: b.r.sec, r: Math.max(3, b.r.agg / 2), agg: b.r.agg, name: l.name,
    } : null;
  }).filter(Boolean), []);

  const cbp1Data = useMemo(() => ({
    datasets: [
      { label: 'SEC ≥90%', data: devPts.filter((p) => p.y >= 90), backgroundColor: GF, borderColor: G, borderWidth: 1.5 },
      { label: 'SEC 80–90%', data: devPts.filter((p) => p.y >= 80 && p.y < 90), backgroundColor: AF, borderColor: A, borderWidth: 1.5 },
      { label: 'SEC <80%', data: devPts.filter((p) => p.y < 80), backgroundColor: RF, borderColor: R, borderWidth: 1.5 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [devPts]);

  const cbp1Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { type: 'logarithmic', min: 0.5, max: 20, title: { display: true, text: 'Best KD (nM)', ...FONT9 }, ticks: FONT8 },
      y: { min: 60, max: 100, title: { display: true, text: 'Best SEC %', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const { secCounts, aggCounts, secSelect, aggSelect } = useMemo(() => {
    const allSEC = []; const allAgg = [];
    leads.forEach((l) => l.runs.forEach((r) => {
      if (r.sec != null) allSEC.push(r.sec);
      if (r.agg != null) allAgg.push(r.agg);
    }));
    const secC = [0, 0, 0, 0, 0, 0];
    allSEC.forEach((v) => {
      if (v < 70) secC[0] += 1;
      else if (v < 80) secC[1] += 1;
      else if (v < 85) secC[2] += 1;
      else if (v < 90) secC[3] += 1;
      else if (v < 95) secC[4] += 1;
      else secC[5] += 1;
    });
    const aggC = [0, 0, 0, 0, 0];
    allAgg.forEach((v) => {
      if (v < 5) aggC[0] += 1;
      else if (v < 10) aggC[1] += 1;
      else if (v < 20) aggC[2] += 1;
      else if (v < 30) aggC[3] += 1;
      else aggC[4] += 1;
    });
    const secRanges = [[0, 70], [70, 80], [80, 85], [85, 90], [90, 95], [95, 200]];
    const aggRanges = [[0, 5], [5, 10], [10, 20], [20, 30], [30, 200]];
    const namesFor = (ranges, key) => ranges.map(([lo, hi]) => {
      const names = [];
      leads.forEach((l) => {
        if (l.runs.some((r) => r[key] != null && r[key] >= lo && r[key] < hi)) names.push(l.name);
      });
      return names;
    });
    return { secCounts: secC, aggCounts: aggC, secSelect: namesFor(secRanges, 'sec'), aggSelect: namesFor(aggRanges, 'agg') };
  }, []);

  const cbp2Data = useMemo(() => ({
    labels: ['<70', '70–80', '80–85', '85–90', '90–95', '>95'],
    datasets: [{
      data: secCounts,
      backgroundColor: ['#FFCDD2', '#FFCDD2', '#FFF9C4', '#FFF9C4', '#C8E6C9', '#C8E6C9'],
      borderColor: [R, R, A, A, G, G],
      borderWidth: 1.5,
      selectNames: secSelect,
    }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [secCounts, secSelect]);

  const cbp2Options = useMemo(() => ({
    scales: { x: { ticks: FONT8 }, y: { title: { display: true, text: '# runs', ...FONT9 }, ticks: FONT8 } },
  }), []);

  const cbp3Data = useMemo(() => ({
    labels: ['<5', '5–10', '10–20', '20–30', '>30'],
    datasets: [{
      data: aggCounts,
      backgroundColor: ['#C8E6C9', '#C8E6C9', '#FFF9C4', '#FFCDD2', '#FFCDD2'],
      borderColor: [G, G, A, R, R],
      borderWidth: 1.5,
      selectNames: aggSelect,
    }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [aggCounts, aggSelect]);

  const cbp3Options = useMemo(() => ({
    scales: { x: { ticks: FONT8 }, y: { title: { display: true, text: '# runs', ...FONT9 }, ticks: FONT8 } },
  }), []);

  return (
    <div>
      <div className="subtabrow">
        <div className={`stab${sub === 'bp-a' ? ' active' : ''}`} onClick={() => onSub('bp-a')}>A — Biophysical passport</div>
        <div className={`stab${sub === 'bp-b' ? ' active' : ''}`} onClick={() => onSub('bp-b')}>B — Developability scatter</div>
        <div className={`stab${sub === 'bp-c' ? ' active' : ''}`} onClick={() => onSub('bp-c')}>C — SEC &amp; aggregation</div>
      </div>

      {sub === 'bp-a' && (
        <div className="card">
          <div className="card-title">Biophysical passport — a-hTfR1 iso_326 (best lead, Run B)</div>
          <div style={{
            display: 'flex', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap',
          }}
          >
            <svg viewBox="0 0 120 120" width="120" height="120" style={{ flexShrink: 0 }}>
              <polygon points="60,8 104,34 104,86 60,112 16,86 16,34" fill="none" stroke="#ddd" strokeWidth="1" />
              <polygon points="60,22 90,39 90,81 60,98 30,81 30,39" fill="none" stroke="#eee" strokeWidth="0.7" />
              <polygon points="60,12 100,36 96,83 60,108 24,83 20,36" fill="#C8E6C9" stroke="#2E7D32" strokeWidth="1.5" fillOpacity="0.5" />
              <circle cx="60" cy="60" r="3" fill="#2E7D32" />
              <text x="60" y="5" textAnchor="middle" fontSize="7" fill="#aaa">SEC%</text>
              <text x="108" y="36" fontSize="7" fill="#aaa">KD</text>
              <text x="108" y="88" fontSize="7" fill="#aaa">t½</text>
              <text x="60" y="119" textAnchor="middle" fontSize="7" fill="#aaa">Agg%</text>
              <text x="2" y="88" fontSize="7" fill="#aaa">Mac KD</text>
              <text x="2" y="36" fontSize="7" fill="#aaa">Titer</text>
            </svg>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div className="grow"><span className="gmetric">Analytical SEC %</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '94%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>94%</span></div>
              <div className="grow"><span className="gmetric">% Aggregation</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '2%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>2%</span></div>
              <div className="grow"><span className="gmetric">hTfR1 KD (nM)</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '98%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>0.979</span></div>
              <div className="grow"><span className="gmetric">Mac TfR1 KD (nM)</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '98%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>1.979</span></div>
              <div className="grow"><span className="gmetric">t½ (min)</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '96%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>47.9</span></div>
              <div className="grow"><span className="gmetric">Best titer (g/L)</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '90%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>0.89</span></div>
              <div className="grow"><span className="gmetric">% Blockade</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '84%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>83.9%</span></div>
              <div className="grow"><span className="gmetric">Mac/Hu KD ratio</span><div className="gbar-bg"><div className="gbar-fill" style={{ width: '90%', background: '#2E7D32' }} /></div><span className="gval" style={{ color: '#1B5E20' }}>2.02&times;</span></div>
            </div>
          </div>
        </div>
      )}

      {sub === 'bp-b' && (
        <div className="card">
          <div className="card-title">Developability — KD vs aggregation (all runs, all leads)</div>
          <div className="card-desc">X = best KD (nM) &middot; Y = best SEC% &middot; bubble size = % aggregation &middot; color = combined flag</div>
          <ChartCanvas id="cbp1" type="bubble" data={cbp1Data} options={cbp1Options} height={300} />
        </div>
      )}

      {sub === 'bp-c' && (
        <div className="g2">
          <div className="card">
            <div className="card-title">SEC purity distribution across runs</div>
            <ChartCanvas id="cbp2" type="bar" data={cbp2Data} options={cbp2Options} height={220} />
            <div className="tl-row"><span className="tl g">≥90%</span><span className="tl a">80–90%</span><span className="tl r">&lt;80%</span></div>
          </div>
          <div className="card">
            <div className="card-title">Aggregation % distribution across runs</div>
            <ChartCanvas id="cbp3" type="bar" data={cbp3Data} options={cbp3Options} height={220} />
            <div className="tl-row"><span className="tl g">&lt;10%</span><span className="tl a">10–20%</span><span className="tl r">&gt;20%</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== BIOACTIVITY ============================== */
function BioactivityPanel({
  sub, onSub, xlAssayFilter, setXlAssayFilter,
}) {
  const leadNames = useMemo(() => leads.map((l) => l.name.replace('a-hTfR1_iso_', 'iso_')), []);
  const bestHLs = useMemo(() => leads.map((l) => {
    const b = getBestRun(l);
    return b ? b.r.hl : null;
  }), []);

  const cba1Data = useMemo(() => ({
    datasets: [
      {
        label: 't½>30',
        data: leads.map((l) => {
          const b = getBestRun(l);
          return b && b.r.hl > 30 ? { x: b.r.kd, y: b.r.hl, name: l.name } : null;
        }).filter(Boolean),
        backgroundColor: GF,
        borderColor: G,
        pointRadius: 7,
        pointBorderWidth: 2,
      },
      {
        label: 't½ 10–30',
        data: leads.map((l) => {
          const b = getBestRun(l);
          return b && b.r.hl >= 10 && b.r.hl <= 30 ? { x: b.r.kd, y: b.r.hl, name: l.name } : null;
        }).filter(Boolean),
        backgroundColor: AF,
        borderColor: A,
        pointRadius: 7,
        pointBorderWidth: 2,
      },
      {
        label: 't½<10',
        data: leads.map((l) => {
          const b = getBestRun(l);
          return b && b.r.hl < 10 ? { x: b.r.kd, y: b.r.hl, name: l.name } : null;
        }).filter(Boolean),
        backgroundColor: RF,
        borderColor: R,
        pointRadius: 7,
        pointBorderWidth: 2,
      },
    ],
  }), []);

  const cba1Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { type: 'logarithmic', min: 0.5, max: 20, title: { display: true, text: 'Best KD (nM)', ...FONT9 }, ticks: FONT8 },
      y: { title: { display: true, text: 'Best t½ (min)', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const cba2Data = useMemo(() => {
    const scrMap = {};
    screening.forEach((s) => { scrMap[s.name] = s; });
    return {
      datasets: [1, 2, 3, 4, 5].map((c) => ({
        label: `Cluster ${c}`,
        data: leads.filter((l) => scrMap[l.name] && scrMap[l.name].c === c).map((l) => {
          const b = getBestRun(l);
          const s = scrMap[l.name];
          return b && s ? { x: b.r.kd, y: s.block, name: l.name } : null;
        }).filter(Boolean),
        backgroundColor: `${clusterColors[c]}55`,
        borderColor: clusterColors[c],
        pointRadius: 6,
        pointBorderWidth: 1.5,
      })),
    };
  }, []);

  const cba2Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { type: 'logarithmic', min: 0.5, max: 20, title: { display: true, text: 'Best KD (nM)', ...FONT9 }, ticks: FONT8 },
      y: { min: 50, max: 100, title: { display: true, text: '% Blockade', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const cba3Data = useMemo(() => ({
    labels: leadNames,
    datasets: [{
      data: bestHLs,
      backgroundColor: bestHLs.map((v) => (v == null ? '#eee' : v > 30 ? GF : v > 10 ? AF : RF)),
      borderColor: bestHLs.map((v) => (v == null ? '#ccc' : v > 30 ? G : v > 10 ? A : R)),
      borderWidth: 1.5,
      selectNames: leads.map((l) => [l.name]),
    }],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [leadNames, bestHLs]);

  const cba3Options = useMemo(() => ({
    scales: {
      x: { ticks: { font: { size: 11 }, maxRotation: 45 } },
      y: { title: { display: true, text: 'Best t½ (min)', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const cba4Data = useMemo(() => {
    const xsDs = leads.map((l, i) => {
      const lc = `hsl(${i * 24},55%,42%)`;
      return {
        label: l.name.replace('a-hTfR1_iso_', 'iso_'),
        data: l.runs.map((r, ri) => (r.kd != null ? { x: ri, y: r.kd, name: l.name } : null)).filter(Boolean),
        borderColor: lc,
        pointRadius: 2,
        tension: 0.3,
        fill: false,
      };
    });
    const xsMac = leads.map((l, i) => {
      const lc = `hsl(${i * 24},55%,42%)`;
      return {
        data: l.runs.map((r, ri) => (r.mac != null ? { x: ri, y: r.mac, name: l.name } : null)).filter(Boolean),
        borderColor: lc,
        borderDash: [3, 2],
        pointRadius: 2,
        tension: 0.3,
        fill: false,
        label: null,
      };
    });
    return { datasets: xsDs.concat(xsMac) };
  }, []);

  const cba4Options = useMemo(() => ({
    plugins: { legend: { display: false } },
    scales: {
      x: {
        min: 0,
        max: 6,
        ticks: { font: { size: 11 }, callback: (v) => runLabels[v] || v },
        title: { display: true, text: 'Solid=human, dashed=macaque', ...FONT9 },
      },
      y: { type: 'logarithmic', title: { display: true, text: 'KD (nM)', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const cbaXl1Data = useMemo(() => ({
    labels: ['Monovalent', 'Bivalent (Ab)', '2° Ab amplified', 'Chemical XL', 'Click chemistry'],
    datasets: [{
      data: [1.8, 0.9, 0.6, 0.4, 2.1],
      backgroundColor: [GF, GF, GF, GF, AF],
      borderColor: [G, G, G, G, A],
      borderWidth: 1.5,
    }],
  }), []);

  const cbaXl1Options = useMemo(() => ({
    scales: {
      x: { ticks: { font: { size: 11 }, maxRotation: 20 } },
      y: { type: 'logarithmic', title: { display: true, text: 'KD (nM)', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  // Computed once (mirrors original one-time Math.random() sampling at page load)
  const shiftPts = useMemo(() => leads.slice(0, 8).map((l) => {
    const b = getBestRun(l);
    return b ? { x: b.r.kd, y: b.r.kd * (0.3 + Math.random() * 0.4), id: l.name, name: l.name } : null;
  }).filter(Boolean), []);

  const cbaXl2Data = useMemo(() => ({
    datasets: [
      { label: 'Avidity enhanced', data: shiftPts.filter((p) => p.y < p.x * 0.5), backgroundColor: GF, borderColor: G, pointRadius: 7, pointBorderWidth: 2 },
      { label: 'Moderate', data: shiftPts.filter((p) => p.y >= p.x * 0.5 && p.y < p.x * 0.85), backgroundColor: AF, borderColor: A, pointRadius: 7, pointBorderWidth: 2 },
      { label: 'Minimal avidity', data: shiftPts.filter((p) => p.y >= p.x * 0.85), backgroundColor: RF, borderColor: R, pointRadius: 7, pointBorderWidth: 2 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [shiftPts]);

  const cbaXl2Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { type: 'logarithmic', title: { display: true, text: 'Monovalent KD (nM)', ...FONT9 }, ticks: FONT8 },
      y: { type: 'logarithmic', title: { display: true, text: 'Best crosslinked KD (nM)', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const xlChips = ['All mechanisms', 'Bivalent (Ab-mediated)', 'Secondary Ab amplified', 'Chemical crosslinking', 'Click chemistry', 'None (monovalent)'];

  return (
    <div>
      <div className="subtabrow">
        <div className={`stab${sub === 'ba-std' ? ' active' : ''}`} onClick={() => onSub('ba-std')}>Standard readouts</div>
        <div
          className={`stab${sub === 'ba-xl' ? ' active' : ''}`}
          onClick={() => onSub('ba-xl')}
          style={{
            background: '#EAF3DE', color: '#1B5E20', borderColor: '#66BB6A', fontWeight: 600,
          }}
        >
          Crosslink assay context
        </div>
      </div>

      {sub === 'ba-std' && (
        <div>
          <div className="g2">
            <div className="card">
              <div className="card-title">KD vs t½ — lead panel</div>
              <div className="card-desc">X = best KD &middot; Y = best t½ &middot; ideal = lower-left &middot; color = t½ traffic-light</div>
              <ChartCanvas id="cba1" type="scatter" data={cba1Data} options={cba1Options} height={240} />
              <div className="tl-row"><span className="tl g">t½ &gt;30 min</span><span className="tl a">10–30 min</span><span className="tl r">&lt;10 min</span></div>
            </div>
            <div className="card">
              <div className="card-title">% Blockade vs KD — lead panel</div>
              <div className="card-desc">X = best KD &middot; Y = % blockade from screening &middot; color = cluster</div>
              <ChartCanvas id="cba2" type="scatter" data={cba2Data} options={cba2Options} height={240} />
            </div>
          </div>
          <div className="g2">
            <div className="card">
              <div className="card-title">Half-life by clone — best run per lead</div>
              <ChartCanvas id="cba3" type="bar" data={cba3Data} options={cba3Options} height={220} />
            </div>
            <div className="card">
              <div className="card-title">Cross-species KD trend across runs</div>
              <ChartCanvas id="cba4" type="line" data={cba4Data} options={cba4Options} height={220} />
            </div>
          </div>
        </div>
      )}

      {sub === 'ba-xl' && (
        <div>
          <div className="card" style={{ marginBottom: 10 }}>
            <div className="card-title">Crosslink assay context filter <span className="badge new">new</span></div>
            <div className="card-desc" style={{ marginBottom: 8 }}>Filter functional readouts by the crosslinking mechanism used in the assay. Reveals avidity-dependent potency shifts.</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {xlChips.map((chip) => (
                <span
                  key={chip}
                  className={`assay-chip${xlAssayFilter === chip ? ' sel' : ''}`}
                  onClick={() => setXlAssayFilter(chip)}
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
          <div className="g2">
            <div className="card">
              <div className="card-title">KD shift by crosslink mechanism <span className="badge new">new</span></div>
              <div className="card-desc">Same leads, different assay crosslink conditions — avidity-driven potency differences on hTfR1.</div>
              <ChartCanvas id="cba-xl1" type="bar" data={cbaXl1Data} options={cbaXl1Options} height={240} />
              <div className="tl-row"><span className="tl g">KD &lt;2 nM</span><span className="tl a">2–10 nM</span><span className="tl r">&gt;10 nM</span></div>
            </div>
            <div className="card">
              <div className="card-title">Monovalent vs crosslinked KD <span className="badge new">new</span></div>
              <div className="card-desc">X = monovalent KD &middot; Y = best crosslinked KD &middot; below diagonal = avidity enhancement.</div>
              <ChartCanvas id="cba-xl2" type="scatter" data={cbaXl2Data} options={cbaXl2Options} height={240} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== PRODUCTION ============================== */
function ProductionPanel({
  sub, onSub, runAbFilter, setRunAbFilter, openProfile,
}) {
  const titerSecPts = useMemo(() => {
    const pts = [];
    leads.forEach((l) => l.runs.forEach((r) => {
      const t = avgT(r);
      if (t && t > 0.05 && r.sec) {
        pts.push({ x: parseFloat(t.toFixed(3)), y: r.sec, r: Math.max(3, r.agg / 4), sec: r.sec, name: l.name, agg: r.agg });
      }
    }));
    return pts;
  }, []);

  const cp1Data = useMemo(() => ({
    datasets: [
      { label: 'SEC ≥90%', data: titerSecPts.filter((d) => d.sec >= 90), backgroundColor: GF, borderColor: G, borderWidth: 1.5 },
      { label: 'SEC 80–90%', data: titerSecPts.filter((d) => d.sec >= 80 && d.sec < 90), backgroundColor: AF, borderColor: A, borderWidth: 1.5 },
      { label: 'SEC <80%', data: titerSecPts.filter((d) => d.sec < 80), backgroundColor: RF, borderColor: R, borderWidth: 1.5 },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [titerSecPts]);

  const cp1Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { title: { display: true, text: 'Avg titer (g/L)', ...FONT9 }, ticks: FONT8 },
      y: { min: 10, max: 100, title: { display: true, text: 'SEC % purity', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const leadNames = useMemo(() => leads.map((l) => l.name.replace('a-hTfR1_iso_', 'iso_')), []);

  const aggBest2 = useMemo(() => leads.map((l) => Math.min(...l.runs.map((r) => (r.agg != null ? r.agg : 999)).filter((v) => v < 999))), []);
  const aggWorst2 = useMemo(() => leads.map((l) => Math.max(...l.runs.map((r) => (r.agg != null ? r.agg : 0)))), []);

  const cp2Data = useMemo(() => ({
    labels: leadNames,
    datasets: [
      {
        label: 'Best agg%', data: aggBest2, backgroundColor: aggBest2.map((v) => (v < 10 ? GF : v < 20 ? AF : RF)), borderColor: aggBest2.map((v) => (v < 10 ? G : v < 20 ? A : R)), borderWidth: 1.5, selectNames: leads.map((l) => [l.name]),
      },
      {
        label: 'Worst agg%', data: aggWorst2, type: 'line', borderColor: '#999', pointRadius: 3, borderDash: [3, 3], fill: false, selectNames: leads.map((l) => [l.name]),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [leadNames, aggBest2, aggWorst2]);

  const cp2Options = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: { ticks: { font: { size: 11 }, maxRotation: 45 } },
      y: { title: { display: true, text: 'Aggregation %', ...FONT9 }, ticks: FONT8 },
    },
  }), []);

  const runRows = useMemo(() => {
    const rows = [];
    leads.forEach((l) => {
      if (runAbFilter !== 'all' && l.name !== runAbFilter) return;
      l.runs.forEach((r, ri) => {
        const t = avgT(r);
        rows.push({
          key: `${l.name}-${ri}`,
          fullName: l.name,
          name: l.name.replace('a-hTfR1_iso_', 'iso_'),
          tpr: r.tpr || '—',
          run: runLabels[ri],
          t1: r.t1 != null ? r.t1.toFixed(3) : '—',
          t2: r.t2 != null ? r.t2.toFixed(3) : '—',
          t3: r.t3 != null ? r.t3.toFixed(3) : '—',
          sec: r.sec,
          agg: r.agg,
          kd: r.kd,
          hl: r.hl,
          t,
        });
      });
    });
    return rows;
  }, [runAbFilter]);

  return (
    <div>
      <div className="subtabrow">
        <div className={`stab${sub === 'pr-a' ? ' active' : ''}`} onClick={() => onSub('pr-a')}>A — Titer vs SEC</div>
        <div className={`stab${sub === 'pr-b' ? ' active' : ''}`} onClick={() => onSub('pr-b')}>B — Aggregation profile</div>
        <div className={`stab${sub === 'pr-c' ? ' active' : ''}`} onClick={() => onSub('pr-c')}>C — Run table</div>
      </div>

      {sub === 'pr-a' && (
        <div className="card">
          <div className="card-title">Titer vs SEC purity — all runs</div>
          <div className="card-desc">X = avg titer (g/L) &middot; Y = SEC % purity &middot; bubble size = % aggregation &middot; color = SEC traffic-light</div>
          <ChartCanvas id="cp1" type="bubble" data={cp1Data} options={cp1Options} height={320} />
          <div className="tl-row"><span className="tl g">SEC ≥90%</span><span className="tl a">80–90%</span><span className="tl r">&lt;80%</span></div>
        </div>
      )}

      {sub === 'pr-b' && (
        <div className="card">
          <div className="card-title">Aggregation range — best vs worst run per lead</div>
          <ChartCanvas id="cp2" type="bar" data={cp2Data} options={cp2Options} height={300} />
          <div className="tl-row"><span className="tl g">Best agg &lt;10%</span><span className="tl a">10–20%</span><span className="tl r">&gt;20%</span></div>
        </div>
      )}

      {sub === 'pr-c' && (
        <div className="card">
          <div className="card-title">Run-by-run production table</div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            <select value={runAbFilter} onChange={(e) => setRunAbFilter(e.target.value)}>
              <option value="all">All antibodies</option>
              {leads.map((l) => (
                <option key={l.name} value={l.name}>{l.name.replace('a-hTfR1_iso_', 'iso_')}</option>
              ))}
            </select>
          </div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead>
                <tr><th>Name</th><th>TPR ID</th><th>Run</th><th>Titer R1</th><th>Titer R2</th><th>Titer R3</th><th>SEC %</th><th>Agg %</th><th>KD (nM)</th><th>t½ (min)</th></tr>
              </thead>
              <tbody>
                {runRows.map((row) => (
                  <MoleculeRow key={row.key} name={row.fullName} openOnClick={false}>
                    <td onClick={() => openProfile(row.fullName)}>{row.name}</td>
                    <td>{row.tpr}</td>
                    <td>{row.run}</td>
                    <td>{row.t1}</td>
                    <td>{row.t2}</td>
                    <td>{row.t3}</td>
                    <td className={secClass(row.sec)}>{fmt(row.sec, 0)}%</td>
                    <td className={aggClass(row.agg)}>{fmt(row.agg, 0)}%</td>
                    <td className={kdClass(row.kd)}>{fmt(row.kd)}</td>
                    <td className={hlClass(row.hl)}>{fmt(row.hl, 1)}</td>
                  </MoleculeRow>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== REGISTRATION ============================== */
function RegistrationPanel({
  sub, onSub, layers, setLayers,
}) {
  const toggleLayer = (num) => setLayers((prev) => ({ ...prev, [num]: !prev[num] }));

  return (
    <div>
      <div className="subtabrow">
        <div className={`stab${sub === 'reg-a' ? ' active' : ''}`} onClick={() => onSub('reg-a')}>Uniqueness layers</div>
        <div className={`stab${sub === 'reg-b' ? ' active' : ''}`} onClick={() => onSub('reg-b')}>Clash detection</div>
        <div className={`stab${sub === 'reg-c' ? ' active' : ''}`} onClick={() => onSub('reg-c')}>Modification types</div>
      </div>

      {sub === 'reg-a' && (
        <div className="g2">
          <div className="card">
            <div className="card-title">Uniqueness layer control <span className="badge new">new</span></div>
            <div className="card-desc" style={{ marginBottom: 10 }}>Configure which crosslink layers contribute to uniqueness at registration. Default excludes disulfides.</div>
            <div style={{ border: '1px solid #e5e5e5', borderRadius: 8, overflow: 'hidden' }}>
              <div className="layer-row" style={{ background: '#f5f5f3' }}>
                <div className="layer-num" style={{ background: '#2E7D32' }}>1</div>
                <div className="layer-name">Sequences</div>
                <div className="layer-desc">VH, VL chain sequences</div>
                <div className="tog-wrap"><div className="tog on" /><span>Always on</span></div>
              </div>
              {[
                { num: 2, name: 'Disulfide crosslinks', desc: 'Optional — default off for IgGs', color: '#F9C200', textColor: '#333' },
                { num: 3, name: 'Other sequence crosslinks', desc: 'Non-disulfide XL · ring-forming (click)', color: '#7F77DD' },
                { num: 4, name: 'Chemical components', desc: 'PTMs, glycosylation, modifications', color: '#1D9E75' },
                { num: 5, name: 'XL to chemical components', desc: 'ADC, Lys coupling, bicyclic crosslinks', color: '#D85A30' },
              ].map((layer) => (
                <div className="layer-row" key={layer.num}>
                  <div className="layer-num" style={{ background: layer.color, color: layer.textColor }}>{layer.num}</div>
                  <div className="layer-name">{layer.name}</div>
                  <div className="layer-desc">{layer.desc}</div>
                  <div className="tog-wrap">
                    <div className={`tog${layers[layer.num] ? ' on' : ''}`} onClick={() => toggleLayer(layer.num)} />
                    <span>{layers[layer.num] ? 'On' : 'Off'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-title">Live uniqueness key preview <span className="badge mod">live</span></div>
            <div className="card-desc" style={{ marginBottom: 6 }}>Key for iso_326. Color segments = layers. Descriptive and atomic forms resolve to same key.</div>
            <div className="key-preview">
              <span className="kl kl1">VH_16_4$VL_16_4</span> &middot;{' '}
              <span className="kl kl2" style={{ opacity: layers[2] ? 1 : 0.3 }}>— (disulfide off)</span> &middot;{' '}
              <span className="kl kl3" style={{ opacity: layers[3] ? 1 : 0.3 }}>23:R3-45:R3</span> &middot;{' '}
              <span className="kl kl4" style={{ opacity: layers[4] ? 1 : 0.3 }}>GlcNAc:R1-317:R3</span> &middot;{' '}
              <span className="kl kl5" style={{ opacity: layers[5] ? 1 : 0.3 }}>Linker:R1-Lys:[unspec]</span>
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
              <span className="badge" style={{ background: '#C8E6C9', color: '#1B5E20', borderColor: '#66BB6A' }}>L1 sequences</span>
              <span className="badge" style={{ background: '#FFF9C4', color: '#6D5300', borderColor: '#F9C200' }}>L2 disulfide</span>
              <span className="badge" style={{ background: '#E6F1FB', color: '#0C447C', borderColor: '#85B7EB' }}>L3 XL</span>
              <span className="badge" style={{ background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' }}>L4 chem</span>
              <span className="badge" style={{ background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' }}>L5 XL-chem</span>
            </div>
          </div>
        </div>
      )}

      {sub === 'reg-b' && (
        <div className="card">
          <div className="card-title">Duplicate / clash detection <span className="badge new">new</span></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Candidate A</th><th>Form A</th><th>Candidate B</th><th>Form B</th><th>Matching layers</th><th>Status</th></tr></thead>
              <tbody>
                <MoleculeRow name="a-hTfR1_iso_326"><td>iso_326</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>Descriptive</span></td><td>iso_326-r</td><td><span className="badge mod">Atomic</span></td><td>L1, L3, L4, L5</td><td><span className="tl r">Duplicate</span></td></MoleculeRow>
                <MoleculeRow name="a-hTfR1_iso_199"><td>iso_199</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>Descriptive</span></td><td>iso_741-v2</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>Descriptive</span></td><td>L1 only</td><td><span className="tl a">Seq match, PTMs differ</span></td></MoleculeRow>
                <MoleculeRow name="a-hTfR1_iso_501"><td>iso_501</td><td><span className="badge mod">Atomic</span></td><td>iso_289</td><td><span className="badge mod">Atomic</span></td><td>L1, L3</td><td><span className="tl a">XL match, no PTM data</span></td></MoleculeRow>
                <MoleculeRow name="a-hTfR1_iso_741"><td>iso_741</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>Descriptive</span></td><td>iso_741-x</td><td><span className="badge mod">Atomic</span></td><td>L1, L2, L3, L4, L5</td><td><span className="tl g">Unique</span></td></MoleculeRow>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sub === 'reg-c' && (
        <div className="card">
          <div className="card-title">Modification type library <span className="badge mod">configurable</span></div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>Type</th><th>Source</th><th>Monomer</th><th>R-label connection</th><th>Default layer</th><th>Ring-forming</th><th>Contributes to uniqueness</th></tr></thead>
              <tbody>
                <tr><td>Disulfide</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>OOTB</span></td><td>—</td><td>R3–R3</td><td><span className="badge" style={{ background: '#FFF9C4', color: '#6D5300', borderColor: '#F9C200' }}>L2</span></td><td>No</td><td><span className="tl a">Optional (off)</span></td></tr>
                <tr><td>N-glycosylation</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>OOTB</span></td><td>GlcNAc</td><td>GlcNAc:R1 – Asn:R3</td><td><span className="badge" style={{ background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' }}>L4</span></td><td>No</td><td><span className="tl g">Yes</span></td></tr>
                <tr><td>Peptide bond</td><td><span className="badge" style={{ background: '#f0f0f0', color: '#555', border: '1px solid #ddd' }}>OOTB</span></td><td>—</td><td>R1–R2 (sequence)</td><td><span className="badge" style={{ background: '#C8E6C9', color: '#1B5E20', borderColor: '#66BB6A' }}>L1</span></td><td>No</td><td><span className="tl g">Yes</span></td></tr>
                <tr><td>Lys ADC coupling</td><td><span className="badge new">Admin</span></td><td>Linker</td><td>Linker:R1 – Lys:[unspec]</td><td><span className="badge" style={{ background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' }}>L5</span></td><td>No</td><td><span className="tl a">Partial (site unknown)</span></td></tr>
                <tr><td>Click chemistry ring</td><td><span className="badge new">Admin</span></td><td>Ring linker</td><td>R1–R3 (forms ring)</td><td><span className="badge" style={{ background: '#E6F1FB', color: '#0C447C', borderColor: '#85B7EB' }}>L3</span></td><td><span style={{ color: '#0C447C', fontWeight: 600 }}>Yes</span></td><td><span className="tl g">Yes</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================== COMPARE ============================== */
function ComparePanel({ openProfile }) {
  const { has, select } = useSelection();
  const cols = [
    { name: 'a-hTfR1_iso_326', label: 'iso_326 ↗', top: true },
    { name: 'a-hTfR1_iso_199', label: 'iso_199' },
    { name: 'a-hTfR1_iso_741', label: 'iso_741' },
    { name: 'a-hTfR1_iso_289', label: 'iso_289' },
    { name: 'a-hTfR1_iso_501', label: 'iso_501' },
  ];
  const headerClick = (name, e) => {
    const additive = e.shiftKey || e.metaKey || e.ctrlKey;
    select([name], { additive });
    if (!additive) openProfile(name);
  };
  return (
    <div className="card">
      <div className="card-title">Multi-molecule comparison — top 5 leads head-to-head</div>
      <div className="card-desc">Click column header to open molecule profile. Crosslink registration status included.</div>
      <div className="mc-wrap">
        <table className="mc-table">
          <thead>
            <tr>
              <th className="lbl">Metric</th>
              {cols.map((col) => (
                <th
                  key={col.name}
                  className={`${col.top ? 'top' : ''}${has(col.name) ? ' sel' : ''}`}
                  onClick={(e) => headerClick(col.name, e)}
                  style={{ cursor: 'pointer' }}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
        <tr><td className="sect" colSpan={6}>Binding & potency</td></tr>
        <tr><td className="lbl">Screen KD (nM)</td><td className="g">0.879</td><td className="g">0.931</td><td className="g">0.863</td><td className="g">0.966</td><td className="g">0.806</td></tr>
        <tr><td className="lbl">Best run KD (nM)</td><td className="g">0.929</td><td className="g">0.981</td><td className="g">0.913</td><td className="g">1.016</td><td className="g">0.856</td></tr>
        <tr><td className="lbl">% Blockade</td><td className="g">83.9%</td><td className="g">86.0%</td><td className="g">88.8%</td><td className="g">90.9%</td><td className="g">91.4%</td></tr>
        <tr><td className="lbl">Mac KD (nM)</td><td className="g">1.929</td><td className="g">2.631</td><td className="g">1.513</td><td className="a">3.616</td><td className="a">3.456</td></tr>
        <tr><td className="lbl">Mac/Hu ratio</td><td className="g">2.1×</td><td className="g">2.7×</td><td className="g">1.7×</td><td className="a">3.6×</td><td className="a">4.0×</td></tr>
        <tr><td className="sect" colSpan={6}>Developability</td></tr>
        <tr><td className="lbl">Best SEC %</td><td className="g">94%</td><td className="g">95%</td><td className="g">95%</td><td className="g">94%</td><td className="g">95%</td></tr>
        <tr><td className="lbl">Best agg %</td><td className="g">2%</td><td className="g">2%</td><td className="g">3%</td><td className="g">5%</td><td className="g">2%</td></tr>
        <tr><td className="lbl">Best t½ (min)</td><td className="g">47.9</td><td className="g">49.3</td><td className="g">48.2</td><td className="a">27.4</td><td className="a">13.8</td></tr>
        <tr><td className="sect" colSpan={6}>Crosslinks registered</td></tr>
        <tr><td className="lbl">Disulfide (L2)</td><td className="a">Confirmed (off)</td><td className="a">Confirmed (off)</td><td className="a">Confirmed (off)</td><td className="a">Confirmed (off)</td><td className="a">Confirmed (off)</td></tr>
        <tr><td className="lbl">Glyco (L4)</td><td className="g">Asn317 confirmed</td><td className="g">Asn317 confirmed</td><td className="g">Asn317 confirmed</td><td className="a">Predicted only</td><td className="a">Predicted only</td></tr>
        <tr><td className="lbl">Lys coupling (L5)</td><td className="r">Site unknown</td><td className="r">Site unknown</td><td className="a">Partial</td><td className="r">None</td><td className="r">None</td></tr>
        <tr><td className="sect" colSpan={6}>Production</td></tr>
        <tr><td className="lbl">Best titer (g/L)</td><td className="g">0.89</td><td className="g">1.09</td><td className="g">0.96</td><td className="a">0.49</td><td className="a">0.87</td></tr>
        <tr><td className="lbl" style={{fontWeight:700}}>Overall</td><td className="g" style={{fontWeight:700}}>Lead</td><td className="g" style={{fontWeight:700}}>Lead</td><td className="g" style={{fontWeight:700}}>Lead</td><td className="a" style={{fontWeight:700}}>Backup</td><td className="a" style={{fontWeight:700}}>Backup</td></tr>
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
        <button type="button" onClick={() => sendPrompt('Generate a lead selection rationale for iso_326 and iso_199 from the TFR-001 program ↗')}>Generate lead selection rationale ↗</button>
        <button type="button" onClick={() => sendPrompt('What experiments should I run to resolve the Lys ADC coupling site on iso_326? ↗')}>Resolve ADC linker site ↗</button>
      </div>
    </div>
  );
}

/* ============================== PROFILE ============================== */
function ProfilePanel({ name, setProfileName }) {
  const { select } = useSelection();
  const lead = leads.find((l) => l.name === name);
  const scr = screening.find((s) => s.name === name);
  const shortNameDisplay = name.replace('a-hTfR1_iso_', 'a-hTfR1 iso_');
  const best = lead ? getBestRun(lead) : null;
  const r = best ? best.r : null;
  const cloneInfo = lead ? lead.clone : '—';
  const clusterInfo = scr ? `Cluster ${scr.c}` : '—';

  const trendData = useMemo(() => {
    if (!lead) return { datasets: [] };
    const kdTrend = lead.runs.map((r2, ri) => (r2.kd != null ? { x: ri, y: r2.kd, name: lead.name } : null)).filter(Boolean);
    const hlTrend = lead.runs.map((r2, ri) => (r2.hl != null ? { x: ri, y: r2.hl, name: lead.name } : null)).filter(Boolean);
    return {
      datasets: [
        {
          label: 'KD (nM)', data: kdTrend, borderColor: G, pointRadius: 5, tension: 0.3, fill: false, yAxisID: 'y',
        },
        {
          label: 't½ (min)', data: hlTrend, borderColor: '#378ADD', pointRadius: 5, tension: 0.3, fill: false, yAxisID: 'y2', borderDash: [4, 2],
        },
      ],
    };
  }, [lead]);

  const trendOptions = useMemo(() => ({
    plugins: legendTop,
    scales: {
      x: {
        min: 0, max: 6, ticks: { font: { size: 11 }, callback: (v) => runLabels[v] || v },
      },
      y: { type: 'logarithmic', title: { display: true, text: 'KD (nM)', ...FONT9 }, ticks: FONT8 },
      y2: {
        position: 'right', title: { display: true, text: 't½ (min)', ...FONT9 }, ticks: FONT8, grid: { drawOnChartArea: false },
      },
    },
  }), []);

  if (!lead && !scr) {
    return <div className="card"><div className="card-title">Molecule not found</div></div>;
  }

  return (
    <div>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 12,
      }}
      >
        <div>
          <div style={{ fontSize: 22, fontWeight: 600 }}>{shortNameDisplay}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{`Clone: ${cloneInfo} · ${clusterInfo} · Target: hTfR1`}</div>
          <select
            value={name}
            onChange={(e) => {
              setProfileName(e.target.value);
              select([e.target.value]);
            }}
            style={{ marginTop: 8 }}
          >
            {screening.map((d) => (
              <option key={d.name} value={d.name}>{d.name.replace('a-hTfR1_iso_', 'iso_')}</option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {r && (
            <>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: r.kd < 2 ? '#C8E6C9' : r.kd < 10 ? '#FFF9C4' : '#FFCDD2', color: r.kd < 2 ? '#1B5E20' : r.kd < 10 ? '#6D5300' : '#7F0000',
              }}
              >
                {`KD: ${fmt(r.kd)} nM`}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: r.sec >= 90 ? '#C8E6C9' : r.sec >= 80 ? '#FFF9C4' : '#FFCDD2', color: r.sec >= 90 ? '#1B5E20' : r.sec >= 80 ? '#6D5300' : '#7F0000',
              }}
              >
                {`SEC: ${fmt(r.sec, 0)}%`}
              </span>
              <span style={{
                padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: r.hl > 30 ? '#C8E6C9' : r.hl > 10 ? '#FFF9C4' : '#FFCDD2', color: r.hl > 30 ? '#1B5E20' : r.hl > 10 ? '#6D5300' : '#7F0000',
              }}
              >
                {`t½: ${fmt(r.hl, 1)} min`}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="g2">
        <div className="card">
          <div className="card-title">Score strip</div>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3,minmax(0,1fr))' }}>
            {scr && (
              <>
                <div className="stat"><div className="stat-label">Screen KD (nM)</div><div className={`stat-val ${kdClass(scr.kd)}`}>{fmt(scr.kd)}</div></div>
                <div className="stat"><div className="stat-label">% Blockade</div><div className={`stat-val ${scr.block >= 80 ? 'g' : scr.block >= 65 ? 'a' : 'r'}`}>{fmt(scr.block, 1)}%</div></div>
                <div className="stat"><div className="stat-label">Cluster</div><div className="stat-val">{scr.c}</div></div>
              </>
            )}
            {r && (
              <>
                <div className="stat"><div className="stat-label">Best KD (nM)</div><div className={`stat-val ${kdClass(r.kd)}`}>{fmt(r.kd)}</div></div>
                <div className="stat"><div className="stat-label">Mac KD (nM)</div><div className="stat-val">{fmt(r.mac)}</div></div>
                <div className="stat"><div className="stat-label">Best t½ (min)</div><div className={`stat-val ${hlClass(r.hl)}`}>{fmt(r.hl, 1)}</div></div>
                <div className="stat"><div className="stat-label">Best SEC %</div><div className={`stat-val ${secClass(r.sec)}`}>{fmt(r.sec, 0)}%</div></div>
                <div className="stat"><div className="stat-label">Best Agg %</div><div className={`stat-val ${aggClass(r.agg)}`}>{fmt(r.agg, 0)}%</div></div>
                <div className="stat"><div className="stat-label">Best Titer</div><div className="stat-val">{avgT(r) ? `${fmt(avgT(r), 2)} g/L` : 'NA'}</div></div>
              </>
            )}
          </div>
        </div>
        <div className="card">
          <div className="card-title">KD &amp; t½ across runs</div>
          <ChartCanvas id="c-prof-trend" type="line" data={trendData} options={trendOptions} height={200} />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Crosslinks registered</div>
        <div className="xl-row"><span className="xl-tag">Disulfide</span><span className="xl-atom">A:23:R3 – A:96:R3</span><span className="badge" style={{ background: '#FFF9C4', color: '#6D5300', borderColor: '#F9C200' }}>Layer 2 — off by default</span></div>
        <div className="xl-row"><span className="xl-tag chem">N-Glyco</span><span className="xl-atom">GlcNAc:R1 – A:317:R3</span><span className="badge" style={{ background: '#E1F5EE', color: '#085041', borderColor: '#5DCAA5' }}>Layer 4 — contributes to uniqueness</span></div>
        <div className="xl-row"><span className="xl-tag desc">Lys coupling</span><span className="xl-atom">Linker:R1 – Lys:[unspec]</span><span className="badge" style={{ background: '#FAECE7', color: '#712B13', borderColor: '#F0997B' }}>Layer 5</span><span className="badge warn">Site unconfirmed — resolve before advancing</span></div>
      </div>

      {lead && (
        <div className="card">
          <div className="card-title">Run-by-run detail</div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>TPR ID</th><th>Run</th><th>Avg Titer (g/L)</th><th>SEC %</th><th>Agg %</th><th>KD (nM)</th><th>t½ (min)</th><th>Mac KD (nM)</th></tr></thead>
              <tbody>
                {lead.runs.map((r2, ri) => {
                  const t = avgT(r2);
                  return (
                    <tr key={ri}>
                      <td>{r2.tpr || '—'}</td>
                      <td>{runLabels[ri]}</td>
                      <td>{t ? fmt(t, 3) : 'NA'}</td>
                      <td className={secClass(r2.sec)}>{fmt(r2.sec, 0)}%</td>
                      <td className={aggClass(r2.agg)}>{fmt(r2.agg, 0)}%</td>
                      <td className={kdClass(r2.kd)}>{fmt(r2.kd)}</td>
                      <td className={hlClass(r2.hl)}>{fmt(r2.hl, 1)}</td>
                      <td>{fmt(r2.mac)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Flags &amp; recommendations</div>
        <table className="flag-table">
          <tbody>
            {r && (
              <>
                <tr><td>{r.kd < 2 ? <><span className="flag-icon g">✓</span>{`KD ${fmt(r.kd)} nM — in preferred range for hTfR1 program`}</> : <><span className="flag-icon a">!</span>{`KD ${fmt(r.kd)} nM — marginal, monitor across runs`}</>}</td></tr>
                <tr><td>{r.sec >= 90 ? <><span className="flag-icon g">✓</span>{`SEC purity ${fmt(r.sec, 0)}% — within green threshold`}</> : <><span className="flag-icon a">!</span>{`SEC purity ${fmt(r.sec, 0)}% — below 90% target, assess aggregation drivers`}</>}</td></tr>
                <tr><td>{r.agg < 10 ? <><span className="flag-icon g">✓</span>{`Aggregation ${fmt(r.agg, 0)}% — low`}</> : <><span className="flag-icon r">!</span>{`Aggregation ${fmt(r.agg, 0)}% — elevated, flag for developability review`}</>}</td></tr>
                <tr>
                  <td>
                    {r.hl > 30
                      ? <><span className="flag-icon g">✓</span>{`t½ ${fmt(r.hl, 1)} min — strong receptor engagement`}</>
                      : r.hl > 10
                        ? <><span className="flag-icon a">!</span>{`t½ ${fmt(r.hl, 1)} min — moderate, may need format engineering`}</>
                        : <><span className="flag-icon r">!</span>{`t½ ${fmt(r.hl, 1)} min — short, consider format or affinity optimization`}</>}
                  </td>
                </tr>
                {r.mac && (() => {
                  const ratio = r.mac / r.kd;
                  return (
                    <tr>
                      <td>
                        {ratio < 2
                          ? <><span className="flag-icon g">✓</span>{`Mac/Hu KD ratio ${ratio.toFixed(2)}× — excellent cross-species profile`}</>
                          : ratio < 4
                            ? <><span className="flag-icon a">!</span>{`Mac/Hu KD ratio ${ratio.toFixed(2)}× — moderate drift, confirm in in vivo models`}</>
                            : <><span className="flag-icon r">!</span>{`Mac/Hu KD ratio ${ratio.toFixed(2)}× — high drift, cross-species coverage at risk`}</>}
                      </td>
                    </tr>
                  );
                })()}
              </>
            )}
            <tr><td><span className="flag-icon a">!</span>Lys ADC coupling site unconfirmed — resolve before advancing to lead selection</td></tr>
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-title">Uniqueness search</div>
        <div className="card-desc" style={{ marginBottom: 8 }}>Find related molecules by progressively loosening uniqueness layers.</div>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 6, marginBottom: 8,
        }}
        >
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
          }}
          >
            <input type="checkbox" defaultChecked /> Same sequences (L1)
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
          }}
          >
            <input type="checkbox" /> Include disulfide variants (L2)
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
          }}
          >
            <input type="checkbox" defaultChecked /> Same crosslinks (L3)
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
          }}
          >
            <input type="checkbox" /> Same PTMs (L4)
          </label>
          <label style={{
            display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer',
          }}
          >
            <input type="checkbox" /> Same XL to chemicals (L5)
          </label>
        </div>
        <button type="button" onClick={() => sendPrompt('Find all TFR-001 molecules matching iso_326 at L1 only, ignoring modifications ↗')}>Find sequence-level matches ↗</button>
      </div>
    </div>
  );
}

/* ============================== CONFIG ============================== */
function ConfigPanel({ savedLabel, setSavedLabel }) {
  const handleSave = () => {
    setSavedLabel('Saved!');
    setTimeout(() => setSavedLabel('Save preset'), 1500);
  };

  return (
    <div className="card">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8,
      }}
      >
        <div className="card-title">Threshold configuration — TFR-001</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <select>
            <option>Early screening</option>
            <option>Lead selection</option>
            <option>Candidate nomination</option>
          </select>
          <button type="button" className="primary" onClick={handleSave}>{savedLabel}</button>
          <button type="button">Reset defaults</button>
        </div>
      </div>
            <div className="section-hdr">Binding &amp; potency (hTfR1)</div>
            <div className="tconf-row"><div className="tconf-metric">hTfR1 KD</div><div className="tconf-unit">nM</div><div className="tconf-band"><label className="g">G</label>≤<input type="number" defaultValue="2" /><label className="a">Y</label>≤<input type="number" defaultValue="10" /><label className="r">R</label>&gt;<input type="number" defaultValue="10" /></div></div>
            <div className="tconf-row"><div className="tconf-metric">% Blockade</div><div className="tconf-unit">%</div><div className="tconf-band"><label className="g">G</label>≥<input type="number" defaultValue="80" /><label className="a">Y</label>≥<input type="number" defaultValue="65" /><label className="r">R</label>&lt;<input type="number" defaultValue="65" /></div></div>
            <div className="tconf-row"><div className="tconf-metric">Mac/Hu KD ratio</div><div className="tconf-unit">×</div><div className="tconf-band"><label className="g">G</label>≤<input type="number" defaultValue="2" /><label className="a">Y</label>≤<input type="number" defaultValue="4" /><label className="r">R</label>&gt;<input type="number" defaultValue="4" /></div></div>
            <div className="tconf-row"><div className="tconf-metric">t½</div><div className="tconf-unit">min</div><div className="tconf-band"><label className="g">G</label>≥<input type="number" defaultValue="30" /><label className="a">Y</label>≥<input type="number" defaultValue="10" /><label className="r">R</label>&lt;<input type="number" defaultValue="10" /></div></div>
            <div className="section-hdr">SEC / colloidal stability</div>
            <div className="tconf-row"><div className="tconf-metric">SEC % purity</div><div className="tconf-unit">%</div><div className="tconf-band"><label className="g">G</label>≥<input type="number" defaultValue="90" /><label className="a">Y</label>≥<input type="number" defaultValue="80" /><label className="r">R</label>&lt;<input type="number" defaultValue="80" /></div></div>
            <div className="tconf-row"><div className="tconf-metric">% Aggregation</div><div className="tconf-unit">%</div><div className="tconf-band"><label className="g">G</label>&lt;<input type="number" defaultValue="10" /><label className="a">Y</label>&lt;<input type="number" defaultValue="20" /><label className="r">R</label>≥<input type="number" defaultValue="20" /></div></div>
            <div className="section-hdr">Production</div>
            <div className="tconf-row"><div className="tconf-metric">Titer</div><div className="tconf-unit">g/L</div><div className="tconf-band"><label className="g">G</label>≥<input type="number" defaultValue="0.7" step="0.1" /><label className="a">Y</label>≥<input type="number" defaultValue="0.3" step="0.1" /><label className="r">R</label>&lt;<input type="number" defaultValue="0.3" step="0.1" /></div></div>
    </div>
  );
}
