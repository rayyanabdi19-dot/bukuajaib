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
    <section className="bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm space-y-5" id="rekap">
      <div className="flex items-center justify-between border-b border-[#eeeeed] pb-3">
        <div>
          <h3 className="font-serif-luxury text-lg md:text-xl font-bold text-[#6f4627]">
            Rekapitulasi Amplop & Donasi
          </h3>
          <p className="text-xs text-[#51443c] mt-0.5">
            Perbandingan akuntabilitas amplop Pihak Laki-laki vs Perempuan
          </p>
        </div>
        <button
          onClick={onExportExcel}
          className="text-xs font-bold text-[#735c00] hover:underline flex items-center gap-1 bg-[#fffbeb] px-2.5 py-1 rounded-lg border border-[#fed65b]"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Rekap</span>
        </button>
      </div>

      {/* Mini Comparison Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Kolom Pihak Laki-laki */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              PIHAK LAKI-LAKI
            </span>
            <span className="text-xs bg-amber-200 text-amber-950 font-bold px-2 py-0.5 rounded-full">
              {maleCount} Tamu
            </span>
          </div>

          <div className="font-serif-luxury text-2xl text-amber-950 font-bold">
            {formatRupiah(maleCash)}
          </div>

          <div className="space-y-1 text-xs text-amber-900/90 pt-1.5 border-t border-amber-200">
            <div className="flex justify-between">
              <span>Amplop Sudah Dihitung:</span>
              <span className="font-bold text-[#1a1c1c]">{maleCounted} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Amplop Belum Dihitung:</span>
              <span className="font-bold text-amber-800">{malePending} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Total Fisik Hadir:</span>
              <span className="font-semibold text-[#1a1c1c]">{malePeople} Jiwa</span>
            </div>
          </div>
        </div>

        {/* Kolom Pihak Perempuan */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
              PIHAK PEREMPUAN
            </span>
            <span className="text-xs bg-rose-200 text-rose-950 font-bold px-2 py-0.5 rounded-full">
              {femaleCount} Tamu
            </span>
          </div>

          <div className="font-serif-luxury text-2xl text-rose-950 font-bold">
            {formatRupiah(femaleCash)}
          </div>

          <div className="space-y-1 text-xs text-rose-900/90 pt-1.5 border-t border-rose-200">
            <div className="flex justify-between">
              <span>Amplop Sudah Dihitung:</span>
              <span className="font-bold text-[#1a1c1c]">{femaleCounted} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Amplop Belum Dihitung:</span>
              <span className="font-bold text-rose-800">{femalePending} Amplop</span>
            </div>
            <div className="flex justify-between">
              <span>Total Fisik Hadir:</span>
              <span className="font-semibold text-[#1a1c1c]">{femalePeople} Jiwa</span>
            </div>
          </div>
        </div>
      </div>

      {/* Export Format Options */}
      <div className="pt-3 border-t border-[#d5c3b8]/60" id="laporan">
        <p className="text-xs font-bold text-[#1a1c1c] uppercase tracking-wider mb-2">
          PILIHAN EXPORT LAPORAN SIAP CETAK:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            onClick={onExportPdf}
            className="p-3.5 border border-[#d5c3b8] rounded-xl bg-[#f3f4f3] hover:bg-[#eeeeed] transition-all flex items-start gap-3 cursor-pointer group shadow-2xs"
          >
            <div className="p-2 rounded-lg bg-red-100 text-red-700 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1a1c1c] group-hover:text-[#6f4627] flex items-center gap-1">
                <span>Format PDF Siap Cetak</span>
                <span className="text-[10px] bg-red-50 text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                  Resmi
                </span>
              </h4>
              <p className="text-[11px] text-[#51443c] mt-0.5 leading-relaxed">
                Kop resmi 'Buku Tamu Pernikahan Budi & Siti', tanda tangan saksi & rekapitulasi nominal.
              </p>
            </div>
          </div>

          <div
            onClick={onExportExcel}
            className="p-3.5 border border-[#d5c3b8] rounded-xl bg-[#f3f4f3] hover:bg-[#eeeeed] transition-all flex items-start gap-3 cursor-pointer group shadow-2xs"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 mt-0.5">
              <Table className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1a1c1c] group-hover:text-[#6f4627] flex items-center gap-1">
                <span>Format Excel Multi-Sheet</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200">
                  .CSV / .XLSX
                </span>
              </h4>
              <p className="text-[11px] text-[#51443c] mt-0.5 leading-relaxed">
                3 Sheet otomatis: Sheet 1 Rekapitulasi, Sheet 2 Data Tamu, Sheet 3 Data Amplop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
