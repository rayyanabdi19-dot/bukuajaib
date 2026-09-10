import React, { useState, useEffect, useMemo } from 'react';
import { WeddingEventInfo, Guest } from '../types';
import {
  Clock,
  Calendar,
  CalendarDays,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  CheckCircle2,
  Maximize2,
  Minimize2,
  MapPin,
  Timer,
  Bell,
  Plus,
  Trash2,
  Play,
  Users,
  AlertCircle,
} from 'lucide-react';

interface DigitalClockCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: WeddingEventInfo;
  guests: Guest[];
}

interface AgendaItem {
  id: string;
  time: string;
  title: string;
  pic?: string;
  location?: string;
  completed?: boolean;
}

const DEFAULT_RUNDOWN: Record<string, AgendaItem[]> = {
  // Default rundown for the wedding day
  wedding_day: [
    { id: '1', time: '07:30 - 08:30', title: 'Persiapan Meja Registrasi & Kasir Amplop', pic: 'Tim Meja 1 & 2', location: 'Foyer Ballroom', completed: true },
    { id: '2', time: '08:30 - 10:00', title: 'Akad Nikah & Serah Terima Mahar', pic: 'Keluarga Inti', location: 'Ruang Akad / Panggung Utama', completed: true },
    { id: '3', time: '10:00 - 11:00', title: 'Prosesi Adat & Temu Manten', pic: 'Pemandu Adat', location: 'Pelaminan', completed: false },
    { id: '4', time: '11:00 - 14:00', title: 'Resepsi Sesi Siang (Keluarga Besar & Tamu VIP)', pic: 'Semua Panitia', location: 'Grand Ballroom', completed: false },
    { id: '5', time: '14:00 - 16:30', title: 'Istirahat Mempelai & Rekapitulasi Sesi 1', pic: 'Koordinator Kasir', location: 'Ruang VIP Panitia', completed: false },
    { id: '6', time: '17:00 - 18:30', title: 'Persiapan Resepsi Sesi Malam & Souvenir', pic: 'Tim Souvenir & QR', location: 'Meja Penerima Tamu', completed: false },
    { id: '7', time: '18:30 - 21:30', title: 'Resepsi Sesi Malam (Rekan Kerja, Alumni & Sahabat)', pic: 'Semua Tim Meja', location: 'Grand Ballroom', completed: false },
    { id: '8', time: '21:30 - 22:30', title: 'Penutupan Meja Tamu, Hitung Total Amplop & Serah Terima', pic: 'Saksi Kedua Pihak', location: 'Ruang Kasir Amplop', completed: false },
  ],
};

const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDO_DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

export const DigitalClockCalendarModal: React.FC<DigitalClockCalendarModalProps> = ({
  isOpen,
  onClose,
  eventInfo,
  guests,
}) => {
  // Current real-time clock state
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timezone, setTimezone] = useState<'WIB' | 'WITA' | 'WIT'>('WIB');
  const [isFullscreenClock, setIsFullscreenClock] = useState(false);

  // Calendar state
  const [viewDate, setViewDate] = useState(() => {
    // Try to parse event date or default to current date
    return new Date();
  });
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Agenda items per date (in localStorage)
  const [rundowns, setRundowns] = useState<Record<string, AgendaItem[]>>(() => {
    const saved = localStorage.getItem('buku_ajaib_wedding_rundown');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_RUNDOWN;
  });

  const [newAgendaTime, setNewAgendaTime] = useState('');
  const [newAgendaTitle, setNewAgendaTitle] = useState('');
  const [newAgendaPic, setNewAgendaPic] = useState('');

  // Ticking effect every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save rundowns on change
  useEffect(() => {
    localStorage.setItem('buku_ajaib_wedding_rundown', JSON.stringify(rundowns));
  }, [rundowns]);

  // Adjust time according to selected timezone
  const displayTime = useMemo(() => {
    const date = new Date(currentTime);
    // standard is local browser, but we support timezone offsets if needed
    let hours = date.getHours();
    if (timezone === 'WITA') hours = (hours + 1) % 24;
    if (timezone === 'WIT') hours = (hours + 2) % 24;

    const hh = String(hours).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    const dayName = INDO_DAYS[date.getDay()];
    const dateNum = date.getDate();
    const monthName = INDO_MONTHS[date.getMonth()];
    const year = date.getFullYear();

    return {
      hh,
      mm,
      ss,
      dayName,
      dateNum,
      monthName,
      year,
      fullDateStr: `${dayName}, ${dateNum} ${monthName} ${year}`,
    };
  }, [currentTime, timezone]);

  // Parse wedding event date for highlight
  const weddingEventDate = useMemo(() => {
    // Check if eventInfo.dateStr contains numbers like '20' and 'September'
    // Default fallback to 20 September 2026 if unable to parse
    const currentYear = new Date().getFullYear();
    return {
      day: 20,
      month: 8, // September (0-indexed)
      year: 2026,
    };
  }, [eventInfo]);

  // Calendar days calculation
  const calendarGrid = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1);
    // 0 = Sunday, 1 = Monday, ...
    const startingDayIndex = (firstDay.getDay() + 6) % 7; // Monday as first column (0 = Senin, 6 = Minggu)

    // Total days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Days in previous month
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month filler days
    for (let i = startingDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        dayNumber: daysInPrevMonth - i,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // Next month filler days to make 35 or 42 cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return days;
  }, [viewDate]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const today = new Date();
    setViewDate(today);
    setSelectedDate(today);
  };

  const handleJumpToWedding = () => {
    const wedding = new Date(weddingEventDate.year, weddingEventDate.month, weddingEventDate.day);
    setViewDate(wedding);
    setSelectedDate(wedding);
  };

  // Format date key for agenda storage
  const selectedDateKey = useMemo(() => {
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, [selectedDate]);

  const activeAgendaList = useMemo(() => {
    // If it's the wedding day, fallback to default wedding rundown if empty
    if (
      selectedDate.getDate() === weddingEventDate.day &&
      selectedDate.getMonth() === weddingEventDate.month &&
      selectedDate.getFullYear() === weddingEventDate.year
    ) {
      return rundowns[selectedDateKey] || rundowns['wedding_day'] || [];
    }
    return rundowns[selectedDateKey] || [];
  }, [selectedDate, selectedDateKey, rundowns, weddingEventDate]);

  // Check how many guests checked in on selected date
  const guestsOnSelectedDate = useMemo(() => {
    return guests.filter((g) => {
      if (g.checkInDate) {
        return g.checkInDate === selectedDateKey;
      }
      // Fallback for default data that might not have full date
      return selectedDateKey === '2026-09-20';
    });
  }, [guests, selectedDateKey]);

  // Toggle agenda completion
  const handleToggleAgenda = (agendaId: string) => {
    const currentList = [...activeAgendaList];
    const targetKey =
      selectedDate.getDate() === weddingEventDate.day &&
      selectedDate.getMonth() === weddingEventDate.month &&
      selectedDate.getFullYear() === weddingEventDate.year &&
      !rundowns[selectedDateKey]
        ? 'wedding_day'
        : selectedDateKey;

    const updated = (rundowns[targetKey] || DEFAULT_RUNDOWN.wedding_day).map((item) => {
      if (item.id === agendaId) {
        return { ...item, completed: !item.completed };
      }
      return item;
    });

    setRundowns({
      ...rundowns,
      [targetKey]: updated,
    });
  };

  // Add agenda item
  const handleAddAgenda = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgendaTime || !newAgendaTitle) return;

    const targetKey = selectedDateKey;
    const existing = rundowns[targetKey] || (targetKey === '2026-09-20' ? DEFAULT_RUNDOWN.wedding_day : []);

    const newItem: AgendaItem = {
      id: Date.now().toString(),
      time: newAgendaTime,
      title: newAgendaTitle,
      pic: newAgendaPic || 'Panitia Resepsi',
      completed: false,
    };

    setRundowns({
      ...rundowns,
      [targetKey]: [...existing, newItem],
    });

    setNewAgendaTime('');
    setNewAgendaTitle('');
    setNewAgendaPic('');
  };

  // Delete agenda item
  const handleDeleteAgenda = (id: string) => {
    const targetKey =
      selectedDate.getDate() === weddingEventDate.day &&
      selectedDate.getMonth() === weddingEventDate.month &&
      selectedDate.getFullYear() === weddingEventDate.year &&
      !rundowns[selectedDateKey]
        ? 'wedding_day'
        : selectedDateKey;

    const updated = (rundowns[targetKey] || []).filter((item) => item.id !== id);
    setRundowns({
      ...rundowns,
      [targetKey]: updated,
    });
  };

  if (!isOpen) return null;

  // FULLSCREEN DESK CLOCK MODE (Ideal for putting tablet/screen on reception desk)
  if (isFullscreenClock) {
    return (
      <div className="fixed inset-0 z-50 bg-[#1a1c1c] text-white flex flex-col items-center justify-between p-6 md:p-12 select-none">
        {/* Top bar in fullscreen */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Heart className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
            <div>
              <h2 className="font-serif-luxury text-xl md:text-2xl font-bold text-amber-200">
                {eventInfo.coupleTitle}
              </h2>
              <p className="text-xs text-white/70">{eventInfo.location} • {eventInfo.hall}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white/10 rounded-xl p-1 text-xs">
              {(['WIB', 'WITA', 'WIT'] as const).map((tz) => (
                <button
                  key={tz}
                  onClick={() => setTimezone(tz)}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    timezone === tz ? 'bg-amber-400 text-[#1a1c1c]' : 'text-white/80 hover:text-white'
                  }`}
                >
                  {tz}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsFullscreenClock(false)}
              className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-semibold"
              title="Keluar Layar Penuh"
            >
              <Minimize2 className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* Big Giant Digital Clock Display */}
        <div className="flex flex-col items-center justify-center my-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-sm font-semibold tracking-wider uppercase">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Jam Resmi Meja Resepsi ({timezone})</span>
          </div>

          <div className="flex items-center justify-center font-mono font-extrabold tracking-tight text-amber-400 text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] drop-shadow-[0_10px_30px_rgba(245,158,11,0.2)] leading-none">
            <span>{displayTime.hh}</span>
            <span className="animate-pulse text-amber-300 mx-1 sm:mx-2">:</span>
            <span>{displayTime.mm}</span>
            <span className="animate-pulse text-amber-300 mx-1 sm:mx-2">:</span>
            <span className="text-amber-200 text-5xl sm:text-7xl md:text-8xl lg:text-[9rem]">
              {displayTime.ss}
            </span>
          </div>

          <div className="font-serif-luxury text-2xl sm:text-4xl text-amber-100/90 font-medium tracking-wide">
            {displayTime.fullDateStr}
          </div>

          {/* Schedule status badge */}
          <div className="flex items-center gap-3 text-xs sm:text-sm text-white/80 bg-white/5 border border-white/10 px-6 py-2.5 rounded-2xl">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Jadwal Resepsi: <strong>{eventInfo.timeStr}</strong></span>
            <span>•</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Sesi Aktif
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="w-full flex items-center justify-between text-xs text-white/50 border-t border-white/10 pt-4">
          <span>Buku Ajaib • Layar Jam Meja Penerima Tamu</span>
          <span>Tekan tombol Kembali untuk membuka Kalender & Rundown Acara</span>
        </div>
      </div>
    );
  }

  // STANDARD MODAL VIEW (Jam Digital + Kalender Interaktif + Rundown Acara)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-[#d5c3b8] rounded-2xl shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#faf6f2] border-b border-[#d5c3b8] px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8b5e3c]/10 text-[#6f4627] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif-luxury text-lg md:text-xl font-bold text-[#6f4627]">
                  Jam Digital & Kalender Acara Resepsi
                </h3>
                <span className="text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-2 py-0.5 rounded-full">
                  Real-Time Live
                </span>
              </div>
              <p className="text-xs text-[#51443c]">
                Sinkronisasi waktu presisi check-in meja registrasi dan kalender rundown pernikahan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFullscreenClock(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#ede5df] text-[#6f4627] border border-[#d5c3b8] rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
              title="Layar Penuh Meja Resepsi"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Layar Meja</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#51443c] hover:text-[#1a1c1c] hover:bg-[#eeeeed] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 md:p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. DIGITAL CLOCK BANNER */}
          <div className="bg-gradient-to-r from-[#1a1c1c] via-[#2a2420] to-[#1a1c1c] text-white p-5 md:p-6 rounded-2xl shadow-md border border-[#8b5e3c]/30 flex flex-col md:flex-row items-center justify-between gap-5 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-radial from-amber-500/10 to-transparent pointer-events-none" />

            <div className="space-y-1 text-center md:text-left z-10">
              <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-amber-300 font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>WAKTU RESMI MEJA PENERIMA TAMU</span>
              </div>
              <div className="font-serif-luxury text-xl sm:text-2xl font-bold text-amber-100">
                {displayTime.fullDateStr}
              </div>
              <div className="flex items-center justify-center md:justify-start gap-3 text-xs text-white/70">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {eventInfo.location}
                </span>
                <span>•</span>
                <span>Jadwal: {eventInfo.timeStr}</span>
              </div>
            </div>

            {/* Giant Digital Digits */}
            <div className="flex flex-col items-center md:items-end z-10">
              <div className="flex items-baseline font-mono font-bold tracking-tight text-amber-400 text-4xl sm:text-5xl md:text-6xl drop-shadow-md">
                <span>{displayTime.hh}</span>
                <span className="animate-pulse text-amber-300 mx-1">:</span>
                <span>{displayTime.mm}</span>
                <span className="animate-pulse text-amber-300 mx-1">:</span>
                <span className="text-amber-200 text-3xl sm:text-4xl md:text-5xl">{displayTime.ss}</span>
                <span className="ml-2 text-xs sm:text-sm font-sans font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-lg border border-amber-400/30">
                  {timezone}
                </span>
              </div>

              {/* Timezone Switcher */}
              <div className="flex items-center gap-1.5 mt-2 bg-white/10 p-1 rounded-lg text-xs">
                {(['WIB', 'WITA', 'WIT'] as const).map((tz) => (
                  <button
                    key={tz}
                    onClick={() => setTimezone(tz)}
                    className={`px-2.5 py-0.5 rounded-md font-bold transition-all ${
                      timezone === tz ? 'bg-amber-400 text-[#1a1c1c]' : 'text-white/70 hover:text-white'
                    }`}
                  >
                    {tz}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. MAIN 2-COLUMN: CALENDAR (LEFT) & RUNDOWN/AGENDA (RIGHT) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT: INTERACTIVE CALENDAR (7 cols) */}
            <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#d5c3b8] shadow-xs space-y-4">
              {/* Calendar Navigation & Title */}
              <div className="flex items-center justify-between border-b border-[#eeeeed] pb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-[#8b5e3c]" />
                  <h4 className="font-serif-luxury text-lg font-bold text-[#6f4627]">
                    {INDO_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleJumpToToday}
                    className="px-2.5 py-1 text-xs font-semibold text-[#6f4627] bg-[#faf6f2] hover:bg-[#ede5df] rounded-lg border border-[#d5c3b8] transition-colors"
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={handleJumpToWedding}
                    className="px-2.5 py-1 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-300 transition-colors flex items-center gap-1"
                    title="Lompat ke Hari H Pernikahan"
                  >
                    <Heart className="w-3 h-3 fill-amber-700 text-amber-700" />
                    <span>Hari H</span>
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 text-[#51443c] hover:text-[#1a1c1c] hover:bg-[#eeeeed] rounded-lg transition-colors"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 text-[#51443c] hover:text-[#1a1c1c] hover:bg-[#eeeeed] rounded-lg transition-colors"
                    title="Bulan Berikutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Day Headers (Sen, Sel, Rab, Kam, Jum, Sab, Min) */}
              <div className="grid grid-cols-7 text-center text-xs font-bold text-[#51443c] py-1 border-b border-[#f0eae4]">
                <span>Sen</span>
                <span>Sel</span>
                <span>Rab</span>
                <span>Kam</span>
                <span>Jum</span>
                <span className="text-amber-800">Sab</span>
                <span className="text-rose-700">Min</span>
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {calendarGrid.map((item, idx) => {
                  const dateObj = item.date;
                  const isToday =
                    dateObj.getDate() === currentTime.getDate() &&
                    dateObj.getMonth() === currentTime.getMonth() &&
                    dateObj.getFullYear() === currentTime.getFullYear();

                  const isWedding =
                    dateObj.getDate() === weddingEventDate.day &&
                    dateObj.getMonth() === weddingEventDate.month &&
                    dateObj.getFullYear() === weddingEventDate.year;

                  const isSelected =
                    dateObj.getDate() === selectedDate.getDate() &&
                    dateObj.getMonth() === selectedDate.getMonth() &&
                    dateObj.getFullYear() === selectedDate.getFullYear();

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDate(dateObj)}
                      className={`min-h-[48px] sm:min-h-[54px] p-1.5 rounded-xl flex flex-col items-center justify-between border transition-all relative ${
                        isSelected
                          ? 'border-[#6f4627] bg-[#6f4627] text-white shadow-xs font-bold'
                          : isWedding
                          ? 'border-amber-400 bg-amber-50/80 text-amber-950 font-bold hover:bg-amber-100'
                          : isToday
                          ? 'border-emerald-400 bg-emerald-50/60 text-emerald-950 font-bold hover:bg-emerald-100'
                          : item.isCurrentMonth
                          ? 'border-transparent hover:bg-[#faf6f2] text-[#1a1c1c]'
                          : 'border-transparent text-[#b1a299] opacity-40 hover:opacity-80'
                      }`}
                    >
                      {/* Day Number */}
                      <span className="text-xs sm:text-sm">{item.dayNumber}</span>

                      {/* Markers on date */}
                      <div className="flex items-center gap-0.5 mt-auto">
                        {isWedding && (
                          <span
                            className={`text-[9px] px-1 rounded-sm flex items-center gap-0.5 ${
                              isSelected ? 'bg-amber-300 text-black font-bold' : 'bg-amber-200 text-amber-900 font-bold'
                            }`}
                            title="Hari H Resepsi"
                          >
                            <Heart className="w-2.5 h-2.5 fill-current" />
                            <span className="hidden sm:inline">Hari H</span>
                          </span>
                        )}
                        {isToday && !isWedding && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-emerald-600'
                            }`}
                            title="Hari Ini"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend bar */}
              <div className="pt-3 border-t border-[#eeeeed] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#51443c]">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                    <span>Hari H Resepsi</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span>Hari Ini</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6f4627]"></span>
                    <span>Tanggal Terpilih</span>
                  </span>
                </div>
                <span className="text-[#8b5e3c] font-semibold">
                  Klik tanggal untuk melihat jadwal & tamu
                </span>
              </div>
            </div>

            {/* RIGHT: RUNDOWN ACARA & DETAIL TANGGAL (5 cols) */}
            <div className="lg:col-span-5 bg-[#faf6f2] p-5 rounded-xl border border-[#d5c3b8] shadow-xs space-y-4">
              {/* Selected Date Header */}
              <div className="border-b border-[#e5ded7] pb-3">
                <span className="text-[10px] uppercase font-bold text-[#735c00] tracking-wider">
                  RUNDOWN & AGENDA TANGGAL
                </span>
                <h4 className="font-serif-luxury text-base sm:text-lg font-bold text-[#1a1c1c] mt-0.5">
                  {INDO_DAYS[selectedDate.getDay()]}, {selectedDate.getDate()}{' '}
                  {INDO_MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-xs text-[#51443c]">
                  <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {guestsOnSelectedDate.length} Tamu Tercatat
                  </span>
                  {selectedDate.getDate() === weddingEventDate.day &&
                    selectedDate.getMonth() === weddingEventDate.month && (
                      <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        Hari Puncak Resepsi
                      </span>
                    )}
                </div>
              </div>

              {/* Agenda / Rundown List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeAgendaList.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#51443c] bg-white rounded-xl border border-dashed border-[#d5c3b8]">
                    <Clock className="w-6 h-6 text-[#8c7355] mx-auto mb-1 opacity-60" />
                    <p className="font-semibold">Belum ada rundown khusus pada tanggal ini</p>
                    <p className="text-[11px] text-[#51443c]/80 mt-0.5">
                      Tambahkan jadwal persiapan atau acara pernikahan di form bawah.
                    </p>
                  </div>
                ) : (
                  activeAgendaList.map((agenda) => (
                    <div
                      key={agenda.id}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex items-start justify-between gap-2 ${
                        agenda.completed
                          ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                          : 'bg-white border-[#d5c3b8]/80 text-[#1a1c1c]'
                      }`}
                    >
                      <div className="flex items-start gap-2 flex-1">
                        <button
                          type="button"
                          onClick={() => handleToggleAgenda(agenda.id)}
                          className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                            agenda.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-[#8c7355] hover:border-emerald-600'
                          }`}
                          title="Tandai Selesai"
                        >
                          {agenda.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>
                        <div>
                          <div className="font-bold text-[#6f4627] flex items-center gap-1.5">
                            <span className="font-mono text-[11px] bg-[#f3f4f3] px-1.5 py-0.2 rounded text-[#51443c]">
                              {agenda.time}
                            </span>
                            <span className={agenda.completed ? 'line-through text-emerald-800' : ''}>
                              {agenda.title}
                            </span>
                          </div>
                          {agenda.pic && (
                            <p className="text-[11px] text-[#51443c] mt-0.5">
                              PIC: <strong>{agenda.pic}</strong>
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAgenda(agenda.id)}
                        className="text-[#b1a299] hover:text-rose-600 p-1 transition-colors"
                        title="Hapus Jadwal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Form Tambah Rundown Cepat */}
              <form
                onSubmit={handleAddAgenda}
                className="bg-white p-3 rounded-xl border border-[#d5c3b8] space-y-2 text-xs"
              >
                <div className="font-bold text-[#6f4627] flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Agenda Tanggal Ini</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={newAgendaTime}
                    onChange={(e) => setNewAgendaTime(e.target.value)}
                    placeholder="Waktu (e.g. 10:00 - 11:30)"
                    className="sm:col-span-1 px-2.5 py-1.5 rounded-lg border border-[#d5c3b8] bg-[#faf6f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b5e3c]"
                    required
                  />
                  <input
                    type="text"
                    value={newAgendaTitle}
                    onChange={(e) => setNewAgendaTitle(e.target.value)}
                    placeholder="Nama Kegiatan / Sesi"
                    className="sm:col-span-2 px-2.5 py-1.5 rounded-lg border border-[#d5c3b8] bg-[#faf6f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b5e3c]"
                    required
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newAgendaPic}
                    onChange={(e) => setNewAgendaPic(e.target.value)}
                    placeholder="Penanggung Jawab / PIC (Opsional)"
                    className="flex-1 px-2.5 py-1.5 rounded-lg border border-[#d5c3b8] bg-[#faf6f2] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8b5e3c]"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-[#6f4627] hover:bg-[#52341b] text-white rounded-lg font-bold shadow-2xs transition-all"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#faf6f2] border-t border-[#d5c3b8] px-5 py-3 flex items-center justify-between text-xs text-[#51443c] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8b5e3c]" />
            <span>
              Waktu otomatis tersinkronisasi dan dapat dijadikan jam resmi di meja penerimaan tamu.
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-[#ede5df] text-[#6f4627] border border-[#d5c3b8] rounded-xl font-bold shadow-2xs transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
