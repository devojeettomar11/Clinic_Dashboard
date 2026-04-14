import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { LogOut, Settings, Globe } from 'lucide-react';
import useAuthStore from '../../auth/store/authStore';

const ACCENT = '#0bc5cf';

const navItems = [
  { label: 'Dashboard',        path: '/clinic/dashboard', icon: '🏠' },
  { label: 'Health Packages',  path: '/clinic/packages',  icon: '📦' },
  { label: 'Lab Tests',        path: '/clinic/lab-tests', icon: '🧪' },
  { label: 'Bookings',         path: '/clinic/bookings',  icon: '📋' },
  { label: 'Revenue',          path: '/clinic/revenue',   icon: '💰' },
  { label: 'Clinic Setup',     path: '/clinic/setup',     icon: '🛠️' },
];

const pageTitles = {
  '/clinic/dashboard': 'Dashboard',
  '/clinic/packages':  'Health Packages',
  '/clinic/lab-tests': 'Lab Tests',
  '/clinic/bookings':  'Bookings',
  '/clinic/revenue':   'Revenue',
  '/clinic/settings':  'Settings',
  '/clinic/setup':     'Clinic Setup',
};

const getInitials = (name) => {
  if (!name) return 'CA';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().substring(0, 2);
};

const ClinicLayout = () => {
  const { user, logout, refreshUser, loading } = useAuthStore();
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'Clinic Admin';
  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleToggle = () => {
    if (window.innerWidth < 768) setMobileOpen((p) => !p);
    else setCollapsed((p) => !p);
  };

  const NavLinks = ({ onClose, onLogout }) => (
    <nav className="flex-1 py-4 overflow-y-auto flex flex-col">
      <div className="flex-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            title={item.label}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5 ${
                isActive ? 'font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: `${ACCENT}18`, color: ACCENT } : {}}
          >
            <span className="shrink-0 text-xl leading-none">{item.icon}</span>
            {(!collapsed || onClose) && (
              <span className="whitespace-nowrap text-sm leading-none">{item.label}</span>
            )}
          </NavLink>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-100 mx-2 space-y-1">
        <NavLink
          to="/clinic/settings"
          onClick={onClose}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              isActive ? 'font-semibold bg-gray-50' : 'text-gray-500 hover:bg-gray-50'
            }`
          }
          style={({ isActive }) => isActive ? { color: ACCENT } : {}}
        >
          <Settings size={20} className="shrink-0" />
          {(!collapsed || onClose) && <span className="whitespace-nowrap text-sm font-medium">Settings</span>}
        </NavLink>

        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-gray-500 hover:bg-gray-50"
        >
          <Globe size={20} className="shrink-0" />
          {(!collapsed || onClose) && <span className="whitespace-nowrap text-sm font-medium">Back to Website</span>}
        </Link>

        <button
          onClick={() => { if (window.confirm('Logout?')) onLogout(); }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-rose-500 hover:bg-rose-50 font-semibold transition-all"
        >
          <LogOut size={20} className="shrink-0" />
          {(!collapsed || onClose) && <span className="whitespace-nowrap font-bold italic">Logout</span>}
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col shrink-0 bg-white border-r border-gray-100 transition-all duration-300"
        style={{ width: collapsed ? '72px' : '240px', boxShadow: '2px 0 16px rgba(0,0,0,0.06)' }}
      >
        <div className="flex items-center gap-3 px-4 border-b border-gray-100 shrink-0" style={{ height: '72px' }}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #0891b2)` }}>🏥</div>
            {!collapsed && <span className="font-black text-gray-800 text-sm">MedyGhar</span>}
          </div>
        </div>
        <NavLinks onClose={null} onLogout={logout} />
        <div className="px-3 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #0891b2)` }}>
              {getInitials(user?.name)}
            </div>
            {!collapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-gray-800 truncate">{user?.name || 'Clinic Admin'}</p>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1 border ${
                  user?.clinic?.status === 'active'
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                    : 'bg-amber-100 text-amber-700 border-amber-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${user?.clinic?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {user?.clinic?.status || 'Pending'}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Mobile drawer */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-white border-r border-gray-100 transform transition-transform duration-300 md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ boxShadow: '4px 0 24px rgba(0,0,0,0.12)' }}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-black"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #0891b2)` }}>🏥</div>
            <span className="font-black text-gray-800 text-sm">MedyGhar Clinic</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <NavLinks onClose={() => setMobileOpen(false)} onLogout={logout} />
        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #0891b2)` }}>
              {getInitials(user?.name)}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800">{user?.name || 'Clinic Admin'}</p>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest inline-flex items-center gap-1 border ${
                user?.clinic?.status === 'active'
                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : 'bg-amber-100 text-amber-700 border-amber-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${user?.clinic?.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {user?.clinic?.status || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="shrink-0 bg-white flex items-center justify-between px-4 sm:px-6 border-b border-gray-100"
          style={{ height: '72px', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }}>
          <div className="flex items-center gap-3">
            <button onClick={handleToggle}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-gray-800 leading-none">{pageTitle}</h1>
              <p className="text-xs text-gray-400 mt-0.5">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={refreshUser} disabled={loading}
              className="w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-sky-50 hover:text-sky-500 transition-all"
              title="Refresh clinic status">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
            <button className="relative w-10 h-10 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {((!user?.clinic || user?.clinic?.status !== 'active') &&
            location.pathname !== '/clinic/setup' &&
            location.pathname !== '/clinic/settings') ? (
            <div className="flex flex-col items-center justify-center min-h-[80vh] p-8 text-center bg-white rounded-3xl m-8 border border-gray-100 shadow-sm">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                {!user?.clinic ? 'Clinic Profile Missing' : 'Pending Activation'}
              </h2>
              <p className="text-gray-500 max-w-sm mb-6 leading-relaxed">
                {!user?.clinic
                  ? "You haven't set up your clinic profile yet. Complete the setup to start using features."
                  : 'Your clinic is under review. Once the admin activates it, you can access all features.'}
              </p>
              <div className="flex items-center gap-3">
                <Link to="/clinic/setup"
                  className="px-8 py-4 rounded-xl text-white font-bold transition-all"
                  style={{ backgroundColor: ACCENT, boxShadow: `0 4px 12px ${ACCENT}40` }}>
                  {!user?.clinic ? 'Complete Clinic Setup' : 'View Setup Status'}
                </Link>
                <button onClick={refreshUser} disabled={loading}
                  className="px-6 py-3 rounded-xl font-semibold text-sm border border-gray-200 bg-gray-50 text-gray-600 hover:bg-sky-50 hover:text-sky-600 transition-all flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }}>
                    <path d="M23 4v6h-6" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                  {loading ? 'Checking...' : 'Refresh Status'}
                </button>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default ClinicLayout;
