import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  UserPlus, 
  Mail, 
  FileSpreadsheet,
  Sliders,
  Sparkles
} from 'lucide-react';

interface BottomNavBarProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenReceptionModal: () => void;
  guestCount: number;
  envelopeCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeNav,
  setActiveNav,
  onOpenReceptionModal,
  guestCount,
  envelopeCount,
}) => {
  return (
    <nav 
      aria-label="Navigasi Bawah Seluler"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-purple-100 shadow-[0_-4px_20px_rgba(30,27,75,0.06)] px-2 pt-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto relative">
        {/* 1. Dashboard */}
        <button
          onClick={() => setActiveNav('dashboard')}
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'dashboard'
              ? 'text-orange-600 font-bold scale-105'
              : 'text-gray-600 hover:text-purple-900 font-medium'
          }`}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${activeNav === 'dashboard' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {activeNav === 'dashboard' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Dashboard</span>
        </button>

        {/* 2. Buku Tamu */}
        <button
          onClick={() => setActiveNav('buku-tamu')}
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeNav === 'buku-tamu'
              ? 'text-purple-700 font-bold scale-105'
              : 'text-gray-600 hover:text-purple-900 font-medium'
          }`}
        >
          <div className="relative">
            <BookOpen className={`w-5 h-5 ${activeNav === 'buku-tamu' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {guestCount > 0 && (
              <span className="absolute -top-1.5 -right-2.5 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                {guestCount > 99 ? '99+' : guestCount}
              </span>
            )}
            {activeNav === 'buku-tamu' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Buku Tamu</span>
        </button>

        {/* 3. Center Elevated Quick Input Button (+ Tamu Cepat) */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            onClick={onOpenReceptionModal}
            type="button"
            className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-orange-500 via-orange-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-all border-2 border-white cursor-pointer group"
            title="Tambah Tamu Baru Cepat"
            aria-label="Input Tamu Cepat"
          >
            <UserPlus className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-[9.5px] font-bold text-orange-700 mt-0.5 tracking-tight">
            + Tamu
          </span>
        </div>

        {/* 4. Kasir Amplop */}
        <button
          onClick={() => setActiveNav('amplop')}
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative ${
            activeNav === 'amplop'
              ? 'text-orange-600 font-bold scale-105'
              : 'text-gray-600 hover:text-purple-900 font-medium'
          }`}
        >
          <div className="relative">
            <Mail className={`w-5 h-5 ${activeNav === 'amplop' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {envelopeCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full min-w-[16px] text-center shadow-xs">
                {envelopeCount > 99 ? '99+' : envelopeCount}
              </span>
            )}
            {activeNav === 'amplop' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Kasir Amplop</span>
        </button>

        {/* 5. Rekapitulasi */}
        <button
          onClick={() => setActiveNav('rekap')}
          type="button"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
            activeNav === 'rekap'
              ? 'text-purple-700 font-bold scale-105'
              : 'text-gray-600 hover:text-purple-900 font-medium'
          }`}
        >
          <div className="relative">
            <FileSpreadsheet className={`w-5 h-5 ${activeNav === 'rekap' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
            {activeNav === 'rekap' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-600" />
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Rekapitulasi</span>
        </button>
      </div>
    </nav>
  );
};
