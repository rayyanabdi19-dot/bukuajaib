import React from 'react';
import { WeddingEventInfo } from '../types';
import { 
  CalendarCheck, 
  MapPin, 
  UserPlus, 
  FileText, 
  Table2, 
  Sliders, 
  Laptop
} from 'lucide-react';

interface SubHeaderProps {
  eventInfo: WeddingEventInfo;
  onOpenReceptionModal: () => void;
  onExportPdf: () => void;
  onExportExcel: () => void;
  onOpenEventSettings?: () => void;
  syncStatus?: 'connected' | 'syncing' | 'offline';
  connectedDevicesCount?: number;
  firebaseConnected?: boolean;
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
}) => {
  return (
    <section className="bg-[#f3f4f3] border-b border-[#d5c3b8]/60 py-3.5 px-4 md:px-6">
      <div className="max-w-[78rem] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[#6f4627] text-xs font-bold uppercase tracking-wider">
            <CalendarCheck className="w-4 h-4 text-[#735c00] shrink-0" />
            <span>Resepsi Pernikahan Resmi</span>
          </div>

          <h1 className="font-serif-luxury text-lg sm:text-xl md:text-2xl text-[#1a1c1c] font-bold mt-0.5 break-words">
            {eventInfo.fullTitle}
          </h1>

          <div className="text-xs sm:text-sm text-[#51443c] flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
            <span className="font-medium">{eventInfo.dateStr}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#8b5e3c] shrink-0" />
              <span>{eventInfo.location}</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-emerald-300">
              <Laptop className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Multi-Perangkat: Sinkron Otomatis ({connectedDevicesCount} Device)</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-amber-200">
              <span className={`w-2 h-2 rounded-full ${firebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`}></span>
              <span>Firestore Cloud: Aktif</span>
            </span>
          </div>
        </div>

        {/* Action Button Group */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          {onOpenEventSettings && (
            <button
              onClick={onOpenEventSettings}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-[#ede5df] text-[#6f4627] border border-[#d5c3b8] rounded-xl text-xs font-bold shadow-2xs transition-all"
              title="Atur Nama Pengantin, Tanggal, dan Lokasi Acara"
              type="button"
            >
              <Sliders className="w-3.5 h-3.5 text-[#8c7355] shrink-0" />
              <span>Atur Acara</span>
            </button>
          )}

          <button
            onClick={onOpenReceptionModal}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#8b5e3c] hover:bg-[#6f4627] text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs active:scale-95 transition-all whitespace-nowrap"
            type="button"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>+ Input Tamu Cepat</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onExportPdf}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#d5c3b8] hover:bg-[#eeeeed] rounded-xl text-[#1a1c1c] text-xs font-semibold shadow-2xs transition-all whitespace-nowrap"
              title="Unduh Berita Acara Rekapitulasi Format Cetak"
              type="button"
            >
              <FileText className="w-4 h-4 text-red-600 shrink-0" />
              <span>Export PDF</span>
            </button>

            <button
              onClick={onExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-[#d5c3b8] hover:bg-[#eeeeed] rounded-xl text-[#1a1c1c] text-xs font-semibold shadow-2xs transition-all whitespace-nowrap"
              title="Unduh File CSV / Excel Data Tamu Lengkap"
              type="button"
            >
              <Table2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

