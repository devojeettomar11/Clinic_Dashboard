import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

const icons = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  ),
  info: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const styles = {
  success: { bg: 'linear-gradient(135deg,#059669,#047857)', icon: '#fff' },
  error:   { bg: 'linear-gradient(135deg,#dc2626,#b91c1c)', icon: '#fff' },
  info:    { bg: 'linear-gradient(135deg,#0bc5cf,#0891b2)', icon: '#fff' },
  warning: { bg: 'linear-gradient(135deg,#d97706,#b45309)', icon: '#fff' },
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed', bottom: '24px', right: '24px',
        zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px',
        pointerEvents: 'none', maxWidth: '340px', width: '100%',
      }}>
        {toasts.map((t) => {
          const s = styles[t.type];
          return (
            <div key={t.id} className="notif-enter" style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '14px 18px', borderRadius: '14px',
              background: s.bg, color: '#fff',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              pointerEvents: 'all', cursor: 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }} onClick={() => removeToast(t.id)}>
              <span style={{ flexShrink: 0 }}>{icons[t.type]}</span>
              <p style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.4, flex: 1 }}>{t.message}</p>
              <button style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>×</button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);