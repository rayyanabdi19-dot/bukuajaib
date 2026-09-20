import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { Clock, CheckCircle2, History, ArrowRight, ShieldCheck } from 'lucide-react';

interface ActivityLogSectionProps {
  logs: ActivityLog[];
}

export const ActivityLogSection: React.FC<ActivityLogSectionProps> = ({ logs }) => {
  const [showAll, setShowAll] = useState(false);
  const displayedLogs = showAll ? logs : logs.slice(0, 6);

  return (
    <section className="glass-panel p-5 md:p-6 rounded-2xl border border-white/80 shadow-md flex flex-col justify-between" id="log-aktivitas">
      <div>
        <div className="flex items-center justify-between border-b border-purple-100/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-xs">
              <History className="w-4 h-4" />
            </span>
            <h3 className="font-serif-luxury text-lg md:text-xl font-bold text-[#1e1b4b]">
              Log Aktivitas Petugas
            </h3>
          </div>
          <span className="text-xs bg-orange-50 text-orange-800 font-bold px-2.5 py-0.5 rounded-full border border-orange-200 flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
            <span>Live Feed</span>
          </span>
        </div>

        {/* Activity List */}
        <div className="mt-4 space-y-3.5">
          {displayedLogs.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              Belum ada aktivitas baru. Catatan kehadiran petugas akan muncul di sini secara langsung.
            </div>
          ) : (
            displayedLogs.map((log) => {
              const dotColor =
                log.color === 'emerald'
                  ? 'bg-emerald-500'
                  : log.color === 'amber'
                  ? 'bg-orange-500'
                  : log.color === 'rose'
                  ? 'bg-purple-600'
                  : 'bg-gray-400';

              return (
                <div key={log.id} className="flex items-start gap-3 text-xs glass-card p-2.5 rounded-xl border border-white/70 shadow-2xs">
                  <span className="font-mono text-[11px] text-purple-900 font-semibold mt-0.5 whitespace-nowrap">
                    {log.time}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0 shadow-xs`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#1e1b4b] leading-snug font-medium">{log.message}</p>
                    {log.detail && (
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        {log.detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-purple-100/70 mt-4 text-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-purple-700 hover:text-purple-950 hover:underline inline-flex items-center gap-1.5 transition-colors"
        >
          <span>{showAll ? 'Tampilkan Lebih Sedikit' : `Lihat Seluruh ${logs.length} Riwayat Aktivitas`}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
