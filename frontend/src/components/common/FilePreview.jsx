import React from 'react';

const FilePreview = ({ fileUrl, fileName, onClear }) => {
  const isPdf = fileName?.toLowerCase().endsWith('.pdf') || fileUrl?.includes('.pdf');
  return (
    <div className="mt-3 flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl">
      <span className="text-2xl">{isPdf ? '📄' : '🖼️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{fileName || 'File'}</p>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-sky-500 hover:underline">
          View File
        </a>
      </div>
      {onClear && (
        <button onClick={onClear} className="text-slate-400 hover:text-red-500 transition-colors text-lg leading-none">×</button>
      )}
    </div>
  );
};

export default FilePreview;
