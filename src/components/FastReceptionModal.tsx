import React, { useState, useEffect, useRef } from 'react';
import { PartyType, EnvelopeStatus, Guest } from '../types';
import { formatRupiah, parseRupiahInput, getCurrentTimeWIB } from '../utils/formatters';
import { 
  UserPlus, 
  X, 
  User, 
  Gift, 
  Check, 
  Save, 
  Sparkles, 
  DollarSign, 
  Minus, 
  Plus, 
  Mail,
  CheckCircle2
} from 'lucide-react';

interface FastReceptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  nextGuestNumber: number;
  currentDesk: string;
  onSaveGuest: (newGuestData: Omit<Guest, 'id' | 'numericId' | 'checkInTime' | 'checkInDate'>) => void;
}

export const FastReceptionModal: React.FC<FastReceptionModalProps> = ({
  isOpen,
  onClose,
  nextGuestNumber,
  currentDesk,
  onSaveGuest,
}) => {
  const [party, setParty] = useState<PartyType>('laki');
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [category, setCategory] = useState<'VIP' | 'Keluarga' | 'Rekan Kerja' | 'Teman Sekolah' | 'Komunitas' | 'Umum'>('Umum');
  const [guestCount, setGuestCount] = useState(1);
  const [hasEnvelope, setHasEnvelope] = useState(true);
  const [envelopeAmount, setEnvelopeAmount] = useState('');
  const [envelopeStatus, setEnvelopeStatus] = useState<EnvelopeStatus>('counted');
  const [souvenirGiven, setSouvenirGiven] = useState(true);
  const [tableNumber, setTableNumber] = useState('');

  const nameInputRef = useRef<HTMLInputElement>(null);

  const nextCode = `BT-0${nextGuestNumber}`;
  const nextEnvelopeCode = `AMP-0${nextGuestNumber - 28}`;

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const amountNum = hasEnvelope && envelopeStatus === 'counted' ? parseRupiahInput(envelopeAmount) : 0;

    onSaveGuest({
      name: name.trim(),
      relation: relation.trim() || (category === 'VIP' ? 'Tamu Kehormatan VIP' : 'Tamu Undangan Resepsi'),
      category,
      party,
      guestCount,
      desk: currentDesk,
      officer: currentDesk,
      hasEnvelope,
      envelopeCode: hasEnvelope ? nextEnvelopeCode : undefined,
      envelopeAmount: amountNum,
      envelopeStatus: hasEnvelope ? envelopeStatus : 'none',
      envelopeBox: hasEnvelope ? (party === 'laki' ? 'box_male' : 'box_female') : undefined,
      souvenirGiven,
      souvenirCount: souvenirGiven ? 1 : 0,
      tableNumber: tableNumber.trim() || undefined,
    });

    // Reset form for rapid continuous queue entry
    setName('');
    setRelation('');
    setCategory('Umum');
    setGuestCount(1);
    setHasEnvelope(true);
    setEnvelopeAmount('');
    setEnvelopeStatus('counted');
    setSouvenirGiven(true);
    setTableNumber('');
    nameInputRef.current?.focus();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1b4b]/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="glass-panel bg-white/95 border border-white/90 rounded-t-3xl sm:rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-200 my-0 sm:my-auto max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 px-4 sm:px-6 py-3.5 sm:py-4.5 text-white flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-2xs shrink-0">
              <UserPlus className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif-luxury text-base sm:text-lg md:text-xl font-bold leading-tight truncate">
                Input Tamu Cepat (Mode Resepsi)
              </h3>
              <p className="text-xs text-orange-100 truncate">
                Kode: <span className="font-mono font-bold text-white bg-white/20 px-1.5 py-0.5 rounded-md">{nextCode}</span> • {currentDesk}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Touch-friendly Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* 1. Pilihan Pihak Mempelai */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950">
              1. Pihak Mempelai <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setParty('laki')}
                className={`h-11 sm:h-12 border-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-2xs text-xs sm:text-sm cursor-pointer ${
                  party === 'laki'
                    ? 'border-orange-500 bg-orange-500 text-white shadow-sm'
                    : 'border-purple-200/80 bg-white/85 text-[#1e1b4b] hover:border-orange-300'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>LAKI-LAKI</span>
              </button>
              <button
                type="button"
                onClick={() => setParty('perempuan')}
                className={`h-11 sm:h-12 border-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-2xs text-xs sm:text-sm cursor-pointer ${
                  party === 'perempuan'
                    ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                    : 'border-purple-200/80 bg-white/85 text-[#1e1b4b] hover:border-purple-300'
                }`}
              >
                <User className="w-4 h-4 shrink-0" />
                <span>PEREMPUAN</span>
              </button>
            </div>
          </div>

          {/* 2. Nama Tamu Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-purple-950">
                2. Nama Tamu / Rombongan <span className="text-red-500">*</span>
              </label>
              <span className="text-[11px] text-gray-500">Contoh: Bapak Irwan & Istri</span>
            </div>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ketik nama tamu di sini..."
              className="w-full h-12 px-4 text-sm md:text-base font-semibold bg-white/90 border-2 border-purple-200/80 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-200 text-[#1e1b4b] shadow-2xs"
            />
          </div>

          {/* Kategori & Relasi (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-purple-950">Kategori Tamu</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-11 px-3 text-xs font-semibold bg-white border border-purple-200/80 rounded-xl focus:border-purple-500 text-purple-950"
              >
                <option value="Umum">Umum / Teman</option>
                <option value="VIP">VIP (Pejabat / Tokoh)</option>
                <option value="Keluarga">Keluarga Besar</option>
                <option value="Rekan Kerja">Rekan Kerja Kantor</option>
                <option value="Teman Sekolah">Alumni / Teman Sekolah</option>
                <option value="Komunitas">Komunitas / Hobi</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-purple-950">Keterangan Relasi / Meja</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Misal: Meja VIP 03, Teman SMA"
                className="w-full h-11 px-3 text-xs bg-white border border-purple-200/80 rounded-xl focus:border-purple-500 text-purple-950"
              />
            </div>
          </div>

          {/* 3. Stepper Jumlah Orang Hadir */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950">
              3. Jumlah Orang Hadir Secara Fisik
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-purple-200/80 rounded-xl bg-white p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                  className="w-10 h-10 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-bold text-lg text-purple-950">
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => c + 1)}
                  className="w-10 h-10 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-950 flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                Jiwa yang hadir saat ini di resepsi
              </span>
            </div>
          </div>

          {/* 4. Amplop Toggle YA / TIDAK */}
          <div className="space-y-2 pt-2 border-t border-purple-100/80">
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-950">
              4. Menyerahkan Amplop / Tanda Kasih?
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => setHasEnvelope(true)}
                className={`h-11 border-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs transition-all text-xs sm:text-sm cursor-pointer ${
                  hasEnvelope
                    ? 'border-orange-500 bg-orange-50 text-orange-950 ring-1 ring-orange-400'
                    : 'border-purple-200/80 bg-white/80 text-gray-600 hover:border-purple-300'
                }`}
              >
                <Mail className="w-4 h-4 shrink-0 text-orange-600" />
                <span className="truncate">Ada Amplop</span>
              </button>
              <button
                type="button"
                onClick={() => setHasEnvelope(false)}
                className={`h-11 border-2 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all shadow-2xs text-xs sm:text-sm cursor-pointer ${
                  !hasEnvelope
                    ? 'border-purple-500 bg-purple-50 text-purple-950 ring-1 ring-purple-400'
                    : 'border-purple-200/80 bg-white/80 text-gray-600 hover:border-purple-300'
                }`}
              >
                <X className="w-4 h-4 shrink-0 text-purple-600" />
                <span className="truncate">Tanpa Amplop</span>
              </button>
            </div>
          </div>

          {/* Sub-panel Amplop */}
          {hasEnvelope && (
            <div className="p-4 rounded-2xl bg-purple-50/50 border border-purple-100 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-600" />
                  <span>Rincian Kotak Amplop</span>
                </span>
                <span className="text-[11px] font-mono font-bold bg-white/90 px-2 py-0.5 rounded-md text-purple-950 border border-purple-200/70 shadow-2xs">
                  Kotak: {party === 'laki' ? 'Box Pria' : 'Box Wanita'} • Seri: {nextEnvelopeCode}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-purple-950">
                  Nominal Uang (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-purple-800">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={envelopeAmount}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setEnvelopeAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                    }}
                    placeholder="Contoh: 500.000 (Kosongkan jika dihitung belakangan)"
                    className="w-full h-11 pl-9 pr-3 text-sm font-semibold bg-white border border-purple-200/80 rounded-xl focus:border-purple-500 focus:ring-0 text-[#1e1b4b]"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-purple-950">
                  Status Verifikasi Amplop:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-purple-950">
                    <input
                      type="radio"
                      name="envelopeStatus"
                      value="counted"
                      checked={envelopeStatus === 'counted'}
                      onChange={() => setEnvelopeStatus('counted')}
                      className="text-purple-600 focus:ring-purple-400"
                    />
                    <span>Sudah Dihitung (Nominal Pasti)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-purple-950">
                    <input
                      type="radio"
                      name="envelopeStatus"
                      value="pending"
                      checked={envelopeStatus === 'pending'}
                      onChange={() => setEnvelopeStatus('pending')}
                      className="text-purple-600 focus:ring-purple-400"
                    />
                    <span>Belum Dihitung (Masuk Box Tertutup)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 5. Souvenir Handover Checkbox */}
          <div className="flex items-center justify-between p-3.5 bg-white/80 rounded-2xl border border-purple-200/80 shadow-2xs">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={souvenirGiven}
                onChange={(e) => setSouvenirGiven(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-400"
              />
              <span className="text-xs font-bold text-[#1e1b4b]">
                Serahkan Tanda Terima Souvenir Resepsi
              </span>
            </label>
            <Gift className="w-4 h-4 text-orange-500" />
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="pt-3 border-t border-purple-100/80 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-12 border border-purple-200/80 text-purple-950 font-semibold rounded-xl hover:bg-purple-50 transition-all text-sm"
            >
              BATAL
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 h-12 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
            >
              <Save className="w-5 h-5" />
              <span>SIMPAN & BERIKUTNYA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
