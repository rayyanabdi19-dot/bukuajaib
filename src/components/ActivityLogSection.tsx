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
    <section className="bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm flex flex-col justify-between" id="log-aktivitas">
      <div>
        <div className="flex items-center justify-between border-b border-[#eeeeed] pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#8b5e3c]/10 text-[#6f4627]">
              <History className="w-4 h-4" />
            </span>
            <h3 className="font-serif-luxury text-lg md:text-xl font-bold text-[#6f4627]">
              Log Aktivitas Petugas
            </h3>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping"></span>
            <span>Live Feed</span>
          </span>
        </div>

        {/* Activity List */}
        <div className="mt-4 space-y-3.5">
          {displayedLogs.map((log) => {
            const dotColor =
              log.color === 'emerald'
                ? 'bg-emerald-600'
                : log.color === 'amber'
                ? 'bg-amber-600'
                : log.color === 'rose'
                ? 'bg-rose-600'
                : 'bg-[#51443c]';

            return (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <span className="font-mono text-[11px] text-[#51443c] mt-0.5 whitespace-nowrap">
                  {log.time}
                </span>
                <div className={`w-2 h-2 rounded-full ${dotColor} mt-1.5 shrink-0`}></div>
                <div className="flex-1">
                  <p className="text-[#1a1c1c] leading-snug">{log.message}</p>
                  {log.detail && (
                    <p className="text-[11px] text-[#51443c] mt-0.5 font-medium">
                      {log.detail}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 border-t border-[#eeeeed] mt-4 text-center">
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-[#6f4627] hover:underline inline-flex items-center gap-1"
        >
          <span>{showAll ? 'Tampilkan Lebih Sedikit' : `Lihat Seluruh ${logs.length} Riwayat Aktivitas`}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
