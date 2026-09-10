import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserSession, WeddingEventInfo } from '../types';
import { 
  Heart, 
  QrCode, 
  Bell, 
  UserCheck, 
  LogOut, 
  Layers, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Sliders,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  BookOpen,
  Mail,
  FileSpreadsheet,
  FileText,
  History,
  Clock,
  ExternalLink
} from 'lucide-react';
import { DigitalClockPill } from './DigitalClockPill';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  user: UserSession;
  eventInfo: WeddingEventInfo;
  activeNav: string;
  setActiveNav: (nav: string) => void;
  onOpenReceptionModal: () => void;
  onOpenQrModal: () => void;
  onSwitchToPortal: () => void;
  onResetData: () => void;
  onOpenEventSettings?: () => void;
  onOpenClockCalendar?: () => void;
  onLogout?: () => void;
  firebaseConnected?: boolean;
  firebaseUserEmail?: string | null;
  onGoogleSignIn?: () => void;
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
  { id: 'analisis', label: 'Analisis & Grafik', icon: BarChart3, badge: 'Live Chart' },
  { id: 'buku-tamu', label: 'Buku Tamu Resepsi', icon: BookOpen },
  { id: 'amplop', label: 'Kasir Amplop & Sumbangan', icon: Mail },
  { id: 'rekap', label: 'Rekapitulasi Kehadiran', icon: FileSpreadsheet },
  { id: 'laporan', label: 'Laporan Acara & Cetak', icon: FileText },
  { id: 'log-aktivitas', label: 'Log Aktivitas Petugas', icon: History },
];

export const Header: React.FC<HeaderProps> = ({
  user,
  eventInfo,
  activeNav,
  setActiveNav,
  onOpenReceptionModal,
  onOpenQrModal,
  onSwitchToPortal,
  onResetData,
  onOpenEventSettings,
  onOpenClockCalendar,
  onLogout,
  firebaseConnected,
  firebaseUserEmail,
  onGoogleSignIn,
}) => {
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSideMenuOpen(false);
        setProfileDropdown(false);
        setNotificationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background scrolling when side menu is open on mobile
  useEffect(() => {
    if (sideMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sideMenuOpen]);

  const currentNavItem = NAV_ITEMS.find((item) => item.id === activeNav) || NAV_ITEMS[0];

  const handleNavSelect = (navId: string) => {
    setActiveNav(navId);
    // Buka tutup otomatis: segera tutup side menu setelah item dipilih
    setSideMenuOpen(false);
  };

  return (
    <>
      <header className="bg-white border-b border-[#d5c3b8] shadow-2xs sticky top-0 z-40">
        <div className="flex justify-between items-center w-full px-3 sm:px-4 md:px-6 max-w-[78rem] mx-auto h-16 gap-2 sm:gap-4">
          {/* Left: Hamburger Button & Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink">
            {/* Hamburger Button to Toggle Side Menu */}
            <button
              onClick={() => setSideMenuOpen((prev) => !prev)}
              className="px-2.5 sm:px-3 py-1.5 -ml-1 text-[#51443c] hover:text-[#6f4627] hover:bg-[#faf6f2] rounded-xl transition-all border border-[#d5c3b8]/80 flex items-center gap-2 shrink-0 active:scale-95 shadow-2xs group cursor-pointer"
              aria-label={sideMenuOpen ? 'Tutup Menu Navigasi' : 'Buka Menu Navigasi'}
              title="Buka Menu Navigasi (Side Menu)"
              type="button"
              id="hamburger-menu-btn"
            >
              {sideMenuOpen ? (
                <X className="w-5 h-5 text-[#6f4627]" />
              ) : (
                <Menu className="w-5 h-5 text-[#6f4627] group-hover:scale-110 transition-transform" />
              )}
              <span className="text-xs font-bold text-[#6f4627]">
                Menu
              </span>
            </button>

            {/* Wedding Brand Title */}
            <div className="w-8 h-8 rounded-lg bg-[#8b5e3c]/10 flex items-center justify-center text-[#6f4627] shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-[#6f4627]" />
            </div>
            
            <div className="min-w-0 flex flex-col justify-center">
              <button 
                onClick={() => handleNavSelect('dashboard')}
                className="font-serif-luxury text-sm sm:text-base md:text-lg lg:text-xl text-[#6f4627] tracking-tight font-bold hover:opacity-85 transition-opacity truncate max-w-[130px] xs:max-w-[180px] sm:max-w-[220px] md:max-w-[280px] text-left leading-tight cursor-pointer"
                title={eventInfo.coupleTitle || 'Buku Ajaib Wedding'}
              >
                {eventInfo.coupleTitle || 'Buku Ajaib Wedding'}
              </button>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span className="hidden sm:inline">Live Event Aktif</span>
                  <span className="sm:hidden">Live</span>
                </span>
                <span className="hidden md:inline text-[10px] text-[#8c7355]">• Navigasi Side Menu</span>
              </div>
            </div>

            {/* Current Active Page Pill Button (Click to toggle side menu) */}
            <button
              onClick={() => setSideMenuOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#faf6f2] hover:bg-[#ede5df] border border-[#d5c3b8]/70 text-xs font-semibold text-[#6f4627] transition-all shadow-2xs group shrink-0 cursor-pointer"
              title="Klik untuk membuka menu navigasi di Side Menu"
              type="button"
            >
              <currentNavItem.icon className="w-3.5 h-3.5 text-[#8b5e3c] group-hover:scale-110 transition-transform" />
              <span className="font-bold">{currentNavItem.label}</span>
              <ChevronDown className="w-3 h-3 text-[#8c7355] group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>

          {/* Right: Action Controls & Live Clock Widget */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Live Digital Clock & Calendar Widget (Only in Header) */}
            {onOpenClockCalendar && (
              <DigitalClockPill onOpenModal={onOpenClockCalendar} />
            )}

            {/* In-App PWA Install Button */}
            <PWAInstallButton variant="header" />

            {/* Barcode/QR Scanner Trigger */}
            <button
              onClick={onOpenQrModal}
              className="p-1.5 sm:p-2 text-[#51443c] hover:bg-[#faf6f2] hover:text-[#6f4627] rounded-xl transition-all border border-[#d5c3b8]/70 shrink-0"
              title="Buka Scanner Barcode / QR Undangan"
              type="button"
            >
              <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-[#6f4627]" />
            </button>

            {/* Notifications button */}
            <div className="relative shrink-0">
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className="p-1.5 sm:p-2 text-[#51443c] hover:bg-[#faf6f2] hover:text-[#6f4627] rounded-xl transition-all relative border border-[#d5c3b8]/70"
                title="Notifikasi Real-time"
                type="button"
              >
                <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full ring-2 ring-white"></span>
              </button>

              {notificationOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#d5c3b8] p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-[#eeeeed]">
                    <span className="text-xs font-bold text-[#1a1c1c]">Notifikasi Real-time</span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      Sinkron Aktif
                    </span>
                  </div>
                  <div className="py-2 space-y-2 text-xs">
                    <div className="p-2 bg-[#f3f4f3] rounded-lg">
                      <p className="font-semibold text-[#1a1c1c]">Meja 1 & 2 Terhubung</p>
                      <p className="text-[#51443c] text-[11px]">Seluruh perubahan kehadiran tamu tersinkron otomatis (0.2s).</p>
                    </div>
                    <div className="p-2 bg-amber-50 rounded-lg">
                      <p className="font-semibold text-amber-900">18 Amplop Belum Dihitung</p>
                      <p className="text-amber-800 text-[11px]">Siap diverifikasi bersama keluarga saat sesi privat.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mode Penerima Tamu Switcher */}
            <button
              onClick={onOpenReceptionModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#8b5e3c] text-white hover:bg-[#6f4627] rounded-xl text-xs font-bold shadow-2xs transition-all shrink-0 active:scale-95 whitespace-nowrap"
              type="button"
            >
              <UserCheck className="w-4 h-4 text-[#ffe3d1] shrink-0" />
              <span className="hidden md:inline">Mode </span>
              <span>Penerima Tamu</span>
            </button>

            {/* Profile & Settings Dropdown */}
            <div className="relative shrink-0">
              <button
                onClick={() => setProfileDropdown(!profileDropdown)}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 hover:bg-[#faf6f2] rounded-xl transition-all border border-[#d5c3b8]/70"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#ffe088] border border-[#735c00] flex items-center justify-center text-[#241a00] font-bold text-xs shrink-0">
                  {user.role === 'admin' ? 'AB' : 'PT'}
                </div>
                <span className="text-xs font-semibold text-[#1a1c1c] hidden lg:inline whitespace-nowrap">
                  {user.role === 'admin' ? 'Admin' : 'Petugas'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#51443c] hidden sm:block shrink-0" />
              </button>

              {profileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-[#d5c3b8] p-2 z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-[#eeeeed]">
                    <p className="text-xs font-bold text-[#1a1c1c]">{user.name}</p>
                    <p className="text-[11px] text-[#51443c]">{user.email}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <span className="inline-block text-[10px] bg-[#ffdcc5] text-[#301400] font-semibold px-2 py-0.5 rounded-full">
                        {user.role === 'admin' ? 'Akses Admin Penuh' : 'Petugas Meja Tamu'}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-900 border border-amber-200 font-semibold px-2 py-0.5 rounded-full">
                        <span className={`w-1.5 h-1.5 rounded-full ${firebaseConnected ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        Firebase Cloud
                      </span>
                    </div>
                  </div>

                  <div className="py-1 text-xs">
                    {!firebaseUserEmail && onGoogleSignIn && (
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          onGoogleSignIn();
                        }}
                        className="w-full text-left px-3 py-2 bg-amber-50/70 hover:bg-amber-100 text-[#6f4627] rounded-lg flex items-center gap-2 font-bold mb-1 border border-amber-200"
                      >
                        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                        </svg>
                        <span>Masuk Google Cloud</span>
                      </button>
                    )}

                    {onOpenEventSettings && (
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          onOpenEventSettings();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#faf6f2] text-[#6f4627] rounded-lg flex items-center gap-2 font-medium"
                      >
                        <Sliders className="w-4 h-4 text-[#8c7355]" />
                        <span>Atur Acara & Nama Pengantin</span>
                      </button>
                    )}

                    {onOpenClockCalendar && (
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          onOpenClockCalendar();
                        }}
                        className="w-full text-left px-3 py-2 hover:bg-[#faf6f2] text-[#6f4627] rounded-lg flex items-center gap-2 font-medium"
                      >
                        <Sparkles className="w-4 h-4 text-[#8b5e3c]" />
                        <span>Jam Layar Meja & Kalender</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onSwitchToPortal();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#f3f4f3] rounded-lg text-[#1a1c1c] flex items-center gap-2 font-medium"
                    >
                      <Layers className="w-4 h-4 text-[#6f4627]" />
                      <span>Portal Buku Ajaib & Bantuan</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        onOpenReceptionModal();
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#f3f4f3] rounded-lg text-[#1a1c1c] flex items-center gap-2 font-medium"
                    >
                      <UserCheck className="w-4 h-4 text-[#735c00]" />
                      <span>Buka Mode Penerima Tamu</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm('Kembalikan seluruh data tamu dan amplop ke sampel awal simulasi resepsi?')) {
                          onResetData();
                          setProfileDropdown(false);
                        }
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-amber-50 text-amber-900 rounded-lg flex items-center gap-2 font-medium"
                    >
                      <RotateCcw className="w-4 h-4 text-amber-700" />
                      <span>Reset Data ke Contoh Resepsi</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-[#eeeeed]">
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        if (onLogout) {
                          onLogout();
                        } else {
                          onSwitchToPortal();
                        }
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Keluar / Ganti Akun Meja</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Side Menu Drawer & Backdrop (Buka Tutup Otomatis with Framer Motion) */}
      <AnimatePresence>
        {sideMenuOpen && (
          <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label="Menu Navigasi">
            {/* Backdrop (Klik backdrop otomatis menutup side menu) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
              onClick={() => setSideMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 34 }}
              className="relative w-72 sm:w-80 max-w-[85vw] h-full bg-white shadow-2xl flex flex-col border-r border-[#d5c3b8] z-10"
            >
              {/* Drawer Header */}
            <div className="p-4 border-b border-[#eeeeed] flex items-center justify-between bg-[#faf6f2]">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#8b5e3c]/15 flex items-center justify-center text-[#6f4627] shrink-0">
                  <Heart className="w-5 h-5 fill-[#6f4627]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif-luxury font-bold text-sm sm:text-base text-[#6f4627] leading-tight truncate">
                    {eventInfo.coupleTitle || 'Buku Ajaib Wedding'}
                  </h2>
                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-emerald-700 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Side Menu Navigasi</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSideMenuOpen(false)}
                className="p-1.5 text-[#51443c] hover:text-[#1a1c1c] hover:bg-[#ede5df] rounded-xl transition-colors shrink-0 cursor-pointer"
                aria-label="Tutup Menu"
                title="Tutup Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Menu Links (Klik item langsung pindah halaman dan otomatis menutup menu) */}
            <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
              <div className="px-3 py-1.5 text-[11px] font-bold text-[#8c7355] uppercase tracking-wider flex items-center justify-between">
                <span>Menu Navigasi</span>
                <span className="text-[10px] text-[#6f4627] font-semibold bg-[#8b5e3c]/10 px-2 py-0.5 rounded-full">
                  {NAV_ITEMS.length} Halaman
                </span>
              </div>

              <div className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = activeNav === item.id;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all text-left group cursor-pointer ${
                        isActive
                          ? 'bg-[#6f4627] text-white shadow-xs font-bold'
                          : 'text-[#51443c] hover:bg-[#faf6f2] hover:text-[#1a1c1c]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconComponent className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                          isActive ? 'text-white' : 'text-[#8b5e3c]'
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {item.badge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-amber-100 text-amber-900 border border-amber-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                          isActive ? 'text-white translate-x-0.5' : 'text-[#8c7355]/60 group-hover:translate-x-0.5'
                        }`} />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Action Shortcuts inside Side Menu */}
              <div className="pt-3 border-t border-[#eeeeed] mt-2 space-y-1.5">
                <div className="px-3 py-1 text-[11px] font-bold text-[#8c7355] uppercase tracking-wider">
                  Aksi Cepat Meja Resepsi
                </div>

                <div className="px-1 py-1">
                  <PWAInstallButton variant="drawer" />
                </div>

                <button
                  onClick={() => {
                    setSideMenuOpen(false);
                    onOpenReceptionModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-[#1a1c1c] hover:bg-[#faf6f2] rounded-xl transition-colors text-left"
                >
                  <UserCheck className="w-4 h-4 text-[#8b5e3c] shrink-0" />
                  <span>Mode Penerima Tamu Layar Meja</span>
                </button>

                <button
                  onClick={() => {
                    setSideMenuOpen(false);
                    onOpenQrModal();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-[#1a1c1c] hover:bg-[#faf6f2] rounded-xl transition-colors text-left"
                >
                  <QrCode className="w-4 h-4 text-[#8b5e3c] shrink-0" />
                  <span>Scan Barcode / QR Undangan</span>
                </button>

                {onOpenClockCalendar && (
                  <button
                    onClick={() => {
                      setSideMenuOpen(false);
                      onOpenClockCalendar();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-[#1a1c1c] hover:bg-[#faf6f2] rounded-xl transition-colors text-left"
                  >
                    <Clock className="w-4 h-4 text-[#8b5e3c] shrink-0" />
                    <span>Jam Layar Meja & Kalender</span>
                  </button>
                )}

                {onOpenEventSettings && (
                  <button
                    onClick={() => {
                      setSideMenuOpen(false);
                      onOpenEventSettings();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-[#1a1c1c] hover:bg-[#faf6f2] rounded-xl transition-colors text-left"
                  >
                    <Sliders className="w-4 h-4 text-[#8b5e3c] shrink-0" />
                    <span>Pengaturan Nama Pengantin & Acara</span>
                  </button>
                )}
              </div>
            </nav>

            {/* Drawer Footer with Officer Info & Logout */}
            <div className="p-3.5 border-t border-[#eeeeed] bg-[#faf6f2] flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#ffe088] border border-[#735c00] flex items-center justify-center text-[#241a00] font-bold text-xs shrink-0">
                  {user.role === 'admin' ? 'AB' : 'PT'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#1a1c1c] truncate">{user.name}</p>
                  <p className="text-[10px] text-[#51443c]">
                    {user.role === 'admin' ? 'Admin Master' : 'Petugas Meja'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setSideMenuOpen(false);
                  if (onLogout) onLogout(); else onSwitchToPortal();
                }}
                className="p-2 text-[#51443c] hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                title="Keluar / Ganti Akun"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  </>
  );
};
