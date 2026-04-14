import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePackages } from '../hooks/usePackages';
import { useLabTests } from '../hooks/useLabTests';
import { useBookings } from '../hooks/useBookings';
import { useRevenue } from '../hooks/useRevenue';

const ACCENT = '#0bc5cf';

const statusCfg = {
  booked:           { label: 'Pending',          color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  assigned:         { label: 'Assigned',         color: ACCENT,    bg: '#e0f7fa', dot: ACCENT },
  sample_collected: { label: 'Sample',           color: '#7c3aed', bg: '#f5f3ff', dot: '#8b5cf6' },
  in_analysis:      { label: 'Analysis',         color: '#ea580c', bg: '#fff7ed', dot: '#f97316' },
  report_ready:     { label: 'Report Ready',     color: '#0891b2', bg: '#e0f7fa', dot: '#06b6d4' },
  completed:        { label: 'Completed',        color: '#059669', bg: '#ecfdf5', dot: '#10b981' },
  cancelled:        { label: 'Cancelled',        color: '#dc2626', bg: '#fef2f2', dot: '#ef4444' },
};

// Animated counter hook
const useCounter = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!target) return;
    const num = typeof target === 'number' ? target : parseFloat(target.replace(/[^0-9.]/g, ''));
    if (isNaN(num)) return;
    let start = 0;
    const step = num / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= num) { setCount(num); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
};

const StatCard = ({ icon, value, label, sub, to, color = ACCENT, delay = 0 }) => {
  const numVal = typeof value === 'number' ? value : 0;
  const count = useCounter(numVal);
  const displayVal = typeof value === 'string' ? value : count;

  return (
    <Link to={to} className="card-hover animate-fadeUp" style={{
      borderRadius: '20px', padding: '24px', position: 'relative', overflow: 'hidden',
      background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`,
      textDecoration: 'none', display: 'block',
      boxShadow: `0 8px 32px ${color}40`,
      animationDelay: `${delay}ms`,
    }}>
      {/* Background decoration */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
      <div style={{ position: 'absolute', bottom: '-30px', right: '20px', width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.07)' }} />

      <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '16px', backdropFilter: 'blur(10px)' }}>{icon}</div>
      <p style={{ fontSize: '32px', fontWeight: 900, color: 'white', fontFamily: "'Syne', sans-serif", lineHeight: 1, marginBottom: '6px' }}>{displayVal}</p>
      <p style={{ fontSize: '11px', fontWeight: 800, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '2px' }}>{label}</p>
      <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>{sub}</p>
    </Link>
  );
};

const WorkflowStep = ({ n, label, icon, isLast }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <div className="animate-fadeUp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', animationDelay: `${n * 80}ms` }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px',
        background: n <= 3 ? `linear-gradient(135deg, ${ACCENT}25, ${ACCENT}10)` : '#f8fafc',
        border: `2px solid ${n <= 3 ? `${ACCENT}30` : '#e2e8f0'}`,
        boxShadow: n <= 3 ? `0 4px 16px ${ACCENT}20` : 'none',
      }}>{icon}</div>
      <p style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginTop: '8px', textAlign: 'center', width: '60px', lineHeight: 1.3 }}>{label}</p>
    </div>
    {!isLast && (
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', paddingBottom: '2px' }}>
        <div style={{ width: '28px', height: '2px', background: `linear-gradient(90deg, ${ACCENT}50, #e2e8f0)`, borderRadius: '2px' }} />
        <div style={{ width: '0', height: '0', borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `7px solid #e2e8f0` }} />
      </div>
    )}
  </div>
);

const ClinicDashboardPage = () => {
  const { packages, loading: pkgLoading } = usePackages();
  const { labTests, loading: ltLoading }  = useLabTests();
  const { bookings, loading: bkLoading }  = useBookings();
  const { summary } = useRevenue();
  const pending = bookings.filter(b => b.status === 'booked').length;

  const statCards = [
    { icon: '📦', value: pkgLoading ? 0 : packages.length, label: 'Health Packages', sub: 'Active packages', to: '/clinic/packages', color: '#0bc5cf', delay: 0 },
    { icon: '🧪', value: ltLoading ? 0 : labTests.length,  label: 'Lab Tests',       sub: 'Available tests', to: '/clinic/lab-tests', color: '#7c3aed', delay: 80 },
    { icon: '📋', value: bkLoading ? 0 : bookings.length,  label: 'Total Bookings',  sub: `${pending} pending review`, to: '/clinic/bookings', color: '#f59e0b', delay: 160 },
    { icon: '💰', value: `₹${(summary?.monthly || 0).toLocaleString('en-IN')}`, label: 'Monthly Revenue', sub: 'This month earnings', to: '/clinic/revenue', color: '#059669', delay: 240 },
  ];

  const workflowSteps = [
    { n:1, label:'User Books',    icon:'👤' },
    { n:2, label:'Notified',      icon:'🔔' },
    { n:3, label:'Assign Tech',   icon:'🧑‍🔬' },
    { n:4, label:'Collect',       icon:'🧫' },
    { n:5, label:'Analysis',      icon:'🔬' },
    { n:6, label:'Upload',        icon:'📄' },
    { n:7, label:'Completed',     icon:'✅' },
  ];

  return (
    <div style={{ padding: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Welcome header */}
      <div className="animate-fadeUp" style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '26px', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, marginBottom: '4px' }}>
            Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'} 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Here's what's happening with your clinic today</p>
        </div>
        <Link to="/clinic/bookings" style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
          background: 'linear-gradient(135deg, #0bc5cf, #0891b2)', color: 'white',
          borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
          boxShadow: '0 6px 20px rgba(11,197,207,0.35)', transition: 'all 0.2s ease',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(11,197,207,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(11,197,207,0.35)'; }}
        >
          📋 View All Bookings
        </Link>
      </div>

      {/* Stat cards */}
      <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {statCards.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Workflow + Recent bookings */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '20px' }}>

        {/* Workflow */}
        <div className="card-hover animate-fadeUp" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', animationDelay: '100ms' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Booking Workflow</p>
              <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>7-step patient journey</p>
            </div>
            <Link to="/clinic/bookings" style={{ fontSize: '12px', fontWeight: 700, color: ACCENT, textDecoration: 'none', background: `rgba(11,197,207,0.1)`, padding: '4px 12px', borderRadius: '8px' }}>Manage →</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', paddingBottom: '4px', gap: '0' }}>
            {workflowSteps.map((s, i) => <WorkflowStep key={s.n} {...s} isLast={i === workflowSteps.length - 1} />)}
          </div>
        </div>

        {/* Quick actions */}
        <div className="card-hover animate-fadeUp" style={{ background: 'white', borderRadius: '20px', padding: '24px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', animationDelay: '160ms' }}>
          <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '15px', color: '#0f172a', marginBottom: '4px' }}>Quick Actions</p>
          <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500, marginBottom: '16px' }}>Jump to common tasks</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            {[
              { label: 'Create Package', icon: '📦', to: '/clinic/packages', color: '#0bc5cf' },
              { label: 'Add Lab Test',   icon: '🧪', to: '/clinic/lab-tests', color: '#7c3aed' },
              { label: 'View Bookings', icon: '📋', to: '/clinic/bookings',  color: '#f59e0b' },
              { label: 'Revenue Report',icon: '💰', to: '/clinic/revenue',   color: '#059669' },
            ].map(a => (
              <Link key={a.label} to={a.to} style={{
                display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px',
                borderRadius: '14px', textDecoration: 'none', transition: 'all 0.18s ease',
                background: `${a.color}0f`, border: `1.5px solid ${a.color}20`, color: a.color,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${a.color}18`; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 6px 20px ${a.color}20`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${a.color}0f`; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <span style={{ fontSize: '20px' }}>{a.icon}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, lineHeight: 1.3 }}>{a.label}</span>
              </Link>
            ))}
          </div>
          {/* Revenue mini card */}
          <div style={{ borderRadius: '16px', padding: '16px 20px', background: 'linear-gradient(135deg, #0bc5cf, #0891b2)', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-15px', right: '-15px', width: '70px', height: '70px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>Monthly Revenue</p>
            <p style={{ fontSize: '26px', fontWeight: 900, color: 'white', fontFamily: "'Syne', sans-serif" }}>₹{(summary?.monthly || 0).toLocaleString('en-IN')}</p>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '2px' }}>{bookings.filter(b => b.status === 'completed').length} completed bookings</p>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="card-hover animate-fadeUp" style={{ background: 'white', borderRadius: '20px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 4px 24px rgba(0,0,0,0.06)', overflow: 'hidden', animationDelay: '200ms' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '15px', color: '#0f172a' }}>Recent Bookings</p>
            <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>Latest patient activity</p>
          </div>
          <Link to="/clinic/bookings" style={{ fontSize: '12px', fontWeight: 700, color: ACCENT, textDecoration: 'none', background: `rgba(11,197,207,0.1)`, padding: '6px 14px', borderRadius: '10px', transition: 'all 0.15s ease' }}>View all →</Link>
        </div>

        {bkLoading ? (
          <div style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[1,2,3,4].map(n => <div key={n} className="skeleton" style={{ height: '64px' }} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <p style={{ fontSize: '40px', marginBottom: '8px' }}>📋</p>
            <p style={{ color: '#94a3b8', fontWeight: 600 }}>No bookings yet</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            {bookings.slice(0, 5).map((b, i) => {
              const cfg = statusCfg[b.status] || statusCfg.booked;
              const bId = b._id || b.id;
              return (
                <Link key={bId} to={`/clinic/bookings/${bId}`}
                  className="animate-fadeUp"
                  style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 24px', textDecoration: 'none',
                    borderBottom: i < Math.min(bookings.length - 1, 4) ? '1px solid #f8fafc' : 'none',
                    transition: 'all 0.15s ease', animationDelay: `${i * 50}ms`,
                    minWidth: '500px',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: `${ACCENT}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '15px', color: ACCENT, flexShrink: 0 }}>
                    {(b.user?.name || 'U').charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '2px' }}>{b.user?.name}</p>
                    <p style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>#{bId?.toString().slice(-5)} · {b.test?.name || b.package?.name}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '99px', fontSize: '11px', fontWeight: 700, background: cfg.bg, color: cfg.color }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: cfg.dot, display: 'inline-block' }} />
                      {cfg.label}
                    </span>
                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px', fontWeight: 600 }}>₹{b.test?.price || b.package?.offerPrice || 0}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicDashboardPage;