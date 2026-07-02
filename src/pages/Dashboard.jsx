import React, { useEffect, useState } from 'react';
import { fetchDashboardData, deleteEntry } from '../api';
import { Pie, Bar, Radar, Doughnut } from 'react-chartjs-2';
import { Users, PhoneCall, TrendingUp, AlertTriangle, Trash2, RefreshCw, ExternalLink, ShieldAlert, Award, Wrench } from 'lucide-react';

// ─── Hook: detect mobile viewport ────────────────────────────────────────────
const useIsMobile = (breakpoint = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);
  return isMobile;
};

const CHART_COLORS = [
  'rgba(59, 130, 246, 0.85)',  // Blue
  'rgba(139, 92, 246, 0.85)',  // Purple
  'rgba(16, 185, 129, 0.85)',  // Green
  'rgba(245, 158, 11, 0.85)',  // Amber
  'rgba(239, 68, 68, 0.85)',   // Red
  'rgba(20, 184, 166, 0.85)',  // Teal
  'rgba(236, 72, 153, 0.85)',  // Pink
];

// ── All 5 telephonic attribute keys (must match Google Sheet headers) ────────
const TELEPHONIC_ATTRS = [
  { label: 'Fuel Mileage',    key: 'Fuel Mileage' },
  { label: 'Engine Power',    key: 'Engine Power' },
  { label: 'Service Network', key: 'Service Network' },
  { label: 'Resale Value',    key: 'Resale Value' },
  { label: 'Finance / Loan',  key: 'Finance/Loan' },
];

// ── All 15 in-person attribute keys (must match Google Sheet headers) ────────
const IN_PERSON_ATTRS = [
  { label: 'Fuel Mileage',    key: 'Fuel Mileage' },
  { label: 'Engine Power',    key: 'Engine Power' },
  { label: 'Load Capacity',   key: 'Load Capacity' },
  { label: 'Reliability',     key: 'Reliability' },
  { label: 'Durability',      key: 'Durability' },
  { label: 'Service Network', key: 'Service Network' },
  { label: 'Service TAT',     key: 'Service TAT' },
  { label: 'Spare Parts',     key: 'Spare Parts' },
  { label: 'Resale Value',    key: 'Resale Value' },
  { label: 'Purchase Price',  key: 'Purchase Price' },
  { label: 'Finance / Loan',  key: 'Finance/Loan' },
  { label: 'Cabin Comfort',   key: 'Cabin Comfort' },
  { label: 'Brand Trust',     key: 'Brand Trust' },
  { label: 'Tyre & Brakes',   key: 'Tyre & Brake Life' },
  { label: 'Body / Chassis',  key: 'Body/Chassis' },
];

// ─── Helper: compute average of a numeric column in a list of rows ────────────
const avg = (rows, col) => {
  const vals = rows.map(r => parseFloat(r[col])).filter(v => !isNaN(v) && v > 0);
  return vals.length ? parseFloat((vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)) : 0;
};

// ─── Helper: build a radar dataset comparing Eicher vs Tata vs Ashok Leyland ───
const radarBrandDataset = (rows, attrs, impSuffix = " – Importance") => {
  const eicherRows = rows.filter(r => r['Brand'] === 'Eicher');
  const tataRows = rows.filter(r => r['Brand'] === 'Tata');
  const alRows = rows.filter(r => r['Brand'] === 'Ashok Leyland');
  
  return {
    labels: attrs.map(a => a.label),
    datasets: [
      {
        label: 'Eicher',
        data: attrs.map(a => avg(eicherRows, a.key + impSuffix)),
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderColor: 'rgba(16, 185, 129, 1)',
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
      },
      {
        label: 'Tata',
        data: attrs.map(a => avg(tataRows, a.key + impSuffix)),
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: 'rgba(59, 130, 246, 1)',
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Ashok Leyland',
        data: attrs.map(a => avg(alRows, a.key + impSuffix)),
        backgroundColor: 'rgba(245, 158, 11, 0.15)',
        borderColor: 'rgba(245, 158, 11, 1)',
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
      }
    ]
  };
};

// ─── Helper: build a radar dataset comparing Owner-Operator vs Fleet Owner vs Driver ───
const radarRoleDataset = (rows, attrs, impSuffix = " – Importance") => {
  const ooRows = rows.filter(r => {
    const role = (r['Role'] || '').toLowerCase();
    return role.includes('owner-operator') || role.includes('owner operator');
  });
  const foRows = rows.filter(r => {
    const role = (r['Role'] || '').toLowerCase();
    return role.includes('fleet owner') || role.includes('fleetoperator') || role.includes('fleet operator');
  });
  const drRows = rows.filter(r => {
    const role = (r['Role'] || '').toLowerCase();
    return role.includes('driver');
  });

  return {
    labels: attrs.map(a => a.label),
    datasets: [
      {
        label: 'Owner-Operator',
        data: attrs.map(a => avg(ooRows, a.key + impSuffix)),
        backgroundColor: 'rgba(139, 92, 246, 0.15)',
        borderColor: 'rgba(139, 92, 246, 1)',
        pointBackgroundColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 2,
      },
      {
        label: 'Fleet Owner',
        data: attrs.map(a => avg(foRows, a.key + impSuffix)),
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderColor: 'rgba(236, 72, 153, 1)',
        pointBackgroundColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 2,
      },
      {
        label: 'Driver',
        data: attrs.map(a => avg(drRows, a.key + impSuffix)),
        backgroundColor: 'rgba(20, 184, 166, 0.15)',
        borderColor: 'rgba(20, 184, 166, 1)',
        pointBackgroundColor: 'rgba(20, 184, 166, 1)',
        borderWidth: 2,
      }
    ]
  };
};

const RADAR_OPTIONS = {
  maintainAspectRatio: false,
  plugins: { legend: { position: 'top', labels: { color: '#94a3b8', boxWidth: 14, padding: 16 } } },
  scales: {
    r: {
      min: 0, max: 5,
      angleLines: { color: 'rgba(255, 255, 255, 0.08)' },
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      pointLabels: { color: '#f8fafc', font: { size: 11 } },
      ticks: { backdropColor: 'transparent', color: '#94a3b8', stepSize: 1 }
    }
  }
};

// ─── ChartCard wrapper ────────────────────────────────────────────────────────
const ChartCard = ({ title, subtitle, children, fullWidth = false, height }) => (
  <div className="chart-container" style={{
    gridColumn: fullWidth ? '1 / -1' : 'auto',
    height: height || (fullWidth ? '480px' : '420px'),
    display: 'flex',
    flexDirection: 'column',
  }}>
    <div style={{ marginBottom: '0.75rem' }}>
      <h3 style={{ margin: 0 }}>{title}</h3>
      {subtitle && <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{subtitle}</p>}
    </div>
    <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>{children}</div>
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
  const isMobile = useIsMobile();
  const isSmall  = useIsMobile(480);

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

  // ─── Radar 1: Telephonic Attribute Importance by Brand ────────────────────
  const telephonicRadar = radarBrandDataset(filteredTelephonic, TELEPHONIC_ATTRS);

  // ─── Radar 2: In-Person Attribute Importance by Brand ──────────────────────
  const inPersonRadar = radarBrandDataset(filteredInPerson, IN_PERSON_ATTRS);

  // ─── Radar 3: Attribute Importance by Respondent Role (In-Person) ──────────
  const roleRadar = radarRoleDataset(filteredInPerson, IN_PERSON_ATTRS);

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

  // ── Chart: Decision Focus (Doughnut) ─────────────────────────────────────────
  const focusCount = {};
  filteredInPerson.forEach(r => {
    const f = r['Decision Focus'];
    if (f && f !== '—' && f !== 'N/A') {
      focusCount[f] = (focusCount[f] || 0) + 1;
    }
  });
  const focusChart = {
    labels: Object.keys(focusCount),
    datasets: [{ data: Object.values(focusCount), backgroundColor: CHART_COLORS, borderWidth: 0 }]
  };

  // ── Chart: Reason of Loss (Data) – Horizontal Bar ────────────────────────────
  const lossDataCount = {};
  allRows.forEach(r => {
    const reason = r['Reason of Loss (Data)'];
    if (reason && reason !== '—' && reason !== 'N/A' && String(reason).trim()) {
      const key = String(reason).trim();
      lossDataCount[key] = (lossDataCount[key] || 0) + 1;
    }
  });
  const sortedLossData = Object.entries(lossDataCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const lossDataChart = {
    labels: sortedLossData.map(x => x[0]),
    datasets: [{
      label: 'Deals Lost',
      data: sortedLossData.map(x => x[1]),
      backgroundColor: 'rgba(239, 68, 68, 0.75)',
      borderRadius: 6
    }]
  };

  // ── Chart: Actual Reason of Loss – Horizontal Bar ───────────────────────────
  const actualLossCount = {};
  allRows.forEach(r => {
    const reason = r['Actual Reason of Loss'];
    if (reason && reason !== '—' && reason !== 'N/A' && String(reason).trim()) {
      const key = String(reason).trim();
      actualLossCount[key] = (actualLossCount[key] || 0) + 1;
    }
  });
  const sortedActualLoss = Object.entries(actualLossCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const actualLossChart = {
    labels: sortedActualLoss.map(x => x[0]),
    datasets: [{
      label: 'Deals Lost',
      data: sortedActualLoss.map(x => x[1]),
      backgroundColor: 'rgba(245, 158, 11, 0.75)',
      borderRadius: 6
    }]
  };

  // ── Chart: Component Failures / Part Broken (Vertical Bar) ──────────────────
  const partsCount = {};
  filteredInPerson.forEach(r => {
    const p = r['Part Most Broken'];
    if (p && p !== '—' && p !== 'N/A' && p !== 'Never') {
      partsCount[p] = (partsCount[p] || 0) + 1;
    }
  });
  const partsChart = {
    labels: Object.keys(partsCount),
    datasets: [{
      label: 'Failures Reported',
      data: Object.values(partsCount),
      backgroundColor: 'rgba(245, 158, 11, 0.75)',
      borderRadius: 6
    }]
  };

  // ── Chart: Brand Switching Reasons (Vertical Bar) ──────────────────────────
  const switchReasonCount = {};
  allRows.forEach(r => {
    const sr = r['Switch Reason'];
    if (sr && sr !== '—' && sr !== 'N/A') {
      switchReasonCount[sr] = (switchReasonCount[sr] || 0) + 1;
    }
  });
  const switchReasonChart = {
    labels: Object.keys(switchReasonCount),
    datasets: [{
      label: 'Mentions',
      data: Object.values(switchReasonCount),
      backgroundColor: 'rgba(99, 102, 241, 0.75)',
      borderRadius: 6
    }]
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
        <h1 style={{ margin: 0, fontSize: isSmall ? '1.4rem' : undefined }}>Dashboard Overview</h1>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
          <a 
            href="https://docs.google.com/spreadsheets/d/1pylhNS66th5dr6yYXngRtrgp3dBFN8Deom0zSQKMetA/edit?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn" 
            style={{ 
              background: 'linear-gradient(135deg, #10b981, #059669)', 
              color: 'white', 
              textDecoration: 'none', 
              padding: '0.5rem 1.25rem', 
              fontSize: isMobile ? '0.8rem' : '0.9rem',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.2)',
              flex: isMobile ? 1 : 'none',
            }}
          >
            <ExternalLink size={16} />
            View Google Sheet
          </a>
          <button onClick={loadData} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: isMobile ? '0.8rem' : '0.9rem', flex: isMobile ? 1 : 'none' }} disabled={loading}>
            <RefreshCw size={16} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
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
          {/* ─── SECTION 1: OVERVIEW & PURCHASE DRIVERS ─── */}
          <div style={{ margin: '2rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Award size={20} style={{ color: 'var(--primary-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Section 1: Overview & Purchase Drivers</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <ChartCard title="Breakdowns in Last 1 Year" subtitle="Reliability overview of surveyed trucks">
              <Bar data={breakdownChart} options={{
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } } }
              }} />
            </ChartCard>
            <ChartCard title="Primary Purchase Trigger" subtitle="Single biggest reason for buying current truck">
              <Pie data={pieChart} options={{
                maintainAspectRatio: false,
                plugins: { legend: { position: isMobile ? 'bottom' : 'right', labels: { color: '#94a3b8', boxWidth: 12, padding: isMobile ? 8 : 10, font: { size: isMobile ? 10 : 12 } } } }
              }} />
            </ChartCard>
          </div>

          {/* ─── SECTION 2: BRAND & ROLE CUSTOMER PREFERENCES (RADARS) ─── */}
          <div style={{ margin: '2.5rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Users size={20} style={{ color: 'var(--accent-color)' }} />
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Section 2: Customer Preferences & Brand Comparisons</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Radar 1 – Telephonic */}
            <div style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: 'var(--glass-border)', borderRadius: 'var(--border-radius)',
              padding: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(16,185,129,1)', display: 'inline-block' }}></span>
                  <h3 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1rem' }}>📞 Telephonic Brand Preferences (5 Attrs)</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Average attribute importance ratings by brand</p>
              </div>
              <div style={{ height: isMobile ? '300px' : '380px', position: 'relative' }}>
                {telephonicRows.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>No telephonic data yet</div>
                  : <Radar data={telephonicRadar} options={RADAR_OPTIONS} />}
              </div>
            </div>

            {/* Radar 2 – In-Person */}
            <div style={{
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: 'var(--glass-border)', borderRadius: 'var(--border-radius)',
              padding: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(245,158,11,1)', display: 'inline-block' }}></span>
                  <h3 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1rem' }}>🤝 In-Person Brand Preferences (15 Attrs)</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Deep-dive attribute importance comparison by brand</p>
              </div>
              <div style={{ height: isMobile ? '300px' : '380px', position: 'relative' }}>
                {inPersonRows.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>No in-person data yet</div>
                  : <Radar data={inPersonRadar} options={RADAR_OPTIONS} />}
              </div>
            </div>

            {/* Radar 3 – Role Preference Analysis */}
            <div style={{
              gridColumn: '1 / -1',
              background: 'var(--glass-bg)', backdropFilter: 'blur(16px)',
              border: '1px solid rgba(99,102,241,0.3)', borderRadius: 'var(--border-radius)',
              padding: isMobile ? '1rem' : '1.5rem',
            }}>
              <div style={{ marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(99,102,241,1)', display: 'inline-block' }}></span>
                  <h3 style={{ margin: 0, fontSize: isMobile ? '0.9rem' : '1rem' }}>📊 Segment Preference Analysis by Respondent Role (In-Person)</h3>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', margin: 0 }}>Comparison of priorities between Owner-Operators, Fleet Owners, and Drivers</p>
              </div>
              <div style={{ height: isMobile ? '340px' : '460px', position: 'relative' }}>
                {inPersonRows.length === 0
                  ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>No in-person data yet</div>
                  : <Radar data={roleRadar} options={{
                      ...RADAR_OPTIONS,
                      plugins: { legend: { position: 'top', labels: { color: '#94a3b8', boxWidth: isMobile ? 12 : 16, padding: isMobile ? 8 : 14, font: { size: isMobile ? 10 : 12 } } } }
                    }} />}
              </div>
            </div>
          </div>

          {/* ─── SECTION 3: DEAL LOSS & SWITCHING BARRIERS ─── */}
          <div style={{ margin: '2.5rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldAlert size={20} style={{ color: 'var(--danger)' }} />
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Section 3: Deal Loss Reasons & Brand Switching Barriers</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <ChartCard title="Reason of Loss (Data)" subtitle="Category-level deal loss reasons from dropdown selections">
              {sortedLossData.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No loss data recorded</div>
              ) : (
                <Bar data={lossDataChart} options={{
                  indexAxis: 'y',
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } }, y: { grid: { display: false } } }
                }} />
              )}
            </ChartCard>
            <ChartCard title="Actual Reason of Loss" subtitle="Specific reasons written by interviewers for each deal loss">
              {sortedActualLoss.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No actual loss reasons recorded</div>
              ) : (
                <Bar data={actualLossChart} options={{
                  indexAxis: 'y',
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } }, y: { grid: { display: false } } }
                }} />
              )}
            </ChartCard>
            <ChartCard title="Reasons for Brand Switching" subtitle="Q4. Primary reason for switching or considering switching brands">
              {Object.keys(switchReasonCount).length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No switching data available</div>
              ) : (
                <Bar data={switchReasonChart} options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } } }
                }} />
              )}
            </ChartCard>
          </div>

          {/* ─── SECTION 4: COMPONENT RELIABILITY & INFLUENCES ─── */}
          <div style={{ margin: '2.5rem 0 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Wrench size={20} style={{ color: 'var(--warning)' }} />
            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>Section 4: Component Reliability & Decision Focus</h2>
            <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }}></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <ChartCard title="Component Failure Distribution" subtitle="Parts most often responsible for service breakdowns">
              {Object.keys(partsCount).length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No breakdowns reported with components</div>
              ) : (
                <Bar data={partsChart} options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { stepSize: 1 } } }
                }} />
              )}
            </ChartCard>
            <ChartCard title="Decision Influencer Focus" subtitle="What influencers/partners focus on most during purchase">
              {Object.keys(focusCount).length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No decision focus data recorded</div>
              ) : (
                <Doughnut data={focusChart} options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: isMobile ? 'bottom' : 'right', labels: { color: '#94a3b8', boxWidth: 12, padding: isMobile ? 8 : 10, font: { size: isMobile ? 10 : 12 } } } }
                }} />
              )}
            </ChartCard>
          </div>

          {/* Data Table */}
          <div className="data-table-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 style={{ margin: 0 }}>All Interviews <span style={{ color: 'var(--text-secondary)', fontWeight: 400, fontSize: isMobile ? '0.85rem' : '1rem' }}>({displayRows.length})</span></h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto' }}>
                {['all', 'telephonic', 'in-person'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    padding: isMobile ? '0.35rem 0.75rem' : '0.4rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                    fontSize: isMobile ? '0.78rem' : '0.85rem', fontWeight: 600,
                    flex: isMobile ? 1 : 'none',
                    background: activeTab === tab ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'rgba(255,255,255,0.06)',
                    color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                    transition: 'all 0.2s ease',
                  }}>
                    {tab === 'all' ? 'All' : tab === 'telephonic' ? '📞 Tel.' : '🤝 In-Person'}
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
                    <th>Model</th>
                    <th>Competition Model</th>
                    <th>Role</th><th>Purchase Trigger / Reason</th>
                    <th>Breakdowns</th><th>Decision Maker</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayRows.length === 0 ? (
                    <tr><td colSpan={13} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>No entries found.</td></tr>
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
                        <td>{row['Model'] || '—'}</td>
                        <td>{row['Competition Model'] || '—'}</td>
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
