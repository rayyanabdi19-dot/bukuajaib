import React from 'react';
import { Guest } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  BarChart3, 
  Users, 
  User, 
  Sparkles, 
  Gift, 
  Clock, 
  TrendingUp,
  CircleDot
} from 'lucide-react';

interface BentoMetricsProps {
  guests: Guest[];
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
        <h2 className="font-serif-luxury text-lg md:text-xl font-bold text-[#6f4627] flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[#735c00]" />
          <span>Ringkasan Kehadiran & Amplop Real-Time</span>
        </h2>
        <span className="text-xs font-semibold text-[#51443c] flex items-center gap-1.5 bg-[#f3f4f3] px-2.5 py-1 rounded-full border border-[#d5c3b8]">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>Pembaruan Langsung</span>
        </span>
      </div>

      {/* Bento Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tamu Card */}
        <div className="bg-white p-5 rounded-xl border border-[#d5c3b8] shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#51443c] font-semibold">Total Kehadiran</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-luxury text-3xl md:text-4xl text-[#6f4627] font-bold">
                  {totalGuests}
                </span>
                <span className="text-sm font-semibold text-[#1a1c1c]">Tamu</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#ffdcc5] flex items-center justify-center text-[#6f4627]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeeed] flex items-center justify-between text-xs text-[#51443c]">
            <span>Fisik Tamu Hadir:</span>
            <span className="font-bold text-[#1a1c1c] bg-[#f3f4f3] px-2.5 py-0.5 rounded border border-[#d5c3b8]/50">
              {totalPeople} Orang
            </span>
          </div>
        </div>

        {/* Pihak Laki-Laki Card */}
        <div className="bg-white p-5 rounded-xl border border-[#d5c3b8] shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full mb-1">
                <User className="w-3 h-3 text-amber-800" />
                <span>Pihak Laki-laki</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-luxury text-3xl md:text-4xl text-[#1a1c1c] font-bold">
                  {maleCount}
                </span>
                <span className="text-xs text-[#51443c] font-medium">Tamu ({malePeople} Orang)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeeed] text-xs text-[#51443c] space-y-1">
            <div className="flex justify-between">
              <span>Amplop Terkumpul:</span>
              <span className="font-semibold text-[#1a1c1c]">{maleEnvelopes} Amplop</span>
            </div>
            <div className="flex justify-between font-bold text-[#6f4627]">
              <span>Nominal Terhitung:</span>
              <span>{formatRupiah(maleCash)}</span>
            </div>
          </div>
        </div>

        {/* Pihak Perempuan Card */}
        <div className="bg-white p-5 rounded-xl border border-[#d5c3b8] shadow-sm relative overflow-hidden flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-900 bg-rose-100 px-2 py-0.5 rounded-full mb-1">
                <User className="w-3 h-3 text-rose-800" />
                <span>Pihak Perempuan</span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-serif-luxury text-3xl md:text-4xl text-[#1a1c1c] font-bold">
                  {femaleCount}
                </span>
                <span className="text-xs text-[#51443c] font-medium">Tamu ({femalePeople} Orang)</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-800">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#eeeeed] text-xs text-[#51443c] space-y-1">
            <div className="flex justify-between">
              <span>Amplop Terkumpul:</span>
              <span className="font-semibold text-[#1a1c1c]">{femaleEnvelopes} Amplop</span>
            </div>
            <div className="flex justify-between font-bold text-[#6f4627]">
              <span>Nominal Terhitung:</span>
              <span>{formatRupiah(femaleCash)}</span>
            </div>
          </div>
        </div>

        {/* Total Amplop & Nominal Card */}
        <div className="bg-gradient-to-br from-white via-[#fffbeb] to-[#fef3c7]/30 p-5 rounded-xl border-2 border-[#735c00]/40 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#735c00] font-bold uppercase tracking-wider flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>TOTAL DANA TERKUMPUL</span>
              </p>
              <div className="mt-1">
                <span className="font-serif-luxury text-2xl md:text-3xl text-[#6f4627] font-bold">
                  {formatRupiah(totalCash)}
                </span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#fed65b] text-[#745c00] flex items-center justify-center shadow-sm">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-[#d5c3b8]/50 space-y-1 text-xs">
            <div className="flex justify-between text-[#51443c]">
              <span>Total {totalEnvelopes} Amplop:</span>
              <span>
                <strong className="text-emerald-700 font-semibold">{countedEnvelopes} Dihitung</strong>
                {' / '}
                <strong className="text-amber-700 font-semibold">{pendingEnvelopes} Pending</strong>
              </span>
            </div>
            <div className="flex justify-between text-[#51443c]">
              <span>Rata-rata / amplop:</span>
              <span className="font-bold text-[#1a1c1c]">{formatRupiah(avgEnvelope)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ratio Bar Pihak Laki-Laki vs Perempuan */}
      <div className="bg-white p-4 rounded-xl border border-[#d5c3b8] flex flex-col sm:flex-row items-center justify-between gap-3 text-sm shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <span className="font-bold text-[#1a1c1c] text-xs uppercase tracking-wide">
            Rasio Kehadiran Pihak:
          </span>
          <div className="flex items-center gap-1.5 text-xs text-amber-900 font-bold bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8b5e3c]"></span>
            <span>Laki-laki ({maleRatio}%)</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-rose-900 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
            <span className="w-2.5 h-2.5 rounded-full bg-[#735c00]"></span>
            <span>Perempuan ({femaleRatio}%)</span>
          </div>
        </div>

        {/* Visual Proportion Bar */}
        <div className="w-full sm:w-80 h-3.5 bg-[#eeeeed] rounded-full overflow-hidden flex shadow-inner">
          <div
            className="h-full bg-[#8b5e3c] transition-all duration-500"
            style={{ width: `${maleRatio}%` }}
            title={`Laki-laki: ${maleRatio}%`}
          ></div>
          <div
            className="h-full bg-[#735c00] transition-all duration-500"
            style={{ width: `${femaleRatio}%` }}
            title={`Perempuan: ${femaleRatio}%`}
          ></div>
        </div>
      </div>
    </section>
  );
};
