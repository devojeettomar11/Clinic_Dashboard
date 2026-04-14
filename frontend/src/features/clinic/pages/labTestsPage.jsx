import React, { useState } from 'react';
import { useLabTests } from '../hooks/useLabTests';
import { TEST_CATEGORIES } from '../types';
import ClinicPagination from '../components/ClinicPagination';

const ACCENT = '#0bc5cf';
const categoryColors = {
  'Blood Test':      'bg-red-50    text-red-600    border-red-100',
  'Thyroid Test':    'bg-violet-50 text-violet-600 border-violet-100',
  'Vitamin Test':    'bg-amber-50  text-amber-600  border-amber-100',
  'Lipid Profile':   'bg-orange-50 text-orange-600 border-orange-100',
  'Diabetes Panel':  'bg-pink-50   text-pink-600   border-pink-100',
  'Liver Function':  'bg-emerald-50 text-emerald-600 border-emerald-100',
  'Kidney Function': 'bg-cyan-50   text-cyan-600   border-cyan-100',
};
const emptyForm = { name: '', category: '', price: '', turnaround: '24 hrs', description: '' };

const LabTestsPage = () => {
  const { labTests, loading, saving, error, success, handleCreate, handleUpdate, handleDelete, page, totalPages, setPage } = useLabTests();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const display = labTests.filter((t) =>
    t.name?.toLowerCase().includes(search.toLowerCase()) ||
    t.category?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(emptyForm); setEditItem(null); setShowModal(true); };
  const openEdit = (t) => {
    setForm({ name: t.name, category: t.category, price: t.price, turnaround: t.turnaround || '24 hrs', description: t.description || '' });
    setEditItem(t);
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditItem(null); setForm(emptyForm); };

  const handleSubmit = async () => {
    const data = { ...form, price: Number(form.price) };
    const ok = editItem ? await handleUpdate(editItem._id || editItem.id, data) : await handleCreate(data);
    if (ok) closeModal();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Lab Tests</h2>
          <p className="text-gray-400 mt-1 text-sm">Manage individual diagnostic tests available for booking</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-5 py-3 text-sm font-bold text-white rounded-xl transition-all hover:opacity-90 active:scale-95 self-start sm:self-auto shrink-0"
          style={{ backgroundColor: ACCENT, boxShadow: `0 4px 12px ${ACCENT}50` }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Lab Test
        </button>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Tests',    value: labTests.length },
          { label: 'Active Tests',   value: labTests.filter((t) => t.isActive !== false).length },
          { label: 'Total Bookings', value: labTests.reduce((s, t) => s + (t.bookings || 0), 0) },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 border" style={{ backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}25` }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: ACCENT, opacity: 0.7 }}>{s.label}</p>
            <p className="text-3xl font-bold" style={{ color: ACCENT }}>{s.value}</p>
          </div>
        ))}
      </div>

      {success && (
        <div className="flex items-center gap-3 rounded-xl px-5 py-3.5 mb-5 text-sm font-semibold border"
          style={{ backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30`, color: ACCENT }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          {success}
        </div>
      )}

      <div className="relative mb-5 sm:mb-6">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tests by name or category..."
          className="w-full pl-11 pr-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 bg-white transition-all"
          style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }} />
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <div className="overflow-x-auto">
          <div className="grid px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-200 min-w-[600px]"
            style={{ gridTemplateColumns: '2fr 1fr 80px 100px 80px 100px' }}>
            {['Test Name', 'Category', 'Price', 'Turnaround', 'Status', 'Actions'].map((h) => (
              <p key={h} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</p>
            ))}
          </div>
          {loading ? (
            <div className="p-6 space-y-3 min-w-[600px]">
              {[1,2,3,4,5].map((n) => <div key={n} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
            </div>
          ) : display.length === 0 ? (
            <div className="text-center py-16 text-gray-300">
              <p className="text-4xl mb-3">🧪</p>
              <p className="text-sm font-medium">No lab tests found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 min-w-[600px]">
              {display.map((test) => {
                const catColor = categoryColors[test.category] || 'bg-gray-50 text-gray-600 border-gray-100';
                return (
                  <div key={test._id || test.id} className="grid items-center px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors"
                    style={{ gridTemplateColumns: '2fr 1fr 80px 100px 80px 100px' }}>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{test.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{test.bookings || 0} bookings</p>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border w-fit ${catColor}`}>{test.category}</span>
                    <p className="text-sm font-bold text-gray-800">₹{test.price}</p>
                    <p className="text-xs text-gray-500 font-medium">⏱ {test.turnaround}</p>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full w-fit border"
                      style={test.isActive !== false
                        ? { backgroundColor: `${ACCENT}10`, color: ACCENT, borderColor: `${ACCENT}25` }
                        : { backgroundColor: '#f3f4f6', color: '#9ca3af', borderColor: '#e5e7eb' }}>
                      {test.isActive !== false ? 'Active' : 'Off'}
                    </span>
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(test)} className="px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
                      <button onClick={() => setDeleteConfirm(test._id || test.id)} className="px-3 py-1.5 text-xs font-bold text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <ClinicPagination page={page} totalPages={totalPages} setPage={setPage} />

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-gray-800 mb-2">Delete Lab Test?</h3>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-xl hover:bg-gray-50">Cancel</button>
              <button onClick={() => { handleDelete(deleteConfirm); setDeleteConfirm(null); }} className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500 rounded-xl hover:bg-red-600">Delete</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h3 className="text-base font-bold text-gray-800">{editItem ? 'Edit Lab Test' : 'Add Lab Test'}</h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Test Name <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Complete Blood Count"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Category <span className="text-red-400">*</span></label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all bg-white">
                    <option value="">Select</option>
                    {TEST_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">Price (₹) <span className="text-red-400">*</span></label>
                  <input type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="299" className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Turnaround Time</label>
                <select value={form.turnaround} onChange={(e) => setForm((p) => ({ ...p, turnaround: e.target.value }))}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all bg-white">
                  {['4 hrs', '6 hrs', '12 hrs', '24 hrs', '48 hrs', '72 hrs'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Brief description..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all resize-none" />
              </div>
              {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
            </div>
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl sticky bottom-0">
              <button onClick={closeModal} className="px-5 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-white">Cancel</button>
              <button onClick={handleSubmit} disabled={saving || !form.name || !form.category || !form.price}
                className="px-6 py-2.5 text-sm font-bold text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:opacity-90"
                style={{ backgroundColor: ACCENT, boxShadow: `0 4px 12px ${ACCENT}40` }}>
                {saving ? 'Saving...' : editItem ? 'Update Test' : 'Add Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabTestsPage;
