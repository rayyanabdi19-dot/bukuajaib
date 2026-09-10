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
    <section className="bg-white p-5 md:p-6 rounded-xl border border-[#d5c3b8] shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#eeeeed] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#8b5e3c]/10 text-[#6f4627]">
              <Mail className="w-5 h-5" />
            </span>
            <h3 className="font-serif-luxury text-xl font-bold text-[#6f4627]">
              Kasir Dual-Box Amplop & Manajemen Nominal
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#51443c] mt-1">
            Pemisahan fisik kotak uang Pihak Laki-laki dan Perempuan dengan verifikasi serial barcode unik.
          </p>
        </div>

        {/* Dual Box Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setBoxFilter(boxFilter === 'box_male' ? 'all' : 'box_male')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              boxFilter === 'box_male'
                ? 'bg-amber-100 border-amber-400 text-amber-950 ring-2 ring-amber-300'
                : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100'
            }`}
          >
            Kotak Pria ({maleEnvelopes.length})
          </button>
          <button
            onClick={() => setBoxFilter(boxFilter === 'box_female' ? 'all' : 'box_female')}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
              boxFilter === 'box_female'
                ? 'bg-rose-100 border-rose-400 text-rose-950 ring-2 ring-rose-300'
                : 'bg-rose-50/70 border-rose-200 text-rose-900 hover:bg-rose-100'
            }`}
          >
            Kotak Wanita ({femaleEnvelopes.length})
          </button>
        </div>
      </div>

      {/* Dual Box Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Box Pria */}
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
              KOTAK PIHAK LAKI-LAKI
            </span>
            <span className="text-xs font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
              {maleEnvelopes.length} Amplop
            </span>
          </div>
          <div className="font-serif-luxury text-2xl text-amber-950 font-bold">
            {formatRupiah(maleTotalCounted)}
          </div>
          <div className="flex justify-between text-xs text-amber-900/90 pt-2 border-t border-amber-200">
            <span>
              {maleEnvelopes.filter((g) => g.envelopeStatus === 'counted').length} Selesai Dihitung
            </span>
            <span className="font-semibold text-amber-800">
              {maleEnvelopes.filter((g) => g.envelopeStatus === 'pending').length} Belum Dihitung
            </span>
          </div>
        </div>

        {/* Box Wanita */}
        <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-900">
              KOTAK PIHAK PEREMPUAN
            </span>
            <span className="text-xs font-bold bg-rose-200 text-rose-950 px-2 py-0.5 rounded-full">
              {femaleEnvelopes.length} Amplop
            </span>
          </div>
          <div className="font-serif-luxury text-2xl text-rose-950 font-bold">
            {formatRupiah(femaleTotalCounted)}
          </div>
          <div className="flex justify-between text-xs text-rose-900/90 pt-2 border-t border-rose-200">
            <span>
              {femaleEnvelopes.filter((g) => g.envelopeStatus === 'counted').length} Selesai Dihitung
            </span>
            <span className="font-semibold text-rose-800">
              {femaleEnvelopes.filter((g) => g.envelopeStatus === 'pending').length} Belum Dihitung
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar for Envelopes */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-[#f3f4f3] p-3 rounded-xl border border-[#d5c3b8]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-[#1a1c1c]">Status Penghitungan:</span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              statusFilter === 'all'
                ? 'bg-[#8b5e3c] text-white'
                : 'bg-white text-[#51443c] border border-[#d5c3b8]'
            }`}
          >
            Semua ({envelopeGuests.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              statusFilter === 'pending'
                ? 'bg-amber-700 text-white'
                : 'bg-white text-amber-800 border border-amber-300'
            }`}
          >
            Belum Dihitung ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('counted')}
            className={`px-2.5 py-1 rounded-lg font-semibold ${
              statusFilter === 'counted'
                ? 'bg-emerald-700 text-white'
                : 'bg-white text-emerald-800 border border-emerald-300'
            }`}
          >
            Sudah Dihitung ({countedCount})
          </button>
        </div>

        <div className="text-[#51443c]">
          Protokol Kasir: Setiap amplop memiliki nomor seri untuk akuntabilitas keluarga inti.
        </div>
      </div>

      {/* Grid of Envelopes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredEnvelopes.map((guest) => {
          const isPending = guest.envelopeStatus === 'pending';
          const isMale = guest.envelopeBox === 'box_male' || guest.party === 'laki';

          return (
            <div
              key={guest.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isPending
                  ? 'bg-amber-50/40 border-amber-300 shadow-sm'
                  : 'bg-white border-[#d5c3b8] hover:border-[#8b5e3c]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs font-bold bg-[#eeeeed] px-2 py-0.5 rounded text-[#6f4627]">
                    {guest.envelopeCode || 'AMP-AUTO'}
                  </span>
                  <h4 className="font-bold text-sm text-[#1a1c1c] mt-1">{guest.name}</h4>
                  <p className="text-xs text-[#51443c]">{guest.relation || 'Tamu Resepsi'}</p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isMale
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {isMale ? 'Box Pria' : 'Box Wanita'}
                </span>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#eeeeed] flex items-center justify-between">
                <div>
                  {isPending ? (
                    <div className="text-xs font-bold text-amber-800 flex items-center gap-1">
                      <Hourglass className="w-3.5 h-3.5" />
                      <span>Belum Dihitung</span>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-sm text-[#6f4627]">
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                    isPending
                      ? 'bg-[#8b5e3c] text-white hover:bg-[#6f4627] shadow-sm'
                      : 'bg-[#eeeeed] text-[#51443c] hover:bg-[#e2e2e2]'
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

      {/* Counting Dialog / Modal */}
      {activeCountingGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-[#735c00] max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#eeeeed] pb-3">
              <div>
                <h3 className="font-serif-luxury text-lg font-bold text-[#6f4627]">
                  Hitung Nominal Amplop
                </h3>
                <p className="text-xs text-[#51443c]">
                  {activeCountingGuest.envelopeCode} • Tamu: {activeCountingGuest.name}
                </p>
              </div>
              <button
                onClick={() => setActiveCountingGuest(null)}
                className="p-1 text-[#51443c] hover:bg-[#eeeeed] rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveCount} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-[#51443c] mb-1">
                  Masukkan Nominal Uang Fisik (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-[#51443c]">
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
                    className="w-full pl-10 pr-4 py-3 bg-[#f9f9f8] border-2 border-[#8b5e3c] rounded-xl text-lg font-bold text-[#1a1c1c] focus:outline-none focus:ring-2 focus:ring-[#735c00]"
                  />
                </div>
              </div>

              {/* Quick Nominal Suggestions */}
              <div className="space-y-1">
                <span className="text-[11px] text-[#51443c] font-semibold">Pecahan Cepat:</span>
                <div className="grid grid-cols-4 gap-2">
                  {[100000, 200000, 500000, 1000000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setCountingInput(amt.toLocaleString('id-ID'))}
                      className="py-1.5 px-1 bg-[#f3f4f3] hover:bg-amber-100 border border-[#d5c3b8] rounded-lg text-xs font-bold text-[#1a1c1c]"
                    >
                      {amt >= 1000000 ? `${amt / 1000000} Jt` : `${amt / 1000} Rb`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eeeeed]">
                <button
                  type="button"
                  onClick={() => setActiveCountingGuest(null)}
                  className="px-4 py-2 border border-[#d5c3b8] rounded-xl text-xs font-bold text-[#51443c] hover:bg-[#eeeeed]"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8b5e3c] hover:bg-[#6f4627] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5"
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
