import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';

const ACCENT = '#0bc5cf';

const statusCfg = {
  booked:           { label: 'Booked',             color: '#d97706', bg: '#fef9c3', icon: '📋' },
  assigned:         { label: 'Technician Assigned', color: ACCENT,    bg: `${ACCENT}12`, icon: '🧑‍🔬' },
  sample_collected: { label: 'Sample Collected',    color: '#7c3aed', bg: '#f5f3ff', icon: '🧫' },
  in_analysis:      { label: 'In Analysis',         color: '#ea580c', bg: '#fff7ed', icon: '🔬' },
  report_ready:     { label: 'Report Ready',        color: '#0891b2', bg: '#e0f7fa', icon: '📄' },
  completed:        { label: 'Completed',           color: '#059669', bg: '#ecfdf5', icon: '✅' },
  cancelled:        { label: 'Cancelled',           color: '#dc2626', bg: '#fef2f2', icon: '✕' },
};

const nextSteps = {
  booked:           { label: 'Assign Technician',     next: 'assigned' },
  assigned:         { label: 'Mark Sample Collected', next: 'sample_collected' },
  sample_collected: { label: 'Start Lab Analysis',    next: 'in_analysis' },
  in_analysis:      { label: 'Upload Report',         next: 'report_ready' },
  report_ready:     { label: 'Finalize & Complete',   next: 'completed' },
};

const BookingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentBooking: booking, loading, error, success,
    fetchBookingById, handleStatusUpdate, handleAssignTechnician,
    handleUploadReport, handleCancel, technicians, actionLoading } = useBookings();
  const fileInputRef = useRef(null);

  const [note, setNote]                   = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [techName, setTechName]           = useState('');
  const [techId, setTechId]               = useState('');
  const [techPhone, setTechPhone]         = useState('');

  useEffect(() => { if (id) fetchBookingById(id); }, [id, fetchBookingById]);

  if (loading && !booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-t-teal-500 border-gray-200 rounded-full animate-spin mb-4" />
        <p className="text-gray-500 font-medium italic">Loading booking details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-100 shadow-sm m-6">
        <p className="text-red-500 font-bold mb-4">{error || 'Booking not found'}</p>
        <button onClick={() => navigate('/clinic/bookings')} className="text-teal-600 font-bold hover:underline">← Back to All Bookings</button>
      </div>
    );
  }

  const bId          = booking._id || booking.id;
  const currentStep  = statusCfg[booking.status] || statusCfg.booked;
  const nextStep     = nextSteps[booking.status];

  const onAction = async () => {
    if (booking.status === 'booked') {
      if (!techName) return;
      await handleAssignTechnician(bId, { technicianId: techId, technicianName: techName, technicianPhone: techPhone });
      setTechName(''); setTechId(''); setTechPhone('');
    } else {
      await handleStatusUpdate(bId, nextStep.next, note);
      setNote(''); setShowNoteInput(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) await handleUploadReport(bId, file);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-10 max-w-7xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <button onClick={() => navigate('/clinic/bookings')}
            className="text-xs font-bold text-gray-400 hover:text-gray-600 mb-2 block uppercase tracking-widest">← Back to List</button>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3 flex-wrap">
            Booking <span style={{ color: ACCENT }}>#{bId?.toString().slice(-5)}</span>
            <span className="text-[10px] sm:text-xs px-3 py-1 rounded-full border lowercase"
              style={{ backgroundColor: currentStep.bg, color: currentStep.color, borderColor: `${currentStep.color}30` }}>
              • {currentStep.label}
            </span>
          </h1>
        </div>
        {booking.status !== 'completed' && booking.status !== 'cancelled' && (
          <button onClick={() => handleCancel(bId)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-all border border-red-100">
            Cancel Booking
          </button>
        )}
      </div>

      {success && (
        <div className="mb-6 flex items-center gap-3 rounded-xl px-5 py-3 text-sm font-semibold border"
          style={{ backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30`, color: ACCENT }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-6xl opacity-[0.03] select-none pointer-events-none">{currentStep.icon}</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Patient Information</p>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.user?.name}</h3>
                <p className="text-sm text-gray-500 mb-1">📞 {booking.user?.phone || 'N/A'}</p>
                <p className="text-sm text-gray-500">📍 {booking.address || 'Clinic Visit'}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3">Test Details</p>
                <h3 className="text-xl font-bold text-gray-800 mb-1">{booking.test?.name || booking.package?.name || 'N/A'}</h3>
                <p className="text-sm font-bold mt-1" style={{ color: ACCENT }}>₹{booking.test?.price || booking.package?.offerPrice || 0}</p>
                <p className="text-xs text-gray-400 mt-1 italic">
                  Date: {booking.scheduledDate ? new Date(booking.scheduledDate).toLocaleDateString(undefined, { dateStyle: 'long' }) : new Date(booking.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
              </div>
            </div>

            {/* Action Section */}
            {nextStep && (
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm text-sm border border-gray-100">⚡</span>
                  <h4 className="text-sm font-bold text-gray-700">Next Action: {nextStep.label}</h4>
                </div>

                {booking.status === 'booked' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="sm:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Full Name</label>
                        <input type="text" placeholder="e.g. John Doe"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                          value={techName} onChange={(e) => setTechName(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Employee/Technician ID</label>
                        <input type="text" placeholder="e.g. TECH001"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                          value={techId} onChange={(e) => setTechId(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">Mobile Number</label>
                        <input type="tel" placeholder="e.g. 9876543210"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none bg-white font-medium"
                          value={techPhone} onChange={(e) => setTechPhone(e.target.value)} />
                      </div>
                    </div>
                    <button onClick={onAction} disabled={!techName || actionLoading}
                      className="w-full py-3.5 rounded-xl font-black text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 mt-2"
                      style={{ backgroundColor: ACCENT }}>
                      {actionLoading ? 'Assigning...' : 'Confirm & Assign Technician'}
                    </button>
                  </div>
                ) : booking.status === 'in_analysis' ? (
                  <label className="block w-full cursor-pointer group">
                    <input type="file" className="hidden" onChange={handleFileUpload} />
                    <div className="py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center group-hover:border-teal-400 transition-colors bg-white">
                      <span className="text-3xl mb-2">📄</span>
                      <p className="text-sm font-bold text-gray-700">Choose Report File (PDF/Image)</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">Max size 10MB</p>
                    </div>
                  </label>
                ) : showNoteInput ? (
                  <div className="space-y-3">
                    <textarea placeholder="Enter optional notes for this step..."
                      className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-none min-h-[100px]"
                      value={note} onChange={(e) => setNote(e.target.value)} />
                    <div className="flex gap-2">
                      <button onClick={() => setShowNoteInput(false)} className="flex-1 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-gray-100">Cancel</button>
                      <button onClick={onAction} disabled={actionLoading}
                        className="flex-1 py-3 rounded-xl text-sm font-bold text-white shadow-md"
                        style={{ backgroundColor: ACCENT }}>
                        {actionLoading ? 'Saving...' : 'Confirm & Save'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowNoteInput(true)}
                    className="w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95"
                    style={{ backgroundColor: ACCENT }}>
                    Proceed to {nextStep.label}
                  </button>
                )}
              </div>
            )}

            {/* Reports */}
            {booking.reportUrls?.length > 0 && (
              <div className="mt-8 border-t border-gray-50 pt-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest">Attached Reports</h4>
                  {booking.status !== 'completed' && booking.status !== 'cancelled' && (
                    <>
                      <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                      <button onClick={() => fileInputRef.current.click()} disabled={actionLoading}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg border border-teal-100 text-teal-600 bg-teal-50 hover:bg-teal-100 transition-all">
                        {actionLoading ? 'Uploading...' : '+ Add Report'}
                      </button>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {booking.reportUrls.map((url, i) => (
                    <a key={i} href={url.startsWith('http') ? url : `http://localhost:5000${url}`}
                      target="_blank" rel="noopener noreferrer"
                      className="px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs font-bold text-gray-600 hover:bg-white hover:border-teal-200 transition-all">
                      📄 Result {i + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 border-b border-gray-50 pb-4">Workflow History</h3>
            <div className="relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-gray-100" />
              <div className="space-y-8 relative">
                {(booking.workflowHistory || []).slice().reverse().map((event, i) => {
                  const cfg = statusCfg[event.status] || statusCfg.booked;
                  return (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-5 h-5 rounded-full border-4 border-white shadow-sm mt-0.5 relative z-10 shrink-0"
                        style={{ backgroundColor: cfg.color }} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs font-black text-gray-800 uppercase tracking-tight">{cfg.label}</p>
                          <span className="text-[10px] text-gray-400 font-medium">
                            {new Date(event.timestamp).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed font-medium bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">{event.description}</p>
                      </div>
                    </div>
                  );
                })}
                {(!booking.workflowHistory || booking.workflowHistory.length === 0) && (
                  <div className="flex gap-4 relative">
                    <div className="w-5 h-5 rounded-full border-4 border-white shadow-sm mt-0.5 relative z-10 shrink-0 bg-amber-500" />
                    <div>
                      <p className="text-xs font-black text-gray-800 uppercase mb-1">Booking Created</p>
                      <p className="text-xs text-gray-400">System initialized the test booking.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {booking.assignedTechnician && (
            <div className="rounded-2xl p-6 text-white shadow-xl" style={{ background: 'linear-gradient(135deg, #0bc5cf 0%, #0891b2 100%)' }}>
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Assigned Technician</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-xl">🧑‍🔬</div>
                <div>
                  <h4 className="font-bold text-lg leading-none mb-1">{booking.assignedTechnician}</h4>
                  <p className="text-xs text-teal-100">Lab Technician (Verified)</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
