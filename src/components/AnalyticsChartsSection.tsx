import React, { useState, useMemo } from 'react';
import { Guest, WeddingEventInfo } from '../types';
import { formatRupiah } from '../utils/formatters';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Gift,
  Users,
  BarChart3,
  PieChart as PieIcon,
  Sparkles,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  CircleDot,
} from 'lucide-react';

interface AnalyticsChartsSectionProps {
  guests: Guest[];
  eventInfo?: WeddingEventInfo;
  title?: string;
  subtitle?: string;
}

// Color palette aligned with warm luxury wedding aesthetic
const COLOR_MALE = '#8b5e3c'; // Warm Amber/Bronze for Pihak Laki-laki
const COLOR_FEMALE = '#c27803'; // Warm Golden Ochre for Pihak Perempuan
const COLOR_TOTAL = '#52341b'; // Deep Chestnut
const CATEGORY_COLORS: Record<string, string> = {
  VIP: '#735c00',
  Keluarga: '#8b5e3c',
  'Rekan Kerja': '#b45309',
  'Teman Sekolah': '#d97706',
  Komunitas: '#92400e',
  Umum: '#a16207',
};

const ALL_CATEGORIES: Array<Guest['category']> = [
  'VIP',
  'Keluarga',
  'Rekan Kerja',
  'Teman Sekolah',
  'Komunitas',
  'Umum',
];

export const AnalyticsChartsSection: React.FC<AnalyticsChartsSectionProps> = ({
  guests,
  eventInfo,
  title = 'Analisis Visual: Kehadiran Tamu & Nominal Amplop',
  subtitle = 'Grafik tren kedatangan per jam dan komparasi penerimaan amplop berdasarkan kategori pihak mempelai',
}) => {
  // Chart view toggles
  const [attendanceChartType, setAttendanceChartType] = useState<'area' | 'bar'>('area');
  const [attendanceMetric, setAttendanceMetric] = useState<'tamu' | 'orang'>('tamu');
  const [envelopeViewMode, setEnvelopeViewMode] = useState<'nominal' | 'jumlah'>('nominal');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState<'all' | 'laki' | 'perempuan'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'siang' | 'malam'>('all');

  // Filter guests based on active filters
  const filteredGuests = useMemo(() => {
    return guests.filter((g) => {
      if (selectedPartyFilter !== 'all' && g.party !== selectedPartyFilter) {
        return false;
      }
      if (timeFilter !== 'all') {
        const match = g.checkInTime.match(/(\d{1,2}):(\d{2})/);
        const hour = match ? parseInt(match[1], 10) : 19;
        if (timeFilter === 'siang' && hour >= 16) return false;
        if (timeFilter === 'malam' && hour < 16) return false;
      }
      return true;
    });
  }, [guests, selectedPartyFilter, timeFilter]);

  // 1. =========================================================================
  // HOURLY ATTENDANCE DATA COMPUTATION (Tren Kehadiran Per Jam)
  // =========================================================================
  const { hourlyData, peakHourInfo, cumulativeAttendance } = useMemo(() => {
    // Map out hour ranges: default wedding reception usually runs from 10:00 to 22:00
    // We dynamically detect the min and max hours from data, with min 11:00 and max 21:00
    let minHour = 11;
    let maxHour = 21;

    filteredGuests.forEach((g) => {
      const match = g.checkInTime.match(/(\d{1,2}):(\d{2})/);
      if (match) {
        const h = parseInt(match[1], 10);
        if (h < minHour && h >= 6) minHour = h;
        if (h > maxHour && h <= 23) maxHour = h;
      }
    });

    const hoursMap: Record<
      number,
      {
        hourStr: string;
        tamuLaki: number;
        tamuPerempuan: number;
        totalTamu: number;
        orangLaki: number;
        orangPerempuan: number;
        totalOrang: number;
        amplopCount: number;
        nominalAmplop: number;
      }
    > = {};

    for (let h = minHour; h <= maxHour; h++) {
      const label = `${String(h).padStart(2, '0')}:00`;
      hoursMap[h] = {
        hourStr: label,
        tamuLaki: 0,
        tamuPerempuan: 0,
        totalTamu: 0,
        orangLaki: 0,
        orangPerempuan: 0,
        totalOrang: 0,
        amplopCount: 0,
        nominalAmplop: 0,
      };
    }

    filteredGuests.forEach((g) => {
      const match = g.checkInTime.match(/(\d{1,2}):(\d{2})/);
      const h = match ? parseInt(match[1], 10) : 18;
      const bucket = hoursMap[h] || (hoursMap[18] ??= {
        hourStr: `${String(h).padStart(2, '0')}:00`,
        tamuLaki: 0,
        tamuPerempuan: 0,
        totalTamu: 0,
        orangLaki: 0,
        orangPerempuan: 0,
        totalOrang: 0,
        amplopCount: 0,
        nominalAmplop: 0,
      });

      const count = g.guestCount || 1;
      if (g.party === 'laki') {
        bucket.tamuLaki += 1;
        bucket.orangLaki += count;
      } else {
        bucket.tamuPerempuan += 1;
        bucket.orangPerempuan += count;
      }
      bucket.totalTamu += 1;
      bucket.totalOrang += count;

      if (g.hasEnvelope) {
        bucket.amplopCount += 1;
        bucket.nominalAmplop += g.envelopeAmount || 0;
      }
    });

    const sortedHours = Object.keys(hoursMap)
      .map(Number)
      .sort((a, b) => a - b);

    let cumulative = 0;
    const list = sortedHours.map((h) => {
      const item = hoursMap[h];
      cumulative += item.totalTamu;
      return {
        ...item,
        kumulatifTamu: cumulative,
      };
    });

    // Find peak hour
    let peak = { hourStr: '-', count: 0, people: 0 };
    list.forEach((item) => {
      if (item.totalTamu > peak.count) {
        peak = { hourStr: item.hourStr, count: item.totalTamu, people: item.totalOrang };
      }
    });

    return {
      hourlyData: list,
      peakHourInfo: peak,
      cumulativeAttendance: cumulative,
    };
  }, [filteredGuests]);

  // 2. =========================================================================
  // ENVELOPE BY CATEGORY & PARTY COMPUTATION (Nominal Amplop Berdasarkan Kategori Pihak Mempelai)
  // =========================================================================
  const { categoryData, totalsByParty, topCategory } = useMemo(() => {
    const map: Record<
      string,
      {
        category: string;
        nominalLaki: number;
        nominalPerempuan: number;
        totalNominal: number;
        amplopLaki: number;
        amplopPerempuan: number;
        totalAmplop: number;
        tamuCount: number;
      }
    > = {};

    ALL_CATEGORIES.forEach((cat) => {
      map[cat] = {
        category: cat,
        nominalLaki: 0,
        nominalPerempuan: 0,
        totalNominal: 0,
        amplopLaki: 0,
        amplopPerempuan: 0,
        totalAmplop: 0,
        tamuCount: 0,
      };
    });

    let totalLakiCash = 0;
    let totalPerempuanCash = 0;
    let totalLakiEnvelopes = 0;
    let totalPerempuanEnvelopes = 0;

    guests.forEach((g) => {
      const cat = ALL_CATEGORIES.includes(g.category) ? g.category : 'Umum';
      const item = map[cat];
      const amount = g.envelopeAmount || 0;

      item.tamuCount += 1;
      if (g.party === 'laki') {
        item.nominalLaki += amount;
        totalLakiCash += amount;
        if (g.hasEnvelope) {
          item.amplopLaki += 1;
          totalLakiEnvelopes += 1;
        }
      } else {
        item.nominalPerempuan += amount;
        totalPerempuanCash += amount;
        if (g.hasEnvelope) {
          item.amplopPerempuan += 1;
          totalPerempuanEnvelopes += 1;
        }
      }
      item.totalNominal = item.nominalLaki + item.nominalPerempuan;
      item.totalAmplop = item.amplopLaki + item.amplopPerempuan;
    });

    const list = ALL_CATEGORIES.map((cat) => map[cat]);

    // Sort to find highest contributing category
    let top = list[0];
    list.forEach((item) => {
      if (item.totalNominal > (top?.totalNominal || 0)) {
        top = item;
      }
    });

    return {
      categoryData: list,
      totalsByParty: {
        totalLakiCash,
        totalPerempuanCash,
        grandTotalCash: totalLakiCash + totalPerempuanCash,
        totalLakiEnvelopes,
        totalPerempuanEnvelopes,
        grandTotalEnvelopes: totalLakiEnvelopes + totalPerempuanEnvelopes,
      },
      topCategory: top,
    };
  }, [guests]);

  // Donut chart data for Pihak proportion
  const pieData = useMemo(() => {
    return [
      {
        name: 'Pihak Laki-laki (Groom)',
        value: totalsByParty.totalLakiCash,
        color: COLOR_MALE,
        count: totalsByParty.totalLakiEnvelopes,
      },
      {
        name: 'Pihak Perempuan (Bride)',
        value: totalsByParty.totalPerempuanCash,
        color: COLOR_FEMALE,
        count: totalsByParty.totalPerempuanEnvelopes,
      },
    ];
  }, [totalsByParty]);

  // Custom tooltips
  const CustomHourlyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-[#1a1c1c] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs space-y-1.5 min-w-[200px] z-50">
          <div className="flex items-center justify-between border-b border-white/20 pb-1 font-bold text-amber-200">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Pukul {label} WIB</span>
            </span>
            <span className="text-[10px] text-white/70">Waktu Kedatangan</span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5e3c]"></span>
                <span>Pihak Laki-laki:</span>
              </span>
              <span className="font-bold">
                {attendanceMetric === 'tamu' ? `${data.tamuLaki} Tamu` : `${data.orangLaki} Jiwa`}
              </span>
            </div>
            <div className="flex justify-between items-center text-yellow-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c27803]"></span>
                <span>Pihak Perempuan:</span>
              </span>
              <span className="font-bold">
                {attendanceMetric === 'tamu' ? `${data.tamuPerempuan} Tamu` : `${data.orangPerempuan} Jiwa`}
              </span>
            </div>
            <div className="border-t border-white/15 pt-1 flex justify-between font-bold text-white">
              <span>Total Jam Ini:</span>
              <span className="text-emerald-300">
                {attendanceMetric === 'tamu' ? `${data.totalTamu} Tamu` : `${data.totalOrang} Jiwa`}
              </span>
            </div>
            {data.amplopCount > 0 && (
              <div className="flex justify-between text-[11px] text-white/80 pt-0.5">
                <span>Amplop Masuk:</span>
                <span className="text-amber-300 font-semibold">{formatRupiah(data.nominalAmplop)}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomCategoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload;
      return (
        <div className="bg-[#1a1c1c] text-white p-3 rounded-xl shadow-xl border border-white/10 text-xs space-y-1.5 min-w-[220px] z-50">
          <div className="border-b border-white/20 pb-1 font-bold text-amber-200 flex items-center justify-between">
            <span>Kategori: {label}</span>
            <span className="text-[10px] text-white/70">{data.tamuCount} Tamu Terdaftar</span>
          </div>
          <div className="space-y-1 pt-0.5">
            <div className="flex justify-between items-center text-amber-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8b5e3c]"></span>
                <span>Pihak Laki-laki:</span>
              </span>
              <span className="font-bold">
                {envelopeViewMode === 'nominal'
                  ? formatRupiah(data.nominalLaki)
                  : `${data.amplopLaki} Amplop`}
              </span>
            </div>
            <div className="flex justify-between items-center text-yellow-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#c27803]"></span>
                <span>Pihak Perempuan:</span>
              </span>
              <span className="font-bold">
                {envelopeViewMode === 'nominal'
                  ? formatRupiah(data.nominalPerempuan)
                  : `${data.amplopPerempuan} Amplop`}
              </span>
            </div>
            <div className="border-t border-white/15 pt-1 flex justify-between font-bold text-white">
              <span>Total Kategori Ini:</span>
              <span className="text-emerald-300">
                {envelopeViewMode === 'nominal'
                  ? formatRupiah(data.totalNominal)
                  : `${data.totalAmplop} Amplop`}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const malePercent =
    totalsByParty.grandTotalCash > 0
      ? Math.round((totalsByParty.totalLakiCash / totalsByParty.grandTotalCash) * 100)
      : 50;
  const femalePercent = 100 - malePercent;

  return (
    <section className="space-y-6" id="analisis-section">
      {/* Header Bar */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#735c00] uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4 text-[#8b5e3c]" />
            <span>Dashboard Visualisasi & Intelijen Resepsi</span>
          </div>
          <h3 className="font-serif-luxury text-xl md:text-2xl font-bold text-[#6f4627]">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-[#51443c] mt-0.5">{subtitle}</p>
        </div>

        {/* Global Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Party Filter */}
          <div className="flex items-center bg-[#f3f4f3] p-1 rounded-xl border border-[#d5c3b8]">
            <button
              onClick={() => setSelectedPartyFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedPartyFilter === 'all'
                  ? 'bg-white text-[#6f4627] shadow-2xs font-bold'
                  : 'text-[#51443c] hover:text-[#1a1c1c]'
              }`}
            >
              Semua Pihak
            </button>
            <button
              onClick={() => setSelectedPartyFilter('laki')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedPartyFilter === 'laki'
                  ? 'bg-[#8b5e3c] text-white shadow-2xs font-bold'
                  : 'text-[#51443c] hover:text-[#1a1c1c]'
              }`}
            >
              Pria
            </button>
            <button
              onClick={() => setSelectedPartyFilter('perempuan')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedPartyFilter === 'perempuan'
                  ? 'bg-[#735c00] text-white shadow-2xs font-bold'
                  : 'text-[#51443c] hover:text-[#1a1c1c]'
              }`}
            >
              Wanita
            </button>
          </div>

          {/* Time Filter */}
          <div className="flex items-center bg-[#f3f4f3] p-1 rounded-xl border border-[#d5c3b8]">
            <button
              onClick={() => setTimeFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'all'
                  ? 'bg-white text-[#6f4627] shadow-2xs font-bold'
                  : 'text-[#51443c] hover:text-[#1a1c1c]'
              }`}
            >
              Semua Jam
            </button>
            <button
              onClick={() => setTimeFilter('siang')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'siang'
                  ? 'bg-white text-[#6f4627] shadow-2xs font-bold'
                  : 'text-[#51443c] hover:text-[#1a1c1c]'
              }`}
            >
              Siang (&lt;16:00)
            </button>
            <button
              onClick={() => setTimeFilter('malam')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                timeFilter === 'malam'
                  ? 'bg-white text-[#6f4627] shadow-2xs font-bold'
                  : 'text-[#51443c] hover:text-[#1a1c1c]'
              }`}
            >
              Malam (&ge;16:00)
            </button>
          </div>
        </div>
      </div>

      {/* TOP METRIC HIGHLIGHTS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak Arrival Hour Card */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-[#d5c3b8] shadow-sm flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#735c00] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>JAM PUNCAK KEDATANGAN</span>
              </span>
              <h4 className="font-serif-luxury text-2xl font-bold text-[#1a1c1c] mt-1">
                {peakHourInfo.hourStr !== '-' ? `${peakHourInfo.hourStr} WIB` : '18:00 WIB'}
              </h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#eeeeed] flex items-center justify-between text-xs text-[#51443c]">
            <span>Volume Kedatangan:</span>
            <span className="font-bold text-[#6f4627]">
              {peakHourInfo.count} Tamu ({peakHourInfo.people} Jiwa)
            </span>
          </div>
        </div>

        {/* Top Category Card */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-[#d5c3b8] shadow-sm flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#8b5e3c] flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                <span>KATEGORI TERTINGGI</span>
              </span>
              <h4 className="font-serif-luxury text-2xl font-bold text-[#1a1c1c] mt-1">
                {topCategory?.category || 'VIP'}
              </h4>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#ffdcc5] text-[#6f4627] flex items-center justify-center">
              <Gift className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#eeeeed] flex items-center justify-between text-xs text-[#51443c]">
            <span>Total Donasi:</span>
            <span className="font-bold text-emerald-800">
              {formatRupiah(topCategory?.totalNominal || 0)}
            </span>
          </div>
        </div>

        {/* Pihak Laki-Laki Total */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-[#d5c3b8] shadow-sm flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8b5e3c]"></span>
                <span>AMPLOP PIHAK LAKI-LAKI</span>
              </span>
              <h4 className="font-serif-luxury text-2xl font-bold text-[#1a1c1c] mt-1">
                {formatRupiah(totalsByParty.totalLakiCash)}
              </h4>
            </div>
            <span className="text-xs bg-amber-100 text-amber-950 font-bold px-2 py-1 rounded-lg">
              {malePercent}% Total
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#eeeeed] flex items-center justify-between text-xs text-[#51443c]">
            <span>Kotak Box Pria:</span>
            <span className="font-bold text-[#1a1c1c]">
              {totalsByParty.totalLakiEnvelopes} Amplop Fisik
            </span>
          </div>
        </div>

        {/* Pihak Perempuan Total */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-[#d5c3b8] shadow-sm flex flex-col justify-between hover:border-[#8b5e3c]/50 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#c27803]"></span>
                <span>AMPLOP PIHAK PEREMPUAN</span>
              </span>
              <h4 className="font-serif-luxury text-2xl font-bold text-[#1a1c1c] mt-1">
                {formatRupiah(totalsByParty.totalPerempuanCash)}
              </h4>
            </div>
            <span className="text-xs bg-rose-100 text-rose-950 font-bold px-2 py-1 rounded-lg">
              {femalePercent}% Total
            </span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#eeeeed] flex items-center justify-between text-xs text-[#51443c]">
            <span>Kotak Box Wanita:</span>
            <span className="font-bold text-[#1a1c1c]">
              {totalsByParty.totalPerempuanEnvelopes} Amplop Fisik
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHART 1: TREN KEHADIRAN PER JAM (HOURLY ATTENDANCE TREND) */}
      {/* ========================================================================= */}
      <div className="bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeed] pb-3.5">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#8b5e3c]" />
              <h4 className="font-serif-luxury text-lg font-bold text-[#6f4627]">
                1. Tren Laju Kehadiran Tamu Per Jam
              </h4>
            </div>
            <p className="text-xs text-[#51443c] mt-0.5">
              Grafik distribusi arus kedatangan tamu di meja resepsi sepanjang rangkaian acara pernikahan.
            </p>
          </div>

          {/* Control Buttons for Hourly Chart */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Mode Toggle */}
            <div className="flex items-center bg-[#f3f4f3] p-1 rounded-lg border border-[#d5c3b8]/70 text-xs">
              <button
                onClick={() => setAttendanceMetric('tamu')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  attendanceMetric === 'tamu'
                    ? 'bg-white text-[#6f4627] shadow-2xs font-bold'
                    : 'text-[#51443c] hover:text-[#1a1c1c]'
                }`}
              >
                Jumlah Tamu (Entry)
              </button>
              <button
                onClick={() => setAttendanceMetric('orang')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  attendanceMetric === 'orang'
                    ? 'bg-white text-[#6f4627] shadow-2xs font-bold'
                    : 'text-[#51443c] hover:text-[#1a1c1c]'
                }`}
              >
                Total Jiwa (Fisik)
              </button>
            </div>

            {/* Chart Type Toggle */}
            <div className="flex items-center bg-[#f3f4f3] p-1 rounded-lg border border-[#d5c3b8]/70 text-xs">
              <button
                onClick={() => setAttendanceChartType('area')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  attendanceChartType === 'area'
                    ? 'bg-[#8b5e3c] text-white shadow-2xs font-bold'
                    : 'text-[#51443c] hover:text-[#1a1c1c]'
                }`}
                title="Area Chart (Grafik Aliran Kehadiran)"
              >
                Grafik Aliran
              </button>
              <button
                onClick={() => setAttendanceChartType('bar')}
                className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                  attendanceChartType === 'bar'
                    ? 'bg-[#8b5e3c] text-white shadow-2xs font-bold'
                    : 'text-[#51443c] hover:text-[#1a1c1c]'
                }`}
                title="Bar Chart (Kolom Komparasi)"
              >
                Grafik Batang
              </button>
            </div>
          </div>
        </div>

        {/* The Recharts Container */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {attendanceChartType === 'area' ? (
              <AreaChart data={hourlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorLaki" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_MALE} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLOR_MALE} stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorPerempuan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLOR_FEMALE} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={COLOR_FEMALE} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ded7" vertical={false} />
                <XAxis
                  dataKey="hourStr"
                  tick={{ fill: '#51443c', fontSize: 11 }}
                  stroke="#d5c3b8"
                />
                <YAxis
                  tick={{ fill: '#51443c', fontSize: 11 }}
                  stroke="#d5c3b8"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomHourlyTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <Area
                  type="monotone"
                  dataKey={attendanceMetric === 'tamu' ? 'tamuLaki' : 'orangLaki'}
                  name="Pihak Laki-laki"
                  stroke={COLOR_MALE}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorLaki)"
                />
                <Area
                  type="monotone"
                  dataKey={attendanceMetric === 'tamu' ? 'tamuPerempuan' : 'orangPerempuan'}
                  name="Pihak Perempuan"
                  stroke={COLOR_FEMALE}
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorPerempuan)"
                />
              </AreaChart>
            ) : (
              <BarChart data={hourlyData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ded7" vertical={false} />
                <XAxis
                  dataKey="hourStr"
                  tick={{ fill: '#51443c', fontSize: 11 }}
                  stroke="#d5c3b8"
                />
                <YAxis
                  tick={{ fill: '#51443c', fontSize: 11 }}
                  stroke="#d5c3b8"
                  allowDecimals={false}
                />
                <Tooltip content={<CustomHourlyTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <Bar
                  dataKey={attendanceMetric === 'tamu' ? 'tamuLaki' : 'orangLaki'}
                  name="Pihak Laki-laki"
                  fill={COLOR_MALE}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={attendanceMetric === 'tamu' ? 'tamuPerempuan' : 'orangPerempuan'}
                  name="Pihak Perempuan"
                  fill={COLOR_FEMALE}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Hourly Insights Footer */}
        <div className="pt-3 border-t border-[#eeeeed] flex flex-wrap items-center justify-between gap-2 text-xs text-[#51443c]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>
              <strong>Puncak Trafik:</strong> Terjadi pada rentang waktu{' '}
              <strong className="text-[#1a1c1c]">{peakHourInfo.hourStr} WIB</strong> dengan{' '}
              {peakHourInfo.count} tamu ({peakHourInfo.people} jiwa).
            </span>
          </div>
          <div className="text-[11px] text-[#735c00] font-semibold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            Total Kumulatif: {cumulativeAttendance} Tamu Hadir
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CHART 2: NOMINAL AMPLOP MASUK BERDASARKAN KATEGORI PIHAK MEMPELAI */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Main Bar Chart: Per Kategori & Pihak Mempelai (8 Cols) */}
        <div className="lg:col-span-8 bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eeeeed] pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-[#735c00]" />
                <h4 className="font-serif-luxury text-lg font-bold text-[#6f4627]">
                  2. Nominal Amplop Berdasarkan Kategori Tamu & Pihak
                </h4>
              </div>
              <p className="text-xs text-[#51443c] mt-0.5">
                Perbandingan total nominal sumbangan amplop dari keluarga, rekan kerja, VIP, dll.
              </p>
            </div>

            {/* Toggle Mode: Nominal (Rp) vs Jumlah Amplop (Pcs) */}
            <div className="flex items-center bg-[#f3f4f3] p-1 rounded-lg border border-[#d5c3b8]/70 text-xs">
              <button
                onClick={() => setEnvelopeViewMode('nominal')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  envelopeViewMode === 'nominal'
                    ? 'bg-[#735c00] text-white shadow-2xs font-bold'
                    : 'text-[#51443c] hover:text-[#1a1c1c]'
                }`}
              >
                Nominal Rupiah (Rp)
              </button>
              <button
                onClick={() => setEnvelopeViewMode('jumlah')}
                className={`px-3 py-1 rounded-md font-semibold transition-all ${
                  envelopeViewMode === 'jumlah'
                    ? 'bg-[#735c00] text-white shadow-2xs font-bold'
                    : 'text-[#51443c] hover:text-[#1a1c1c]'
                }`}
              >
                Jumlah Amplop (Pcs)
              </button>
            </div>
          </div>

          {/* Bar Chart Container */}
          <div className="w-full h-80 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={categoryData}
                margin={{ top: 10, right: 15, left: envelopeViewMode === 'nominal' ? 15 : -10, bottom: 25 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5ded7" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fill: '#51443c', fontSize: 11 }}
                  stroke="#d5c3b8"
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fill: '#51443c', fontSize: 11 }}
                  stroke="#d5c3b8"
                  tickFormatter={(val) => {
                    if (envelopeViewMode === 'jumlah') return `${val}`;
                    if (val >= 1000000) return `${val / 1000000}jt`;
                    if (val >= 1000) return `${val / 1000}rb`;
                    return `${val}`;
                  }}
                />
                <Tooltip content={<CustomCategoryTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ paddingBottom: 10, fontSize: 12 }}
                />
                <Bar
                  dataKey={envelopeViewMode === 'nominal' ? 'nominalLaki' : 'amplopLaki'}
                  name="Pihak Laki-laki"
                  fill={COLOR_MALE}
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey={envelopeViewMode === 'nominal' ? 'nominalPerempuan' : 'amplopPerempuan'}
                  name="Pihak Perempuan"
                  fill={COLOR_FEMALE}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Summary Matrix Table */}
          <div className="overflow-x-auto pt-2 border-t border-[#eeeeed]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#faf6f2] text-[#6f4627] font-bold border-b border-[#e5ded7]">
                  <th className="py-2 px-3">Kategori Tamu</th>
                  <th className="py-2 px-3 text-right">Pihak Laki-laki</th>
                  <th className="py-2 px-3 text-right">Pihak Perempuan</th>
                  <th className="py-2 px-3 text-right">Total Nominal</th>
                  <th className="py-2 px-3 text-center">Amplop</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eeeeed]">
                {categoryData.map((row) => (
                  <tr key={row.category} className="hover:bg-[#faf6f2]/60 transition-colors">
                    <td className="py-2 px-3 font-semibold text-[#1a1c1c] flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[row.category] || '#8b5e3c' }}
                      ></span>
                      <span>{row.category}</span>
                    </td>
                    <td className="py-2 px-3 text-right text-amber-900 font-medium">
                      {formatRupiah(row.nominalLaki)}
                    </td>
                    <td className="py-2 px-3 text-right text-yellow-900 font-medium">
                      {formatRupiah(row.nominalPerempuan)}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#6f4627]">
                      {formatRupiah(row.totalNominal)}
                    </td>
                    <td className="py-2 px-3 text-center text-[#51443c]">
                      {row.totalAmplop} amplop
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Donut Chart: Komposisi Pihak Mempelai (4 Cols) */}
        <div className="lg:col-span-4 bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 border-b border-[#eeeeed] pb-3.5">
              <PieIcon className="w-4 h-4 text-[#8b5e3c]" />
              <h4 className="font-serif-luxury text-lg font-bold text-[#6f4627]">
                Proporsi Donasi Pihak
              </h4>
            </div>

            {/* Donut Chart */}
            <div className="w-full h-56 relative flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [formatRupiah(Number(value)), 'Total Masuk']}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Inner Center Metric */}
              <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] uppercase font-bold text-[#51443c]">Total Dana</span>
                <span className="text-sm font-bold text-[#6f4627]">
                  {formatRupiah(totalsByParty.grandTotalCash)}
                </span>
              </div>
            </div>

            {/* Side Legends & Percentages */}
            <div className="space-y-2.5 pt-2 border-t border-[#eeeeed] text-xs">
              <div className="p-3 bg-amber-50/70 border border-amber-200/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8b5e3c]"></span>
                    <span>Pihak Laki-laki</span>
                  </div>
                  <span className="text-xs font-bold text-amber-950">{malePercent}%</span>
                </div>
                <div className="flex items-center justify-between text-amber-900/90 text-[11px]">
                  <span>Nominal Terhitung:</span>
                  <span className="font-bold">{formatRupiah(totalsByParty.totalLakiCash)}</span>
                </div>
                <div className="flex items-center justify-between text-amber-900/80 text-[11px]">
                  <span>Total Amplop Fisik:</span>
                  <span>{totalsByParty.totalLakiEnvelopes} Amplop</span>
                </div>
              </div>

              <div className="p-3 bg-yellow-50/70 border border-yellow-200/90 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-yellow-950">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#c27803]"></span>
                    <span>Pihak Perempuan</span>
                  </div>
                  <span className="text-xs font-bold text-yellow-950">{femalePercent}%</span>
                </div>
                <div className="flex items-center justify-between text-yellow-900/90 text-[11px]">
                  <span>Nominal Terhitung:</span>
                  <span className="font-bold">{formatRupiah(totalsByParty.totalPerempuanCash)}</span>
                </div>
                <div className="flex items-center justify-between text-yellow-900/80 text-[11px]">
                  <span>Total Amplop Fisik:</span>
                  <span>{totalsByParty.totalPerempuanEnvelopes} Amplop</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice */}
          <div className="p-3 bg-[#faf6f2] border border-[#d5c3b8]/70 rounded-xl text-[11px] text-[#51443c] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              Data terintegrasi secara otomatis dengan setiap penambahan tamu baru dan penghitungan
              nominal kasir di meja resepsi.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
