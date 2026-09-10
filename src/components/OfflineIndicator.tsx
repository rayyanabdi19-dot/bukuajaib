import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (isOnline) {
    return null;
  }

  if (dismissed) {
    return (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold shadow-lg hover:bg-amber-700 transition-all active:scale-95"
        title="Klik untuk melihat detail status offline"
      >
        <WifiOff className="w-3.5 h-3.5 animate-pulse" />
        <span>Mode Offline Aktif</span>
      </button>
    );
  }

  return (
    <aside 
      aria-label="Pemberitahuan Status Jaringan Offline"
      className="fixed bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-50 bg-[#2d1b11] text-[#faecc8] p-3.5 rounded-2xl shadow-2xl border border-amber-600/50 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
        <WifiOff className="w-5 h-5 animate-pulse" />
      </div>

      <div className="flex-1 min-w-0 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-amber-300 text-sm">Mode Offline (Stale-While-Revalidate)</span>
          <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded text-[10px] font-mono">
            Cache Aktif
          </span>
        </div>
        <p className="text-[#e2d2c3] mt-1 leading-relaxed">
          Koneksi internet terputus. Aplikasi tetap berjalan mulus menggunakan berkas statis & cache lokal. Anda tetap dapat mencatat tamu dan menghitung amplop di meja resepsi.
        </p>
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] text-emerald-300 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Data tersimpan aman di peramban ini & akan sinkron saat online.</span>
        </div>
      </div>

      <button
        onClick={() => setDismissed(true)}
        className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors shrink-0"
        title="Kecilkan pemberitahuan"
        aria-label="Tutup"
      >
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
