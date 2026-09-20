import React from 'react';
import { Guest } from '../types';
import { formatRupiah } from '../utils/formatters';
import { 
  FileSpreadsheet, 
  FileText, 
  Download, 
  CheckCircle2, 
  Users, 
  ShieldCheck,
  TrendingUp,
  Table
} from 'lucide-react';

interface RekapitulasiSectionProps {
  guests: Guest[];
  onExportPdf: () => void;
  onExportExcel: () => void;
}

export const RekapitulasiSection: React.FC<RekapitulasiSectionProps> = ({
  guests,
  onExportPdf,
  onExportExcel,
}) => {
  const maleGuests = guests.filter((g) => g.party === 'laki');
  const femaleGuests = guests.filter((g) => g.party === 'perempuan');

  const maleCount = maleGuests.length;
  const malePeople = maleGuests.reduce((acc, g) => acc + (g.guestCount || 1), 0);
  const maleCash = maleGuests.reduce((acc, g) => acc + (g.envelopeAmount || 0), 0);
  const maleCounted = maleGuests.filter((g) => g.hasEnvelope && g.envelopeStatus === 'counted').length;
  const malePending = maleGuests.filter((g) => g.hasEnvelope && g.envelopeStatus === 'pending').length;

  const femaleCount = femaleGuests.length;
  const femalePeople = femaleGuests.reduce((acc, g) => acc + (g.guestCount || 1), 0);
  const femaleCash = femaleGuests.reduce((acc, g) => acc + (g.envelopeAmount || 0), 0);
  const femaleCounted = femaleGuests.filter((g) => g.hasEnvelope && g.envelopeStatus === 'counted').length;
  const femalePending = femaleGuests.filter((g) => g.hasEnvelope && g.envelopeStatus === 'pending').length;

  return (
    <section className="glass-panel p-5 md:p-6 rounded-2xl border border-white/80 shadow-md space-y-5" id="rekap">
      <div className="flex items-center justify-between border-b border-purple-100/70 pb-3">
        <div>
          <h3 className="font-serif-luxury text-lg md:text-xl font-bold text-[#1e1b4b]">
            Rekapitulasi Amplop & Donasi
          </h3>
          <p className="text-xs text-gray-600 mt-0.5">
            Perbandingan akuntabilitas amplop Pihak Laki-laki vs Perempuan
          </p>
        </div>
        <button
          onClick={onExportExcel}
          className="text-xs font-bold text-purple-950 hover:bg-white flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-purple-200/80 shadow-2xs transition-all"
        >
          <Download className="w-3.5 h-3.5 text-purple-700" />
          <span>Download Rekap</span>
        </button>
      </div>

      {/* Mini Comparison Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Pihak Laki-laki (Orange Kulit Jeruk) */}
        <div className="p-4.5 rounded-2xl bg-orange-500/10 border border-orange-200/80 backdrop-blur-xs space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-900">
              PIHAK LAKI-LAKI
            </span>
            <span className="text-xs bg-orange-500 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              {maleCount} Tamu
            </span>
          </div>

          <div className="font-serif-luxury text-2xl text-orange-950 font-bold">
            {formatRupiah(maleCash)}
          </div>

          <div className="space-y-1.5 text-xs text-orange-900/90 pt-2 border-t border-orange-200/60">
            <div className="flex justify-between">
              <span>Amplop Sudah Dihitung:</span>
              <span className="font-bold text-[#1e1b4b]">{maleCounted} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Amplop Belum Dihitung:</span>
              <span className="font-bold text-orange-800">{malePending} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Total Fisik Hadir:</span>
              <span className="font-semibold text-[#1e1b4b]">{malePeople} Jiwa</span>
            </div>
          </div>
        </div>

        {/* Kolom Pihak Perempuan (Ungu Royal) */}
        <div className="p-4.5 rounded-2xl bg-purple-500/10 border border-purple-200/80 backdrop-blur-xs space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
              PIHAK PEREMPUAN
            </span>
            <span className="text-xs bg-purple-600 text-white font-bold px-2.5 py-0.5 rounded-full shadow-2xs">
              {femaleCount} Tamu
            </span>
          </div>

          <div className="font-serif-luxury text-2xl text-purple-950 font-bold">
            {formatRupiah(femaleCash)}
          </div>

          <div className="space-y-1.5 text-xs text-purple-900/90 pt-2 border-t border-purple-200/60">
            <div className="flex justify-between">
              <span>Amplop Sudah Dihitung:</span>
              <span className="font-bold text-[#1e1b4b]">{femaleCounted} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Amplop Belum Dihitung:</span>
              <span className="font-bold text-purple-800">{femalePending} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Total Fisik Hadir:</span>
              <span className="font-semibold text-[#1e1b4b]">{femalePeople} Jiwa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Format Options */}
      <div className="pt-3 border-t border-purple-100/70" id="laporan">
        <p className="text-xs font-bold text-purple-950 uppercase tracking-wider mb-2">
          PILIHAN EXPORT LAPORAN SIAP CETAK:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={onExportPdf}
            className="glass-card p-4 rounded-xl border border-white/80 hover:border-red-200 transition-all flex items-start gap-3.5 cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-red-100 text-red-700 mt-0.5 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1e1b4b] group-hover:text-purple-900 flex items-center gap-1.5">
                <span>Format PDF Siap Cetak</span>
                <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded-md border border-red-200 font-semibold">
                  Resmi
                </span>
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                Kop resmi Buku Tamu Resepsi Pernikahan, tanda tangan saksi & rekapitulasi nominal.
              </p>
            </div>
          </div>

          <div
            onClick={onExportExcel}
            className="glass-card p-4 rounded-xl border border-white/80 hover:border-emerald-200 transition-all flex items-start gap-3.5 cursor-pointer group shadow-2xs hover:shadow-xs"
          >
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-700 mt-0.5 shadow-2xs">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1e1b4b] group-hover:text-purple-900 flex items-center gap-1.5">
                <span>Format Excel Multi-Sheet</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md border border-emerald-200 font-semibold">
                  .CSV / .XLSX
                </span>
              </h4>
              <p className="text-[11px] text-gray-600 mt-0.5 leading-relaxed">
                3 Sheet otomatis: Sheet 1 Rekapitulasi, Sheet 2 Data Tamu, Sheet 3 Data Amplop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
