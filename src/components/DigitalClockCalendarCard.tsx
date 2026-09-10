import React, { useState, useEffect, useMemo } from 'react';
import { WeddingEventInfo, Guest } from '../types';
import {
  Clock,
  CalendarDays,
  Calendar,
  Maximize2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  MapPin,
  CheckCircle2,
  Sliders,
} from 'lucide-react';

interface DigitalClockCalendarCardProps {
  eventInfo: WeddingEventInfo;
  guests: Guest[];
  onOpenFullModal: () => void;
  onOpenEventSettings?: () => void;
}

const INDO_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const INDO_DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export const DigitalClockCalendarCard: React.FC<DigitalClockCalendarCardProps> = ({
  eventInfo,
  guests,
  onOpenFullModal,
  onOpenEventSettings,
}) => {
  const [time, setTime] = useState(new Date());
  const [viewDate, setViewDate] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const dayNameFull = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][time.getDay()];
  const dateNum = time.getDate();
  const monthName = INDO_MONTHS[time.getMonth()];
  const year = time.getFullYear();

  // Calendar days calculation
  const calendarGrid = useMemo(() => {
    const y = viewDate.getFullYear();
    const m = viewDate.getMonth();
    const firstDay = new Date(y, m, 1);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrev = new Date(y, m, 0).getDate();

    const days = [];
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(y, m - 1, daysInPrev - i),
        isCurrentMonth: false,
        dayNumber: daysInPrev - i,
      });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(y, m, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(y, m + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }
    return days;
  }, [viewDate]);

  const weddingDay = 20;
  const weddingMonth = 8; // Sep (0-indexed)
  const weddingYear = 2026;

  return (
    <div className="bg-white rounded-xl border border-[#d5c3b8] shadow-sm p-4 md:p-5 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeed] pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#8b5e3c]" />
          <div>
            <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-[#6f4627]">
              Jam Digital Presisi & Kalender Meja Resepsi
            </h3>
            <p className="text-xs text-[#51443c]">
              Waktu resmi registrasi tamu dan jadwal kalender resepsi pernikahan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenEventSettings && (
            <button
              onClick={onOpenEventSettings}
              className="px-2.5 py-1 text-xs font-semibold text-[#6f4627] bg-[#faf6f2] hover:bg-[#ede5df] rounded-lg border border-[#d5c3b8] transition-colors flex items-center gap-1"
            >
              <Sliders className="w-3.5 h-3.5 text-[#8c7355]" />
              <span>Atur Jadwal</span>
            </button>
          )}
          <button
            onClick={onOpenFullModal}
            className="px-3 py-1 bg-[#6f4627] hover:bg-[#52341b] text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Buka Layar Penuh</span>
          </button>
        </div>
      </div>

      {/* 2-Column Content: Digital Clock Banner (Left) + Monthly Calendar (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* LEFT: DIGITAL CLOCK HERO (5 cols) */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#1a1c1c] via-[#2a231f] to-[#1a1c1c] text-white p-4 sm:p-5 rounded-xl border border-[#8b5e3c]/40 flex flex-col justify-between shadow-inner space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>LIVE CLOCK • WIB</span>
            </span>
            <span className="text-[11px] text-white/70 bg-white/10 px-2 py-0.5 rounded-full font-medium">
              Meja Resepsi
            </span>
          </div>

          {/* Clock Display */}
          <div className="flex items-baseline justify-center font-mono font-extrabold text-amber-400 text-4xl sm:text-5xl tracking-tight my-1">
            <span>{hh}</span>
            <span className="animate-pulse text-amber-300 mx-1">:</span>
            <span>{mm}</span>
            <span className="animate-pulse text-amber-300 mx-1">:</span>
            <span className="text-amber-200 text-3xl sm:text-4xl">{ss}</span>
          </div>

          <div className="text-center space-y-1">
            <div className="font-serif-luxury text-sm sm:text-base font-semibold text-amber-100">
              {dayNameFull}, {dateNum} {monthName} {year}
            </div>
            <div className="text-[11px] text-white/70 flex items-center justify-center gap-1">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{eventInfo.location}</span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-white/80">
            <span>Sesi: <strong>{eventInfo.timeStr}</strong></span>
            <span className="text-emerald-300 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tersinkron
            </span>
          </div>
        </div>

        {/* RIGHT: COMPACT MONTHLY CALENDAR (7 cols) */}
        <div className="md:col-span-7 bg-[#faf6f2] p-4 rounded-xl border border-[#d5c3b8] space-y-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between border-b border-[#e5ded7] pb-2">
            <div className="flex items-center gap-1.5 font-serif-luxury font-bold text-sm sm:text-base text-[#6f4627]">
              <CalendarDays className="w-4 h-4 text-[#8b5e3c]" />
              <span>{INDO_MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewDate(new Date())}
                className="px-2 py-0.5 text-[11px] font-semibold text-[#6f4627] bg-white hover:bg-[#ede5df] rounded border border-[#d5c3b8]"
              >
                Hari Ini
              </button>
              <button
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
                className="p-1 text-[#51443c] hover:text-[#1a1c1c] hover:bg-white rounded"
                title="Bulan Sebelumnya"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
                className="p-1 text-[#51443c] hover:text-[#1a1c1c] hover:bg-white rounded"
                title="Bulan Berikutnya"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-[#51443c]">
            <span>Sen</span>
            <span>Sel</span>
            <span>Rab</span>
            <span>Kam</span>
            <span>Jum</span>
            <span className="text-amber-800">Sab</span>
            <span className="text-rose-700">Min</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarGrid.map((item, idx) => {
              const d = item.date;
              const isToday =
                d.getDate() === time.getDate() &&
                d.getMonth() === time.getMonth() &&
                d.getFullYear() === time.getFullYear();

              const isWedding =
                d.getDate() === weddingDay &&
                d.getMonth() === weddingMonth &&
                d.getFullYear() === weddingYear;

              return (
                <div
                  key={idx}
                  onClick={onOpenFullModal}
                  className={`h-7 sm:h-8 flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-all ${
                    isWedding
                      ? 'bg-amber-400 text-[#1a1c1c] font-extrabold shadow-2xs'
                      : isToday
                      ? 'bg-emerald-600 text-white font-bold'
                      : item.isCurrentMonth
                      ? 'text-[#1a1c1c] hover:bg-white'
                      : 'text-[#b1a299] opacity-35'
                  }`}
                  title={isWedding ? 'Hari H Resepsi Pernikahan' : isToday ? 'Hari Ini' : undefined}
                >
                  <span>{item.dayNumber}</span>
                  {isWedding && <span className="w-1 h-1 rounded-full bg-black"></span>}
                </div>
              );
            })}
          </div>

          {/* Footer Legend */}
          <div className="pt-2 border-t border-[#e5ded7] flex items-center justify-between text-[10px] text-[#51443c]">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Hari H Resepsi</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Hari Ini</span>
              </span>
            </div>
            <button
              onClick={onOpenFullModal}
              className="text-[#8b5e3c] font-bold hover:underline"
            >
              Lihat Rundown Lengkap &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
