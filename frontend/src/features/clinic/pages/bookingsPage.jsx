import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { BOOKING_STEPS } from '../types';
import ClinicPagination from '../components/ClinicPagination';

const ACCENT = '#0bc5cf';

const statusCfg = {
  booked:           { label: 'Pending',          color: '#d97706', bg: '#fef9c3', border: '#fde68a', barColor: '#f59e0b', step: 1 },
  assigned:         { label: 'Assigned',         color: ACCENT,    bg: `${ACCENT}12`, border: `${ACCENT}30`, barColor: ACCENT, step: 2 },
  sample_collected: { label: 'Sample Collected', color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', barColor: '#8b5cf6', step: 3 },
  in_analysis:      { label: 'In Analysis',      color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', barColor: '#f97316', step: 4 },
  report_ready:     { label: 'Report Ready',     color: '#0891b2', bg: '#e0f7fa', border: '#b2ebf2', barColor: '#06b6d4', step: 5 },
  completed:        { label: 'Completed',        color: '#059669', bg: '#ecfdf5', border: '#a7f3d0', barColor: '#10b981', step: 6 },
  cancelled:        { label: 'Cancelled',        color: '#dc2626', bg: '#fef2f2', border: '#fecaca', barColor: '#ef4444', step: 0 },
};

const nextAction = {
  booked:           { label: 'Assign Technician',       next: 'assigned' },
  assigned:         { label: 'Mark Sample Collected',   next: 'sample_collected' },
  sample_collected: { label: 'Start Lab Analysis',      next: 'in_analysis' },
  in_analysis:      { label: 'Upload Report',           next: 'report_ready' },
  report_ready:     { label: 'Mark Completed',          next: 'completed' },
};

const tabs = [
  { label: 'All',              value: '' },
  { label: 'Pending',          value: 'booked' },
  { label: 'Assigned',         value: 'assigned' },
  { label: 'Sample Collected', value: 'sample_collected' },
  { label: 'In Analysis',      value: 'in_analysis' },
  { label: 'Report Ready',     value: 'report_ready' },
  { label: 'Completed',        value: 'completed' },
];

const BookingsPage = () => {
  const { bookings, technicians, loading, actionLoading, success, filterByStatus,
    handleAssignTechnician, handleStatusUpdate, handleUploadReport, handleCancel,
    page, totalPages, setPage } = useBookings();

  const [activeTab, setActiveTab]     = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTech, setSelectedTech] = useState('');
  const [uploadModal, setUploadModal] = useState(null);
  const fileRef = useRef();

  const filtered = activeTab ? bookings.filter((b) => b.status === activeTab) : bookings;

  const handleTab = (val) => { setActiveTab(val); filterByStatus(val); };

  const handleAction = async (booking) => {
    if (booking.status === 'booked')       { setAssignModal(booking); return; }
    if (booking.status === 'in_analysis')  { setUploadModal(booking); return; }
    await handleStatusUpdate(booking._id || booking.id, nextAction[booking.status]?.next);
  };

  const confirmAssign = async () => {
    if (!selectedTech) return;
    const tech = technicians.find((t) => (t._id || t.id) === selectedTech);
    await handleAssignTechnician(assignModal._id || assignModal.id, {
      technicianId: tech?._id || tech?.id,
      technicianName: tech?.name,
      technicianPhone: tech?.phone,
    });
    setAssignModal(null); setSelectedTech('');
  };

  const confirmUpload = async (file) => {
    if (!file) return;
    await handleUploadReport(uploadModal._id || uploadModal.id, file);
    setUploadModal(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="mb-5 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Lab Test Bookings</h2>
        <p className="text-gray-400 mt-1 text-sm">Manage the full 6-step lab test workflow</p>
      </div>

      {/* Workflow step tracker */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-5 mb-5 sm:mb-6 overflow-x-auto" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        <div className="flex items-center min-w-max gap-1">
          {BOOKING_STEPS.map((step, i) => {
            const count = bookings.filter((b) => b.status === step.key).length;
            const isActive = count > 0;
            return (
              <React.Fragment key={step.key}>
                <button onClick={() => handleTab(step.key)}
                  className={`flex flex-col items-center px-2 sm:px-3 py-2 rounded-xl transition-all ${activeTab === step.key ? 'border' : 'hover:bg-gray-50'}`}
                  style={activeTab === step.key ? { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` } : {}}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold mb-1.5"
                    style={isActive ? { backgroundColor: `${ACCENT}18`, color: ACCENT } : { backgroundColor: '#f3f4f6', color: '#9ca3af' }}>
                    {step.step}
                  </div>
                  <p className="text-xs font-semibold text-center leading-tight w-16 sm:w-20"
                    style={{ color: isActive ? '#374151' : '#9ca3af' }}>{step.label}</p>
                  {isActive && <span className="mt-1 text-xs font-bold" style={{ color: ACCENT }}>{count}</span>}
                </button>
                {i < BOOKING_STEPS.length - 1 && (
                  <svg width="16" height="12" viewBox="0 0 20 14" fill="none" className="shrink-0 mb-4">
                    <path d="M1 7h16m0 0l-5-5m5 5l-5 5" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {tabs.map((tab) => (
          <button key={tab.value} onClick={() => handleTab(tab.value)}
            className="flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all border shrink-0"
            style={activeTab === tab.value
              ? { backgroundColor: ACCENT, color: '#fff', borderColor: ACCENT, boxShadow: `0 4px 12px ${ACCENT}40` }
              : { backgroundColor: '#fff', color: '#6b7280', borderColor: '#e5e7eb' }}>
            {tab.label}
          </button>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl px-5 py-3 mb-4 text-sm font-semibold border"
          style={{ backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30`, color: ACCENT }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {[1,2,3,4,5,6].map((n) => <div key={n} className="h-56 bg-gray-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-5xl mb-4">📋</p>
          <p className="text-base font-bold text-gray-400">No bookings found</p>
          <p className="text-sm text-gray-300 mt-1">Try a different filter tab</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((booking) => {
            const cfg = statusCfg[booking.status] || statusCfg.booked;
            const isLoading = actionLoading === (booking._id || booking.id);
            const action = nextAction[booking.status];
            const bId = booking._id || booking.id;
            return (
              <div key={bId} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <div className="h-1.5 w-full" style={{ backgroundColor: cfg.barColor }} />
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <Link to={`/clinic/bookings/${bId}`} className="flex items-center gap-3 min-w-0 flex-1 hover:opacity-80 group">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm sm:text-base shrink-0"
                        style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>
                        {(booking.user?.name || 'U').charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate group-hover:text-teal-600 transition-colors uppercase tracking-tight">{booking.user?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-0.5">#{bId?.toString().slice(-5)}</p>
                      </div>
                    </Link>
                    <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0"
                      style={{ backgroundColor: cfg.bg, color: cfg.color, borderColor: cfg.border }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.barColor }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="rounded-xl p-3 mb-3 space-y-1.5" style={{ backgroundColor: '#f8fafc' }}>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>🧪</span>
                      <span className="font-semibold truncate">{booking.test?.name || booking.package?.name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span>📅 {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString() : 'N/A'}</span>
                      <span className="font-bold text-gray-700">₹{booking.test?.price || booking.package?.offerPrice || '0'}</span>
                    </div>
                    {booking.address && (
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span>📍</span><span className="truncate">{booking.address}</span>
                      </div>
                    )}
                    {booking.assignedTechnician && (
                      <div className="flex items-center gap-2 text-xs font-medium" style={{ color: ACCENT }}>
                        <span>🧑‍🔬</span><span className="truncate">{booking.assignedTechnician}</span>
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="flex gap-1 mb-3">
                    {[1,2,3,4,5,6].map((s) => (
                      <div key={s} className="flex-1 h-1 rounded-full"
                        style={{ backgroundColor: s <= cfg.step ? ACCENT : '#e5e7eb' }} />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {action && (
                      <button onClick={() => handleAction(booking)} disabled={isLoading}
                        className="flex-1 py-2.5 text-xs font-bold text-white rounded-xl disabled:opacity-50 transition-all hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: ACCENT }}>
                        {isLoading ? 'Wait...' : action.label}
                      </button>
                    )}
                    {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                      <button onClick={() => handleCancel(bId)} disabled={isLoading}
                        className="px-3 py-2.5 text-xs font-bold text-red-500 border border-red-200 bg-red-50 rounded-xl hover:bg-red-100 transition-all">✕</button>
                    )}
                    {booking.status === 'completed' && (
                      <div className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl" style={{ backgroundColor: `${ACCENT}10` }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                        <span className="text-xs font-bold" style={{ color: ACCENT }}>Completed</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ClinicPagination page={page} totalPages={totalPages} setPage={setPage} />

      {/* Assign Technician Modal */}
      {assignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 className="text-base font-bold text-gray-800 mb-1">Assign Technician</h3>
            <p className="text-xs text-gray-400 mb-5">For: <strong className="text-gray-600">{assignModal.test?.name || assignModal.package?.name}</strong> · {assignModal.user?.name}</p>
            <div className="space-y-2 mb-5">
              {technicians.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">No technicians found. Add technicians from the database.</p>
              ) : technicians.map((tech) => (
                <button key={tech._id || tech.id} onClick={() => setSelectedTech(tech._id || tech.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all"
                  style={selectedTech === (tech._id || tech.id)
                    ? { borderColor: ACCENT, backgroundColor: `${ACCENT}10` }
                    : { borderColor: '#e5e7eb', backgroundColor: '#fff' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ backgroundColor: `${ACCENT}15`, color: ACCENT }}>{tech.name.charAt(0)}</div>
                  <p className="text-sm font-semibold text-gray-700 flex-1">{tech.name}</p>
                  {selectedTech === (tech._id || tech.id) && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setAssignModal(null); setSelectedTech(''); }}
                className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={confirmAssign} disabled={!selectedTech}
                className="flex-1 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 hover:opacity-90"
                style={{ backgroundColor: ACCENT }}>Assign</button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Report Modal */}
      {uploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 className="text-base font-bold text-gray-800 mb-1">Upload Lab Report</h3>
            <p className="text-xs text-gray-400 mb-5">For: <strong className="text-gray-600">{uploadModal.test?.name || uploadModal.package?.name}</strong> · {uploadModal.user?.name}</p>
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => confirmUpload(e.target.files[0])} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full flex flex-col items-center justify-center py-10 border-2 border-dashed rounded-2xl hover:border-opacity-70 transition-all cursor-pointer mb-4"
              style={{ borderColor: `${ACCENT}40`, backgroundColor: `${ACCENT}05` }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.5" className="mb-3">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="text-sm font-semibold text-gray-500">Click to select report</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG accepted</p>
            </button>
            <button onClick={() => setUploadModal(null)}
              className="w-full py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
