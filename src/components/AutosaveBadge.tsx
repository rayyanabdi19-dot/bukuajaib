import React from 'react';
import { Database, Check, RefreshCw, AlertCircle } from 'lucide-react';
import { AutosaveState } from '../hooks/useAutosaveIndexedDB';

interface AutosaveBadgeProps {
  autosave: AutosaveState;
  className?: string;
  showDetails?: boolean;
}

export const AutosaveBadge: React.FC<AutosaveBadgeProps> = ({
  autosave,
  className = '',
  showDetails = true,
}) => {
  const { lastSaved, isSaving, saveStatus, forceSaveNow } = autosave;

  const formatTime = (date: Date | null) => {
    if (!date) return 'Menyiapkan...';
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div
      onClick={() => forceSaveNow()}
      title={`Autosave IndexedDB aktif setiap 10 detik. Terakhir disimpan: ${
        lastSaved ? formatTime(lastSaved) : 'Belum ada'
      }. Klik untuk simpan manual sekarang.`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer select-none backdrop-blur-xs ${
        isSaving
          ? 'bg-orange-100/90 text-orange-800 border border-orange-300 shadow-2xs'
          : saveStatus === 'error'
          ? 'bg-rose-100/90 text-rose-800 border border-rose-300'
          : 'bg-white/70 hover:bg-white text-purple-950 border border-purple-200/80 shadow-2xs hover:border-purple-300'
      } ${className}`}
    >
      {isSaving ? (
        <RefreshCw className="w-3 h-3 text-orange-600 animate-spin shrink-0" />
      ) : saveStatus === 'error' ? (
        <AlertCircle className="w-3 h-3 text-rose-600 shrink-0" />
      ) : (
        <Database className="w-3 h-3 text-emerald-600 shrink-0" />
      )}

      <span className="font-semibold">
        {isSaving ? 'Menyimpan ke IndexedDB...' : 'IndexedDB Autosave'}
      </span>

      {showDetails && lastSaved && (
        <span className="text-[10px] text-purple-700/80 hidden sm:inline font-mono">
          • {formatTime(lastSaved)}
        </span>
      )}

      {/* Pulsing indicator dot */}
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          isSaving
            ? 'bg-orange-500 animate-ping'
            : saveStatus === 'error'
            ? 'bg-rose-500'
            : 'bg-emerald-500'
        }`}
      />
    </div>
  );
};
