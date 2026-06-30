import React, { useEffect, useState } from 'react';
import { fetchDashboardData, deleteEntry } from '../api';
import { Pie, Bar, Radar } from 'react-chartjs-2';
import { Users, PhoneCall, TrendingUp, AlertTriangle, Trash2, RefreshCw } from 'lucide-react';

const CHART_COLORS = [
  'rgba(59,130,246,0.85)',
  'rgba(139,92,246,0.85)',
  'rgba(16,185,129,0.85)',
  'rgba(245,158,11,0.85)',
  'rgba(239,68,68,0.85)',
  'rgba(99,102,241,0.85)',
  'rgba(236,72,153,0.85)',
];

// ── All 10 telephonic attribute column names (as stored in Sheets) ────────────
const TELEPHONIC_ATTRS = [
  { label: 'Fuel Mileage',    imp: 'Fuel Mileage – Importance',     sc: 'Fuel Mileage – Score' },
  { label: 'Engine Power',    imp: 'Engine Power – Importance',     sc: 'Engine Power – Score' },
  { label: 'Reliability',     imp: 'Reliability – Importance',      sc: 'Reliability – Score' },
  { label: 'Service Network', imp: 'Service Network – Importance',  sc: 'Service Network – Score' },
  { label: 'Spare Parts',     imp: 'Spare Parts – Importance',      sc: 'Spare Parts – Score' },
  { label: 'Resale Value',    imp: 'Resale Value – Importance',     sc: 'Resale Value – Score' },
  { label: 'Purchase Price',  imp: 'Purchase Price – Importance',   sc: 'Purchase Price – Score' },
  { label: 'Cabin Comfort',   imp: 'Cabin Comfort – Importance',    sc: 'Cabin Comfort – Score' },
  { label: 'Brand Trust',     imp: 'Brand Trust – Importance',      sc: 'Brand Trust – Score' },
  { label: 'Load Capacity',   imp: 'Load Capacity – Importance',    sc: 'Load Capacity – Score' },
];

// ── All 15 in-person attribute column names (as stored in Sheets) ─────────────
const IN_PERSON_ATTRS = [
  { label: 'Fuel Economy',    imp: 'Fuel Economy – Importance',     sc: 'Fuel Economy – Score' },
  { label: 'Engine Power',    imp: 'Engine Power – Importance',     sc: 'Engine Power – Score' },
  { label: 'Load Capacity',   imp: 'Load Capacity – Importance',    sc: 'Load Capacity – Score' },
  { label: 'Reliability',     imp: 'Reliability – Importance',      sc: 'Reliability – Score' },
  { label: 'Durability',      imp: 'Durability – Importance',       sc: 'Durability – Score' },
  { label: 'Service Network', imp: 'Service Network – Importance',  sc: 'Service Network – Score' },
  { label: 'Service TAT',     imp: 'Service TAT – Importance',      sc: 'Service TAT – Score' },
  { label: 'Spare Parts',     imp: 'Spare Parts – Importance',      sc: 'Spare Parts – Score' },
  { label: 'Resale Value',    imp: 'Resale Value – Importance',     sc: 'Resale Value – Score' },
  { label: 'Purchase Price',  imp: 'Purchase Price – Importance',   sc: 'Purchase Price – Score' },
  { label: 'Finance / EMI',   imp: 'Finance/EMI – Importance',      sc: 'Finance/EMI – Score' },
  { label: 'Cabin Comfort',   imp: 'Cabin Comfort – Importance',    sc: 'Cabin Comfort – Score' },
  { label: 'Brand Trust',     imp: 'Brand Trust – Importance',      sc: 'Brand Trust – Score' },
  { label: 'Tyre & Brakes',   imp: 'Tyre & Brake Life – Importance',sc: 'Tyre & Brake Life – Score' },
  { label: 'Body / Chassis',  imp: 'Body/Chassis – Importance',     sc: 'Body/Chassis – Score' },
];

// ── Combined: 8 common attributes (matching labels that exist in both) ────────
const COMBINED_ATTRS = [
  { label: 'Fuel Mileage / Economy', telImp: 'Fuel Mileage – Importance',    telSc: 'Fuel Mileage – Score',    ipImp: 'Fuel Economy – Importance',    ipSc: 'Fuel Economy – Score' },
  { label: 'Engine Power',           telImp: 'Engine Power – Importance',    telSc: 'Engine Power – Score',    ipImp: 'Engine Power – Importance',    ipSc: 'Engine Power – Score' },
  { label: 'Reliability',            telImp: 'Reliability – Importance',     telSc: 'Reliability – Score',     ipImp: 'Reliability – Importance',     ipSc: 'Reliability – Score' },
  { label: 'Service Network',        telImp: 'Service Network – Importance', telSc: 'Service Network – Score', ipImp: 'Service Network – Importance', ipSc: 'Service Network – Score' },
  { label: 'Spare Parts',            telImp: 'Spare Parts – Importance',     telSc: 'Spare Parts – Score',     ipImp: 'Spare Parts – Importance',     ipSc: 'Spare Parts – Score' },
  { label: 'Resale Value',           telImp: 'Resale Value – Importance',    telSc: 'Resale Value – Score',    ipImp: 'Resale Value – Importance',    ipSc: 'Resale Value – Score' },
  { label: 'Cabin Comfort',          telImp: 'Cabin Comfort – Importance',   telSc: 'Cabin Comfort – Score',   ipImp: 'Cabin Comfort – Importance',   ipSc: 'Cabin Comfort – Score' },
  { label: 'Brand Trust',            telImp: 'Brand Trust – Importance',     telSc: 'Brand Trust – Score',     ipImp: 'Brand Trust – Importance',     ipSc: 'Brand Trust – Score' },
];

// ─── Helper: compute average of a numeric column in a list of rows ────────────
const avg = (rows, col) => {
  const vals = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v) && v > 0);
  return vals.length ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2) : 0;
};

// ─── Helper: build a radar dataset object ────────────────────────────────────
const radarDataset = (label, rows, attrs, impKey, scKey, impColor, scColor) => ({
  labels: attrs.map(a => a.label),
  datasets: [
    {
      label: `${label} – Avg Importance`,
      data: attrs.map(a => avg(rows, a[impKey])),
      backgroundColor: impColor.bg,
      borderColor: impColor.border,
      pointBackgroundColor: impColor.border,
      borderWidth: 2,
    },
    {
      label: `${label} – Avg Score`,
      data: attrs.map(a => avg(rows, a[scKey])),
      backgroundColor: scColor.bg,
      borderColor: scColor.border,
      pointBackgroundColor: scColor.border,
      borderWidth: 2,
    }
  ]
});

const RADAR_OPTIONS = {
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top', labels: { color: '#94a3b8', boxWidth: 14, padding: 16 } } },
  scales: {
    r: {
      min: 0, max: 5,
      angleLines: { color: 'rgba(255,255,255,0.08)' },
      grid: { color: 'rgba(255,255,255,0.08)' },
      pointLabels: { color: '#f8fafc', font: { size: 11 } },
      ticks: { backdropColor: 'transparent', color: '#94a3b8', stepSize: 1 }
    }
  }
};

// ─── ChartCard wrapper ────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, fullWidth = false }) => (
  <div className="chart-container" style={{
    gridColumn: fullWidth ? '1 / -1' : 'auto',
    height: fullWidth ? '480px' : '420px',
    display: 'flex',
    flexDirection: 'column',
  }}>
    <div style={{ marginBottom: '0.5rem' }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
    <div style={{ flex: 1, position: 'relative' }}>{children}</div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
function Dashboard() {
  const [data, setData]       = useState({ telephonic: [], inPerson: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [interviewer, setInterviewer] = useState('all');

  const loadData = async () => {
    setLoading(true); setError(null);
    try {
      const result = await fetchDashboardData();
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to fetch data from Google Sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const DELETE_PASSWORD = '123godelete';

  const handleDelete = async (type, rowIndex) => {
    const pwd = window.prompt('🔒 Enter the delete password to confirm:');
    if (pwd === null) return; // user cancelled
    if (pwd !== DELETE_PASSWORD) {
      alert('❌ Incorrect password. Deletion cancelled.');
      return;
    }
    setDeleting(`${type}-${rowIndex}`);
    try {
      await deleteEntry(type, rowIndex);
      await loadData();
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    } finally {
      setDeleting(null);
    }
  };

  const telephonicRows = (data.telephonic || []).map(d => ({ ...d, _type: 'telephonic' }));
  const inPersonRows   = (data.inPerson   || []).map(d => ({ ...d, _type: 'in-person' }));

  // Filter by interviewer first, then by form type
  const filterByInterviewer = (rows) =>
    interviewer === 'all' ? rows : rows.filter(r => r['Interviewer'] === interviewer);

  const filteredTelephonic = filterByInterviewer(telephonicRows);
  const filteredInPerson   = filterByInterviewer(inPersonRows);
  const allRows = [...filteredTelephonic, ...filteredInPerson].sort(
    (a, b) => new Date(b['Timestamp'] || 0) - new Date(a['Timestamp'] || 0)
  );
  const displayRows = activeTab === 'telephonic' ? filteredTelephonic
    : activeTab === 'in-person' ? filteredInPerson : allRows;
  const totalResponses = allRows.length;

  // ── Chart: Breakdowns bar ───────────────────────────────────────────────────
  const breakdownsCount = {};
  allRows.forEach(r => {
    const b = r['Breakdowns (1yr)'] || 'Not Specified';
    breakdownsCount[b] = (breakdownsCount[b] || 0) + 1;
  });
  const ORDER = ['Never', '1-2 times', '3-5 times', 'More than 5', '5+ times', 'Not Specified'];
  const bdLabels = Object.keys(breakdownsCount).sort((a, b) => ORDER.indexOf(a) - ORDER.indexOf(b));
  const breakdownChart = {
    labels: bdLabels,
    datasets: [{ label: 'Responses', data: bdLabels.map(l => breakdownsCount[l]), backgroundColor: CHART_COLORS, borderWidth: 0, borderRadius: 6 }]
  };

  // ── Chart: Purchase trigger pie ─────────────────────────────────────────────
  const triggerCount = {};
  allRows.forEach(r => {
    const t = r['Purchase Trigger'] || r['Purchase Reason'] || 'Not Specified';
    triggerCount[t] = (triggerCount[t] || 0) + 1;
  });
  const pieChart = {
    labels: Object.keys(triggerCount),
    datasets: [{ data: Object.values(triggerCount), backgroundColor: CHART_COLORS, borderWidth: 0 }]
  };

  // ── Radar 1: Telephonic only (10 attrs) ─────────────────────────────────────
  const telephonicRadar = radarDataset(
    'Telephonic', telephonicRows, TELEPHONIC_ATTRS, 'imp', 'sc',
    { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,1)' },
    { bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,1)' }
  );

  // ── Radar 2: In-Person only (15 attrs) ──────────────────────────────────────
  const inPersonRadar = radarDataset(
    'In-Person', inPersonRows, IN_PERSON_ATTRS, 'imp', 'sc',
    { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,1)' },
    { bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,1)' }
  );

  // ── Radar 3: Combined – overlaying Telephonic vs In-Person (8 common attrs) ─
  const combinedRadar = {
    labels: COMBINED_ATTRS.map(a => a.label),
    datasets: [
      {
        label: 'Telephonic – Avg Importance',
        data: COMBINED_ATTRS.map(a => avg(telephonicRows, a.telImp)),
        backgroundColor: 'rgba(16,185,129,0.15)',
        borderColor: 'rgba(16,185,129,1)',
        pointBackgroundColor: 'rgba(16,185,129,1)',
        borderWidth: 2,
      },
      {
        label: 'Telephonic – Avg Score',
        data: COMBINED_ATTRS.map(a => avg(telephonicRows, a.telSc)),
        backgroundColor: 'rgba(59,130,246,0.12)',
        borderColor: 'rgba(59,130,246,1)',
        pointBackgroundColor: 'rgba(59,130,246,1)',
        borderWidth: 2,
        borderDash: [4, 4],
      },
      {
        label: 'In-Person – Avg Importance',
        data: COMBINED_ATTRS.map(a => avg(inPersonRows, a.ipImp)),
        backgroundColor: 'rgba(245,158,11,0.12)',
        borderColor: 'rgba(245,158,11,1)',
        pointBackgroundColor: 'rgba(245,158,11,1)',
        borderWidth: 2,
      },
      {
        label: 'In-Person – Avg Score',
        data: COMBINED_ATTRS.map(a => avg(inPersonRows, a.ipSc)),
        backgroundColor: 'rgba(139,92,246,0.12)',
        borderColor: 'rgba(139,92,246,1)',
        pointBackgroundColor: 'rgba(139,92,246,1)',
        borderWidth: 2,
        borderDash: [4, 4],
      },
    ]
  };

  if (loading && !totalResponses) {
    return (
      <div className="form-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ margin: 0 }}>Dashboard Overview</h1>
        <button onClick={loadData} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }} disabled={loading}>
          <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* Interviewer Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
        border: 'var(--glass-border)', borderRadius: '14px',
        padding: '0.75rem 1.25rem', marginBottom: '1.75rem',
        flexWrap: 'wrap',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem', marginRight: '0.25rem' }}>Viewing data for:</span>
        {[{ key: 'all', label: '🌐 All Interviewers' }, { key: 'Kartik', label: '👤 Kartik' }, { key: 'Harsh', label: '👤 Harsh' }].map(opt => (
          <button
            key={opt.key}
            onClick={() => setInterviewer(opt.key)}
            style={{
              padding: '0.5rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.9rem',
              transition: 'all 0.2s ease',
              background: interviewer === opt.key
                ? opt.key === 'Kartik'
                  ? 'linear-gradient(135deg, #3b82f6, #8b5cf6)'
                  : opt.key === 'Harsh'
                  ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
                  : 'linear-gradient(135deg, #10b981, #3b82f6)'
                : 'rgba(255,255,255,0.05)',
              color: interviewer === opt.key ? '#fff' : 'var(--text-secondary)',
              boxShadow: interviewer === opt.key ? '0 4px 12px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {opt.label}
          </button>
        ))}
        {interviewer !== 'all' && (
          <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
            Showing {allRows.length} entries by <strong style={{ color: 'var(--text-primary)' }}>{interviewer}</strong>
          </span>
        )}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', padding: '1rem 1.5rem', borderRadius: '10px', marginBottom: '1.5rem' }}>
          ⚠️ {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-icon"><Users size={22} /></div>
          <div className="stat-details"><h3>Total Interviews</h3><p>{totalResponses}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><PhoneCall size={22} /></div>
          <div className="stat-details"><h3>Telephonic</h3><p>{filteredTelephonic.length}</p></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.2)', color: 'var(--accent-color)' }}>
            <TrendingUp size={22} />
          </div>
          <div className="stat-details"><h3>In-Person</h3><p>{filteredInPerson.length}</p></div>
        </div>
      </div>

      {totalResponses === 0 ? (
        <div className="form-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <AlertTriangle size={48} style={{ color: 'var(--warning)', margin: '0 auto 1rem' }} />
          <h2>No Data Yet</h2>
          <p className="subtitle">Fill in a form to start seeing charts and data here.</p>
        </div>
      ) : (
        <>
          {/* Row 1: Breakdowns + Trigger */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <ChartCard title="Breakdowns in Last 1 Year" subtitle="All interviews combined">
              <Bar data={breakdownChart} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } } }
              }} />
            </ChartCard>
            <ChartCard title="Primary Purchase Trigger" subtitle="All interviews combined">
              <Pie data={pieChart} options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: 'right', labels: { color: '#94a3b8', boxWidth: 12, padding: 10 } } }
              }} />
            </ChartCard>
          </div>

          {/* Row 2: Section heading */}
          <div style={{ margin: '0.5rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Attribute Importance vs Brand Score</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          {/* Row 2: Three radar charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Radar 1 – Telephonic */}
            <div style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: 'var(--glass-border)', borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(16,185,129,1)', display: 'inline-block' }}></span>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>📞 Telephonic (10 Attributes)</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Solid = Importance &nbsp;|&nbsp; Dashed = Brand Score</p>
              </div>
              <div style={{ height: '380px', position: 'relative' }}>
                {telephonicRows.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>No telephonic data yet</div>
                  : <Radar data={telephonicRadar} options={RADAR_OPTIONS} />}
              </div>
            </div>

            {/* Radar 2 – In-Person */}
            <div style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: 'var(--glass-border)', borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(245,158,11,1)', display: 'inline-block' }}></span>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>🤝 In-Person (15 Attributes)</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Solid = Importance &nbsp;|&nbsp; Dashed = Brand Score</p>
              </div>
              <div style={{ height: '380px', position: 'relative' }}>
                {inPersonRows.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>No in-person data yet</div>
                  : <Radar data={inPersonRadar} options={RADAR_OPTIONS} />}
              </div>
            </div>

            {/* Radar 3 – Combined */}
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--border-radius)',
              padding: '1.5rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(99,102,241,1)', display: 'inline-block' }}></span>
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>📊 Combined Comparison (8 Common Attributes)</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Overlays both form types — green/blue = Telephonic &nbsp;|&nbsp; amber/purple = In-Person</p>
              </div>
              <div style={{ height: '460px', position: 'relative' }}>
                {allRows.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>No data yet</div>
                  : <Radar data={combinedRadar} options={{
                      ...RADAR_OPTIONS,
                      plugins: { legend: { position: 'top', labels: { color: '#94a3b8', boxWidth: 16, padding: 14 } } }
                    }} />}
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="data-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ margin: 0 }}>All Interviews <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: '1rem' }}>({displayRows.length})</span></h2>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {['all', 'telephonic', 'in-person'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: '0.4rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: '0.85rem', fontWeight: 600,
                    background: activeTab === tab ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'rgba(255,255,255,0.06)',
                    color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}>
                    {tab === 'all' ? 'All' : tab === 'telephonic' ? '📞 Telephonic' : '🤝 In-Person'}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Type</th><th>Date & Time</th>
                    <th>Customer / Interviewer</th><th>Phone No</th><th>Brand</th>
                    <th>Role</th><th>Purchase Trigger / Reason</th>
                    <th>Breakdowns</th><th>Decision Maker</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length === 0 ? (
                    <tr><td colSpan={11} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
                  ) : displayRows.map((row, idx) => {
                    const isDeleting = deleting === `${row._type}-${row._rowIndex}`;
                    const isPhone = row._type === 'telephonic';
                    const ts = row['Timestamp'] ? new Date(row['Timestamp']) : null;
                    return (
                      <tr key={`${row._type}-${row._rowIndex}-${idx}`}>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{idx + 1}</td>
                        <td>
                          <span style={{
                            padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
                            background: isPhone ? 'rgba(59,130,246,0.15)' : 'rgba(139,92,246,0.15)',
                            color: isPhone ? '#60a5fa' : '#a78bfa',
                            border: `1px solid ${isPhone ? 'rgba(59,130,246,0.3)' : 'rgba(139,92,246,0.3)'}`,
                            whiteSpace: 'nowrap',
                          }}>
                            {isPhone ? '📞 Telephonic' : '🤝 In-Person'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.82rem' }}>
                          {ts ? <><div>{ts.toLocaleDateString()}</div><div style={{ color: 'var(--text-secondary)' }}>{ts.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></> : 'N/A'}
                        </td>
                        <td style={{ fontWeight: 500 }}>{row['Customer Name'] || row['Interviewer Name'] || '—'}</td>
                        <td>{row['Phone No'] || '—'}</td>
                        <td>
                          {row['Brand'] ? (
                            <span style={{ padding: '0.2rem 0.6rem', borderRadius: '6px', background: 'rgba(245,158,11,0.15)', color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>
                              {row['Brand']}
                            </span>
                          ) : '—'}
                        </td>
                        <td>{row['Role'] || '—'}</td>
                        <td style={{ maxWidth: '200px', whiteSpace: 'normal', lineHeight: 1.4, fontSize: '0.83rem' }}>
                          {row['Purchase Trigger'] || row['Purchase Reason'] || '—'}
                        </td>
                        <td>
                          {row['Breakdowns (1yr)'] ? (
                            <span style={{
                              padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 600,
                              background: row['Breakdowns (1yr)'] === 'Never' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                              color: row['Breakdowns (1yr)'] === 'Never' ? '#34d399' : '#f87171',
                            }}>
                              {row['Breakdowns (1yr)']}
                            </span>
                          ) : '—'}
                        </td>
                        <td>{row['Decision Maker'] || '—'}</td>
                        <td>
                          <button className="btn-delete" onClick={() => handleDelete(row._type, row._rowIndex)} disabled={isDeleting}>
                            <Trash2 size={14} />
                            {isDeleting ? 'Deleting…' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
