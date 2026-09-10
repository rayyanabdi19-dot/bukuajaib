import React, { useState, useEffect } from 'react';
import { Clock, Calendar } from 'lucide-react';

interface DigitalClockPillProps {
  onOpenModal: () => void;
  className?: string;
}

const INDO_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const INDO_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export const DigitalClockPill: React.FC<DigitalClockPillProps> = ({
  onOpenModal,
  className = '',
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hh = String(time.getHours()).padStart(2, '0');
  const mm = String(time.getMinutes()).padStart(2, '0');
  const ss = String(time.getSeconds()).padStart(2, '0');
  const dayName = INDO_DAYS_SHORT[time.getDay()];
  const dateNum = time.getDate();
  const monthName = INDO_MONTHS_SHORT[time.getMonth()];

  return (
    <button
      onClick={onOpenModal}
      type="button"
      className={`group shrink-0 inline-flex items-center gap-1.5 sm:gap-2 bg-[#faf6f2] hover:bg-[#ede5df] active:scale-95 border border-[#d5c3b8] hover:border-[#8b5e3c] px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl shadow-2xs transition-all select-none text-left ${className}`}
      title="Klik untuk membuka Jam Digital Meja & Kalender Acara"
      aria-label="Jam digital dan kalender acara"
    >
      {/* Clock Icon with pulsing live indicator */}
      <div className="relative flex items-center justify-center shrink-0">
        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8b5e3c] group-hover:scale-110 transition-transform" />
        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
      </div>

      {/* Digital Time */}
      <div className="flex items-center font-mono font-bold text-[#1a1c1c] text-xs sm:text-sm tracking-tight whitespace-nowrap">
        <span>{hh}</span>
        <span className="animate-pulse text-[#8b5e3c] mx-0.5">:</span>
        <span>{mm}</span>
        <span className="hidden sm:inline-flex items-center">
          <span className="animate-pulse text-[#8b5e3c] mx-0.5">:</span>
          <span className="text-[#8b5e3c]">{ss}</span>
        </span>
        <span className="ml-1 text-[9px] sm:text-[10px] font-sans font-semibold text-[#51443c]">
          WIB
        </span>
      </div>

      {/* Date (visible on md+) */}
      <div className="hidden md:flex items-center gap-1 text-xs text-[#51443c] font-medium border-l border-[#d5c3b8]/70 pl-2 whitespace-nowrap">
        <Calendar className="w-3.5 h-3.5 text-[#8c7355]" />
        <span>
          {dayName}, {dateNum} {monthName}
        </span>
      </div>

      {/* Quick Calendar Badge (visible on lg+) */}
      <span className="hidden lg:inline-block text-[10px] bg-amber-100 text-amber-900 border border-amber-200 font-bold px-1.5 py-0.5 rounded-md group-hover:bg-amber-200 transition-colors whitespace-nowrap">
        Kalender
      </span>
    </button>
  );
};
