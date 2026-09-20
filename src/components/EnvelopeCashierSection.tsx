import React, { useState } from 'react';
import { Guest } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { 
  Mail, 
  ShieldCheck, 
  Coins, 
  CheckCircle, 
  Hourglass, 
  Calculator, 
  ArrowRight,
  Filter,
  DollarSign
} from 'lucide-react';

interface EnvelopeCashierSectionProps {
  guests: Guest[];
  onUpdateGuestEnvelope: (guestId: string, amount: number, status: 'counted' | 'pending') => void;
}

export const EnvelopeCashierSection: React.FC<EnvelopeCashierSectionProps> = ({
  guests,
  onUpdateGuestEnvelope,
}) => {
  const [boxFilter, setBoxFilter] = useState<'all' | 'box_male' | 'box_female'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'counted'>('all');
  const [activeCountingGuest, setActiveCountingGuest] = useState<Guest | null>(null);
  const [countingInput, setCountingInput] = useState('');

  // Envelopes only
  const envelopeGuests = guests.filter((g) => g.hasEnvelope);

  const maleEnvelopes = envelopeGuests.filter((g) => g.envelopeBox === 'box_male' || g.party === 'laki');
  const femaleEnvelopes = envelopeGuests.filter((g) => g.envelopeBox === 'box_female' || g.party === 'perempuan');

  const maleTotalCounted = maleEnvelopes
    .filter((g) => g.envelopeStatus === 'counted')
    .reduce((sum, g) => sum + g.envelopeAmount, 0);

  const femaleTotalCounted = femaleEnvelopes
    .filter((g) => g.envelopeStatus === 'counted')
    .reduce((sum, g) => sum + g.envelopeAmount, 0);

  const filteredEnvelopes = envelopeGuests.filter((g) => {
    const isMale = g.envelopeBox === 'box_male' || g.party === 'laki';
    if (boxFilter === 'box_male' && !isMale) return false;
    if (boxFilter === 'box_female' && isMale) return false;
    if (statusFilter !== 'all' && g.envelopeStatus !== statusFilter) return false;
    return true;
  });

  const pendingCount = envelopeGuests.filter((g) => g.envelopeStatus === 'pending').length;
  const countedCount = envelopeGuests.filter((g) => g.envelopeStatus === 'counted').length;

  const handleSaveCount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCountingGuest) return;
    const amount = parseRupiahInput(countingInput);
    onUpdateGuestEnvelope(activeCountingGuest.id, amount, 'counted');
    setActiveCountingGuest(null);
    setCountingInput('');
  };

  return (
    <section className="glass-panel p-5 md:p-6 rounded-2xl border border-white/80 shadow-md space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-purple-100/70 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-purple-600 text-white shadow-xs">
              <Mail className="w-5 h-5" />
            </span>
            <h3 className="font-serif-luxury text-xl font-bold text-[#1e1b4b]">
              Kasir Dual-Box Amplop & Manajemen Nominal
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Pemisahan fisik kotak uang Pihak Laki-laki dan Perempuan dengan verifikasi serial kode unik.
          </p>
        </div>

        {/* Dual Box Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBoxFilter(boxFilter === 'box_male' ? 'all' : 'box_male')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              boxFilter === 'box_male'
                ? 'bg-orange-100 border-orange-400 text-orange-950 ring-2 ring-orange-300'
                : 'bg-orange-50/80 border-orange-200 text-orange-900 hover:bg-orange-100'
            }`}
          >
            Kotak Pria ({maleEnvelopes.length})
          </button>
          <button
            onClick={() => setBoxFilter(boxFilter === 'box_female' ? 'all' : 'box_female')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-2xs ${
              boxFilter === 'box_female'
                ? 'bg-purple-100 border-purple-400 text-purple-950 ring-2 ring-purple-300'
                : 'bg-purple-50/80 border-purple-200 text-purple-900 hover:bg-purple-100'
            }`}
          >
            Kotak Wanita ({femaleEnvelopes.length})
          </button>
        </div>
      </div>

      {/* Dual Box Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Box Pria */}
        <div className="p-4 rounded-2xl glass-card bg-orange-50/40 border border-orange-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-orange-950">
              KOTAK PIHAK LAKI-LAKI
            </span>
            <span className="text-xs font-bold bg-orange-200/80 text-orange-950 px-2 py-0.5 rounded-full">
              {maleEnvelopes.length} Amplop
            </span>
          </div>
          <div className="font-serif-luxury text-2xl text-orange-950 font-bold">
            {formatRupiah(maleTotalCounted)}
          </div>
          <div className="flex justify-between text-xs text-orange-900/90 pt-2 border-t border-orange-200/70">
            <span>
              {maleEnvelopes.filter((g) => g.envelopeStatus === 'counted').length} Selesai Dihitung
            </span>
            <span className="font-semibold text-orange-800">
              {maleEnvelopes.filter((g) => g.envelopeStatus === 'pending').length} Belum Dihitung
            </span>
          </div>
        </div>

        {/* Box Wanita */}
        <div className="p-4 rounded-2xl glass-card bg-purple-50/40 border border-purple-200/80 space-y-2 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-950">
              KOTAK PIHAK PEREMPUAN
            </span>
            <span className="text-xs font-bold bg-purple-200/80 text-purple-950 px-2 py-0.5 rounded-full">
              {femaleEnvelopes.length} Amplop
            </span>
          </div>
          <div className="font-serif-luxury text-2xl text-purple-950 font-bold">
            {formatRupiah(femaleTotalCounted)}
          </div>
          <div className="flex justify-between text-xs text-purple-900/90 pt-2 border-t border-purple-200/70">
            <span>
              {femaleEnvelopes.filter((g) => g.envelopeStatus === 'counted').length} Selesai Dihitung
            </span>
            <span className="font-semibold text-purple-800">
              {femaleEnvelopes.filter((g) => g.envelopeStatus === 'pending').length} Belum Dihitung
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar for Envelopes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-purple-50/40 p-3 rounded-2xl border border-purple-100/70">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1e1b4b]">Status Penghitungan:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shadow-2xs ${
              statusFilter === 'all'
                ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white'
                : 'bg-white/85 text-gray-700 border border-purple-200/80 hover:bg-white'
            }`}
          >
            Semua ({envelopeGuests.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shadow-2xs ${
              statusFilter === 'pending'
                ? 'bg-orange-600 text-white'
                : 'bg-white/85 text-orange-900 border border-orange-200 hover:bg-white'
            }`}
          >
            Belum Dihitung ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('counted')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition-all shadow-2xs ${
              statusFilter === 'counted'
                ? 'bg-emerald-600 text-white'
                : 'bg-white/85 text-emerald-800 border border-emerald-200 hover:bg-white'
            }`}
          >
            Sudah Dihitung ({countedCount})
          </button>
        </div>

        <div className="text-gray-500 text-xs">
          Protokol Kasir: Setiap amplop memiliki kode unik untuk akuntabilitas keluarga.
        </div>
      </div>

      {/* Grid of Envelopes */}
      {filteredEnvelopes.length === 0 ? (
        <div className="py-12 text-center text-gray-500 bg-white/40 rounded-2xl border border-dashed border-purple-200 p-8">
          <Mail className="w-10 h-10 text-purple-400 mx-auto mb-2 opacity-50" />
          <h4 className="font-bold text-sm text-[#1e1b4b]">Belum Ada Amplop Tercatat</h4>
          <p className="text-xs text-gray-600 mt-1 max-w-md mx-auto leading-relaxed">
            Saat tamu melakukan check-in dengan membawa amplop, kode amplop akan otomatis terdaftar di meja kasir ini untuk dihitung.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredEnvelopes.map((guest) => {
          const isPending = guest.envelopeStatus === 'pending';
          const isMale = guest.envelopeBox === 'box_male' || guest.party === 'laki';

          return (
            <div
              key={guest.id}
              className={`p-4 rounded-2xl border transition-all glass-card ${
                isPending
                  ? 'bg-orange-50/40 border-orange-300/80 shadow-2xs'
                  : 'bg-white/70 border-white/80 hover:border-purple-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold bg-white/90 px-2 py-0.5 rounded-md text-purple-950 border border-purple-200/80 shadow-2xs">
                    {guest.envelopeCode || 'AMP-AUTO'}
                  </span>
                  <h4 className="font-bold text-sm text-[#1e1b4b] mt-1.5">{guest.name}</h4>
                  <p className="text-xs text-gray-600">{guest.relation || 'Tamu Resepsi'}</p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isMale
                      ? 'bg-orange-100 text-orange-950 border border-orange-300'
                      : 'bg-purple-100 text-purple-950 border border-purple-300'
                  }`}
                >
                  {isMale ? 'Box Pria' : 'Box Wanita'}
                </span>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-purple-100/60 flex items-center justify-between">
                <div>
                  {isPending ? (
                    <div className="text-xs font-bold text-orange-800 flex items-center gap-1">
                      <Hourglass className="w-3.5 h-3.5 text-orange-600" />
                      <span>Belum Dihitung</span>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-sm text-orange-950">
                        {formatRupiah(guest.envelopeAmount)}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-semibold">Telah Dihitung</div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    setActiveCountingGuest(guest);
                    setCountingInput(guest.envelopeAmount > 0 ? guest.envelopeAmount.toString() : '');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
                    isPending
                      ? 'bg-gradient-to-r from-orange-500 to-purple-600 text-white shadow-xs hover:opacity-95'
                      : 'bg-white/85 text-purple-950 border border-purple-200/80 hover:bg-white'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{isPending ? 'Buka & Hitung' : 'Koreksi'}</span>
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Counting Dialog / Modal */}
      {activeCountingGuest && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel bg-white/95 rounded-2xl border border-white/90 max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-purple-100/70 pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#1e1b4b]">
                  Hitung Nominal Amplop
                </h3>
                <p className="text-xs text-gray-600">
                  {activeCountingGuest.envelopeCode} • Tamu: {activeCountingGuest.name}
                </p>
              </div>
              <button
                onClick={() => setActiveCountingGuest(null)}
                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-purple-50 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-purple-950 mb-1">
                  Masukkan Nominal Uang Fisik (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-purple-900">
                    Rp
                  </span>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={countingInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setCountingInput(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                    }}
                    placeholder="Contoh: 500.000"
                    className="w-full pl-11 pr-4 py-3 bg-white border-2 border-purple-300 rounded-xl text-lg font-bold text-[#1e1b4b] focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Quick Nominal Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] text-gray-600 font-semibold">Pecahan Cepat:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[100000, 200000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCountingInput(amt.toLocaleString('id-ID'))}
                      className="py-2 px-1 bg-purple-50/70 hover:bg-orange-100 border border-purple-200/80 rounded-xl text-xs font-bold text-purple-950 transition-colors shadow-2xs"
                    >
                      {amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000} Rb`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-purple-100/70">
                <button
                  type="button"
                  onClick={() => setActiveCountingGuest(null)}
                  className="px-4 py-2 border border-purple-200/80 rounded-xl text-xs font-bold text-gray-600 hover:bg-purple-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Simpan Verifikasi Uang</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
