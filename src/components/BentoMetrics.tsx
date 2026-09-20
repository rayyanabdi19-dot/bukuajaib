import React from 'react';
import { Guest } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  BarChart3, 
  Users, 
  User, 
  Sparkles, 
  Gift, 
  TrendingUp,
  Coins
} from 'lucide-react';

interface BentoMetricsProps {
  guests: Guest[];
  eventInfo?: any;
}

export const BentoMetrics: React.FC<BentoMetricsProps> = ({ guests }) => {
  // Compute real dynamic metrics from guests array
  const totalGuests = guests.length;
  const totalPeople = guests.reduce((acc, g) => acc + (g.guestCount || 1), 0);

  const maleGuests = guests.filter((g) => g.party === 'laki');
  const maleCount = maleGuests.length;
  const malePeople = maleGuests.reduce((acc, g) => acc + (g.guestCount || 1), 0);
  const maleEnvelopes = maleGuests.filter((g) => g.hasEnvelope).length;
  const maleCash = maleGuests.reduce((acc, g) => acc + (g.envelopeAmount || 0), 0);

  const femaleGuests = guests.filter((g) => g.party === 'perempuan');
  const femaleCount = femaleGuests.length;
  const femalePeople = femaleGuests.reduce((acc, g) => acc + (g.guestCount || 1), 0);
  const femaleEnvelopes = femaleGuests.filter((g) => g.hasEnvelope).length;
  const femaleCash = femaleGuests.reduce((acc, g) => acc + (g.envelopeAmount || 0), 0);

  const totalCash = guests.reduce((acc, g) => acc + (g.envelopeAmount || 0), 0);
  const totalEnvelopes = guests.filter((g) => g.hasEnvelope).length;
  const countedEnvelopes = guests.filter((g) => g.hasEnvelope && g.envelopeStatus === 'counted').length;
  const pendingEnvelopes = guests.filter((g) => g.hasEnvelope && g.envelopeStatus === 'pending').length;

  const avgEnvelope = countedEnvelopes > 0 ? Math.round(totalCash / countedEnvelopes) : 0;

  const maleRatio = totalGuests > 0 ? Math.round((maleCount / totalGuests) * 100) : 50;
  const femaleRatio = 100 - maleRatio;

  return (
    <section className="space-y-4" id="dashboard">
      <div className="flex items-center justify-between">
        <h2 className="font-serif-luxury text-lg md:text-xl font-bold text-[#1e1b4b] flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
            <BarChart3 className="w-4 h-4" />
          </div>
          <span>Ringkasan Kehadiran & Amplop Real-Time</span>
        </h2>
        <span className="text-xs font-semibold text-purple-900 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-purple-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></span>
          <span className="w-2 h-2 rounded-full bg-orange-500 -ml-4"></span>
          <span>Pembaruan Langsung</span>
        </span>
      </div>

      {/* Glassmorphism Bento Cards Grid (Orange Kulit Jeruk, Putih, Ungu) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tamu (Glass Putih + Aksen Orange) */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between border-white/80 group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-400/20 transition-all"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-900 bg-orange-100/70 border border-orange-200/80 px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                Total Kehadiran
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="font-serif-luxury text-3xl md:text-4xl text-[#1e1b4b] font-bold tracking-tight">
                  {totalGuests}
                </span>
                <span className="text-sm font-bold text-orange-700">Tamu</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-100/60 flex items-center justify-between text-xs text-[#51443c] relative z-10">
            <span className="font-medium text-gray-600">Fisik Hadir:</span>
            <span className="font-bold text-[#1e1b4b] bg-white/90 px-3 py-0.5 rounded-full border border-orange-200/70 shadow-2xs">
              {totalPeople} Jiwa
            </span>
          </div>
        </div>

        {/* Card 2: Pihak Laki-Laki (Glass Orange Kulit Jeruk) */}
        <div className="glass-card-orange p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-orange-500/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-950 bg-orange-500/15 border border-orange-300/80 px-2.5 py-0.5 rounded-full mb-1.5">
                <User className="w-3 h-3 text-orange-700" />
                <span>Pihak Laki-laki</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-luxury text-3xl md:text-4xl text-orange-950 font-bold">
                  {maleCount}
                </span>
                <span className="text-xs font-semibold text-orange-800">Tamu ({malePeople} Jiwa)</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-orange-200/60 text-xs text-orange-950/80 space-y-1.5 relative z-10">
            <div className="flex justify-between">
              <span className="font-medium">Amplop Masuk:</span>
              <span className="font-bold text-orange-950">{maleEnvelopes} Amplop</span>
            </div>
            <div className="flex justify-between font-extrabold text-orange-800">
              <span>Nominal:</span>
              <span className="text-orange-950 bg-white/80 px-2 py-0.5 rounded-md border border-orange-200">
                {formatRupiah(maleCash)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Pihak Perempuan (Glass Ungu / Purple) */}
        <div className="glass-card-purple p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute top-0 right-0 w-28 h-28 bg-purple-500/15 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-purple-950 bg-purple-500/15 border border-purple-300/80 px-2.5 py-0.5 rounded-full mb-1.5">
                <User className="w-3 h-3 text-purple-700" />
                <span>Pihak Perempuan</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-luxury text-3xl md:text-4xl text-purple-950 font-bold">
                  {femaleCount}
                </span>
                <span className="text-xs font-semibold text-purple-800">Tamu ({femalePeople} Jiwa)</span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-violet-700 flex items-center justify-center text-white shadow-lg shadow-purple-600/25">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-200/60 text-xs text-purple-950/80 space-y-1.5 relative z-10">
            <div className="flex justify-between">
              <span className="font-medium">Amplop Masuk:</span>
              <span className="font-bold text-purple-950">{femaleEnvelopes} Amplop</span>
            </div>
            <div className="flex justify-between font-extrabold text-purple-800">
              <span>Nominal:</span>
              <span className="text-purple-950 bg-white/80 px-2 py-0.5 rounded-md border border-purple-200">
                {formatRupiah(femaleCash)}
              </span>
            </div>
          </div>
        </div>

        {/* Card 4: Total Dana Terkumpul (Glass Dual Orange & Ungu) */}
        <div className="glass-card-dual p-5 rounded-2xl relative overflow-hidden flex flex-col justify-between group">
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-orange-400/25 to-purple-500/25 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-900 bg-white/90 border border-orange-300/80 px-2.5 py-0.5 rounded-full mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-orange-600" />
                <span>TOTAL DANA TERKUMPUL</span>
              </div>
              <div className="mt-1">
                <span className="font-serif-luxury text-2xl md:text-3xl font-black bg-gradient-to-r from-orange-600 via-purple-700 to-purple-900 bg-clip-text text-transparent">
                  {formatRupiah(totalCash)}
                </span>
              </div>
            </div>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-500 via-purple-600 to-violet-700 text-white flex items-center justify-center shadow-lg shadow-purple-600/20">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-purple-200/60 space-y-1.5 text-xs relative z-10">
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-medium">Total {totalEnvelopes} Amplop:</span>
              <span className="space-x-1">
                <span className="text-purple-700 bg-purple-100/80 px-2 py-0.5 rounded-full font-bold border border-purple-200/60">
                  {countedEnvelopes} Dihitung
                </span>
                <span className="text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full font-bold border border-orange-200/60">
                  {pendingEnvelopes} Pending
                </span>
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span className="font-medium">Rata-rata / amplop:</span>
              <span className="font-bold text-[#1e1b4b] bg-white/90 px-2 py-0.5 rounded-md border border-purple-100 shadow-2xs">
                {formatRupiah(avgEnvelope)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratio Bar Pihak Laki-Laki vs Perempuan (Glassmorphism UI) */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm border-white/80">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-[#1e1b4b] text-xs uppercase tracking-wide">
            Rasio Kehadiran Pihak:
          </span>
          <div className="flex items-center gap-1.5 text-xs text-orange-950 font-bold bg-orange-100/80 px-3 py-1 rounded-full border border-orange-200">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-xs"></span>
            <span>Laki-laki ({maleRatio}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-purple-950 font-bold bg-purple-100/80 px-3 py-1 rounded-full border border-purple-200">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-purple-600 to-violet-700 shadow-xs"></span>
            <span>Perempuan ({femaleRatio}%)</span>
          </div>
        </div>

        {/* Visual Proportion Bar with Orange & Purple gradients */}
        <div className="w-full sm:w-80 h-3.5 bg-gray-200/70 rounded-full overflow-hidden flex shadow-inner p-0.5 border border-white/60">
          <div
            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-l-full transition-all duration-500 shadow-xs"
            style={{ width: `${maleRatio}%` }}
            title={`Laki-laki: ${maleRatio}%`}
          ></div>
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-violet-700 rounded-r-full transition-all duration-500 shadow-xs"
            style={{ width: `${femaleRatio}%` }}
            title={`Perempuan: ${femaleRatio}%`}
          ></div>
        </div>
      </div>
    </section>
  );
};

