import React from 'react';

const ACCENT = '#0bc5cf';

const ClinicPagination = ({ page, totalPages, setPage }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-4 mt-8 pb-4">
      <button
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-4 py-2 text-sm font-bold border rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 active:scale-95"
        style={{ borderColor: '#e5e7eb', color: '#374151' }}
      >
        ← Previous
      </button>

      <div className="flex items-center gap-2">
        <span className="text-sm font-bold" style={{ color: '#374151' }}>Page {page}</span>
        <span className="text-sm text-gray-400">of</span>
        <span className="text-sm font-bold" style={{ color: '#374151' }}>{totalPages}</span>
      </div>

      <button
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="px-4 py-2 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 active:scale-95 shadow-sm"
        style={{ backgroundColor: ACCENT }}
      >
        Next →
      </button>
    </div>
  );
};

export default ClinicPagination;
