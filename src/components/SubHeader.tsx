import React from 'react';
import { WeddingEventInfo } from '../types';
import { 
  CalendarCheck, 
  MapPin, 
  UserPlus, 
  FileText, 
  Table2, 
  Sliders
} from 'lucide-react';
import { AutosaveBadge } from './AutosaveBadge';
import { AutosaveState } from '../hooks/useAutosaveIndexedDB';

interface SubHeaderProps {
  eventInfo: WeddingEventInfo;
  onOpenReceptionModal: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onOpenEventSettings?: () => void;
  syncStatus?: 'connected' | 'syncing' | 'offline';
  connectedDevicesCount?: number;
  firebaseConnected?: boolean;
  autosave?: AutosaveState;
}

export const SubHeader: React.FC<SubHeaderProps> = ({
  eventInfo,
  onOpenReceptionModal,
  onExportPdf,
  onExportExcel,
  onOpenEventSettings,
  syncStatus = 'connected',
  connectedDevicesCount = 2,
  firebaseConnected = true,
  autosave,
}) => {
  return (
    <section className="glass-panel border-b border-purple-100/70 py-4 px-4 md:px-6 shadow-xs">
      <div className="max-w-[78rem] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-purple-900 text-xs font-bold uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <CalendarCheck className="w-4 h-4 text-orange-600 shrink-0" />
              <span>Resepsi Pernikahan Resmi</span>
            </div>
            {autosave && (
              <AutosaveBadge autosave={autosave} />
            )}
          </div>

          <h1 className="font-serif-luxury text-lg sm:text-xl md:text-2xl text-[#1e1b4b] font-bold mt-0.5 break-words">
            {eventInfo.fullTitle}
          </h1>

          <div className="text-xs sm:text-sm text-gray-600 flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="font-semibold text-purple-950">{eventInfo.dateStr}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
              <span>{eventInfo.location}</span>
            </span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="w-full md:w-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-1 shrink-0">
          <button
            onClick={onOpenReceptionModal}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs active:scale-95 transition-all whitespace-nowrap min-h-[42px] cursor-pointer"
            type="button"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>+ Input Tamu Cepat</span>
          </button>

          {onOpenEventSettings && (
            <button
              onClick={onOpenEventSettings}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-white/80 hover:bg-white text-purple-950 border border-purple-200/80 rounded-xl text-xs font-bold shadow-2xs transition-all whitespace-nowrap min-h-[42px] cursor-pointer"
              title="Atur Nama Pengantin, Tanggal, dan Lokasi Acara"
              type="button"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-700 shrink-0" />
              <span className="hidden xs:inline">Atur Acara</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/80 border border-purple-200/80 hover:bg-white rounded-xl text-[#1e1b4b] text-xs font-semibold shadow-2xs transition-all whitespace-nowrap min-h-[42px] cursor-pointer"
              title="Unduh Berita Acara Rekapitulasi Format Cetak"
              type="button"
            >
              <FileText className="w-4 h-4 text-red-600 shrink-0" />
              <span>PDF</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-white/80 border border-purple-200/80 hover:bg-white rounded-xl text-[#1e1b4b] text-xs font-semibold shadow-2xs transition-all whitespace-nowrap min-h-[42px] cursor-pointer"
              title="Unduh File CSV / Excel Data Tamu Lengkap"
              type="button"
            >
              <Table2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Excel</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

