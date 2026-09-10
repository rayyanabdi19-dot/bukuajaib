import React from 'react';

interface BukuAjaibLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const BukuAjaibLogo: React.FC<BukuAjaibLogoProps> = ({
  className = '',
  size = 64,
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Golden Book & Intertwined Rings Emblem */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 90"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5e1b8" />
            <stop offset="40%" stopColor="#c59859" />
            <stop offset="100%" stopColor="#966d32" />
          </linearGradient>
          <linearGradient id="goldGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#faecd1" />
            <stop offset="50%" stopColor="#d5aa6c" />
            <stop offset="100%" stopColor="#a47a3e" />
          </linearGradient>
          <linearGradient id="goldGrad3" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#b4874b" />
            <stop offset="50%" stopColor="#e2bd83" />
            <stop offset="100%" stopColor="#966d32" />
          </linearGradient>
        </defs>

        {/* Diamond Setting on Right Ring */}
        <g transform="translate(68, 14)">
          {/* Diamond Solitaire stone */}
          <polygon
            points="0,-8 5,-2 3,2 -3,2 -5,-2"
            fill="#faecd1"
            stroke="url(#goldGrad1)"
            strokeWidth="1.2"
          />
          <polygon
            points="0,-8 2,-2 0,2 -2,-2"
            fill="#ffffff"
            opacity="0.9"
          />
          {/* Sparkle lines */}
          <line x1="0" y1="-12" x2="0" y2="-9" stroke="#f5e1b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="-4" y1="-10" x2="-2" y2="-8" stroke="#f5e1b8" strokeWidth="1" strokeLinecap="round" />
          <line x1="4" y1="-10" x2="2" y2="-8" stroke="#f5e1b8" strokeWidth="1" strokeLinecap="round" />
        </g>

        {/* Left Ring */}
        <ellipse
          cx="43"
          cy="28"
          rx="15"
          ry="15"
          fill="none"
          stroke="url(#goldGrad1)"
          strokeWidth="4.5"
        />
        <ellipse
          cx="43"
          cy="28"
          rx="12.5"
          ry="12.5"
          fill="none"
          stroke="#fdfbf7"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Right Ring (intertwined) */}
        <ellipse
          cx="61"
          cy="26"
          rx="15"
          ry="15"
          fill="none"
          stroke="url(#goldGrad2)"
          strokeWidth="4.5"
        />
        <ellipse
          cx="61"
          cy="26"
          rx="12.5"
          ry="12.5"
          fill="none"
          stroke="#fdfbf7"
          strokeWidth="0.8"
          opacity="0.5"
        />

        {/* Intertwine overlap highlight */}
        <path
          d="M 52 17 A 15 15 0 0 1 56 37"
          fill="none"
          stroke="url(#goldGrad1)"
          strokeWidth="4.5"
        />

        {/* Open Book Base Structure */}
        {/* Left Page Outer Shell */}
        <path
          d="M 50 56 C 42 50, 24 45, 12 50 C 10 65, 12 70, 20 74 C 32 71, 44 73, 50 82 Z"
          fill="url(#goldGrad2)"
          stroke="url(#goldGrad1)"
          strokeWidth="1.5"
        />

        {/* Right Page Outer Shell */}
        <path
          d="M 50 56 C 58 50, 76 45, 88 50 C 90 65, 88 70, 80 74 C 68 71, 56 73, 50 82 Z"
          fill="url(#goldGrad1)"
          stroke="url(#goldGrad2)"
          strokeWidth="1.5"
        />

        {/* Book Spine / Center Rib */}
        <path
          d="M 50 56 L 50 82"
          stroke="url(#goldGrad3)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Left Page Inner Curved Lines (page thickness effect) */}
        <path
          d="M 16 54 C 28 50, 40 54, 48 59"
          fill="none"
          stroke="#faecd1"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <path
          d="M 20 62 C 30 58, 40 61, 48 66"
          fill="none"
          stroke="#faecd1"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Right Page Inner Curved Lines */}
        <path
          d="M 84 54 C 72 50, 60 54, 52 59"
          fill="none"
          stroke="#faecd1"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <path
          d="M 80 62 C 70 58, 60 61, 52 66"
          fill="none"
          stroke="#faecd1"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* Heart Symbol in the center of the book */}
        <path
          d="M 50 63 C 48 60, 44 60, 42 63 C 40 66, 43 70, 50 75 C 57 70, 60 66, 58 63 C 56 60, 52 60, 50 63 Z"
          fill="url(#goldGrad3)"
          stroke="#fdfbf7"
          strokeWidth="0.8"
        />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col">
          <span className="text-[28px] sm:text-[32px] font-extrabold text-[#1e293b] leading-tight tracking-tight">
            BukuAjaib
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold text-[#b59265] tracking-[0.24em] uppercase -mt-0.5">
            BUKU TAMU PREWEDDING
          </span>
        </div>
      )}
    </div>
  );
};
