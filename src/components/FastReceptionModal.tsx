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
    <div className="fixed inset-0 z-50 bg-[#2f3130]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border-2 border-[#735c00]/50 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header */}
        <div className="bg-[#8b5e3c] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg md:text-xl font-bold leading-tight">
                Input Tamu Cepat (Mode Resepsi)
              </h3>
              <p className="text-xs text-[#ffe3d1]">
                Kode Tamu Baru: <span className="font-mono font-bold text-[#fed65b]">{nextCode}</span> • {currentDesk}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Touch-friendly Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* 1. Pilihan Pihak Mempelai */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#51443c]">
              1. Pihak Mempelai <span className="text-red-600">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setParty('laki')}
                className={`h-12 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  party === 'laki'
                    ? 'border-[#6f4627] bg-[#6f4627] text-white'
                    : 'border-[#d5c3b8] bg-[#f3f4f3] text-[#1a1c1c] hover:border-[#6f4627]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>LAKI-LAKI</span>
              </button>
              <button
                type="button"
                onClick={() => setParty('perempuan')}
                className={`h-12 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xs ${
                  party === 'perempuan'
                    ? 'border-[#735c00] bg-[#735c00] text-white'
                    : 'border-[#d5c3b8] bg-[#f3f4f3] text-[#1a1c1c] hover:border-[#735c00]'
                }`}
              >
                <User className="w-4 h-4" />
                <span>PEREMPUAN</span>
              </button>
            </div>
          </div>

          {/* 2. Nama Tamu Input */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#51443c]">
                2. Nama Tamu / Rombongan <span className="text-red-600">*</span>
              </label>
              <span className="text-[11px] text-[#51443c]">Contoh: Bapak Irwan & Istri</span>
            </div>
            <input
              ref={nameInputRef}
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ketik nama tamu di sini..."
              className="w-full h-12 px-4 text-sm md:text-base font-semibold bg-white border-2 border-[#d5c3b8] rounded-xl focus:border-[#735c00] focus:ring-1 focus:ring-[#735c00] text-[#1a1c1c]"
            />
          </div>

          {/* Kategori & Relasi (Opsional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#51443c]">Kategori Tamu</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-11 px-3 text-xs font-semibold bg-white border border-[#d5c3b8] rounded-xl focus:border-[#735c00]"
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
              <label className="block text-xs font-semibold text-[#51443c]">Keterangan Relasi / Meja</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                placeholder="Misal: Meja VIP 03, Teman SMA"
                className="w-full h-11 px-3 text-xs bg-white border border-[#d5c3b8] rounded-xl focus:border-[#735c00]"
              />
            </div>
          </div>

          {/* 3. Stepper Jumlah Orang Hadir */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#51443c]">
              3. Jumlah Orang Hadir Secara Fisik
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border-2 border-[#d5c3b8] rounded-xl bg-white p-1">
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => Math.max(1, c - 1))}
                  className="w-10 h-10 rounded-lg bg-[#e8e8e7] hover:bg-[#dadad9] text-[#1a1c1c] flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-16 text-center font-bold text-lg text-[#6f4627]">
                  {guestCount}
                </span>
                <button
                  type="button"
                  onClick={() => setGuestCount((c) => c + 1)}
                  className="w-10 h-10 rounded-lg bg-[#e8e8e7] hover:bg-[#dadad9] text-[#1a1c1c] flex items-center justify-center font-bold text-lg active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-xs text-[#51443c] font-medium">
                Jiwa yang hadir saat ini di resepsi
              </span>
            </div>
          </div>

          {/* 4. Amplop Toggle YA / TIDAK */}
          <div className="space-y-2 pt-2 border-t border-[#d5c3b8]/60">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#51443c]">
              4. Menyerahkan Amplop / Tanda Kasih?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHasEnvelope(true)}
                className={`h-11 border-2 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs transition-all ${
                  hasEnvelope
                    ? 'border-[#735c00] bg-[#fed65b] text-[#745c00]'
                    : 'border-[#d5c3b8] bg-[#f3f4f3] text-[#51443c]'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>YA (Ada Amplop)</span>
              </button>
              <button
                type="button"
                onClick={() => setHasEnvelope(false)}
                className={`h-11 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                  !hasEnvelope
                    ? 'border-[#6f4627] bg-[#6f4627] text-white'
                    : 'border-[#d5c3b8] bg-[#f3f4f3] text-[#51443c]'
                }`}
              >
                <X className="w-4 h-4" />
                <span>TIDAK (Kado Fisik/Hadir Saja)</span>
              </button>
            </div>
          </div>

          {/* Sub-panel Amplop */}
          {hasEnvelope && (
            <div className="p-4 rounded-xl bg-[#f3f4f3] border border-[#d5c3b8] space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6f4627] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Rincian Kotak Amplop</span>
                </span>
                <span className="text-[11px] font-mono font-bold bg-[#eeeeed] px-2 py-0.5 rounded text-[#51443c]">
                  Kotak: {party === 'laki' ? 'Box Pria' : 'Box Wanita'} • Seri: {nextEnvelopeCode}
                </span>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#1a1c1c]">
                  Nominal Uang (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs text-[#51443c]">
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
                    className="w-full h-11 pl-9 pr-3 text-sm font-semibold bg-white border border-[#d5c3b8] rounded-lg focus:border-[#735c00] focus:ring-0"
                  />
                </div>
              </div>

              {/* Status Radio */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-semibold text-[#1a1c1c]">
                  Status Verifikasi Amplop:
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="envelopeStatus"
                      value="counted"
                      checked={envelopeStatus === 'counted'}
                      onChange={() => setEnvelopeStatus('counted')}
                      className="text-[#6f4627] focus:ring-[#735c00]"
                    />
                    <span>Sudah Dihitung (Nominal Pasti)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                    <input
                      type="radio"
                      name="envelopeStatus"
                      value="pending"
                      checked={envelopeStatus === 'pending'}
                      onChange={() => setEnvelopeStatus('pending')}
                      className="text-[#6f4627] focus:ring-[#735c00]"
                    />
                    <span>Belum Dihitung (Masuk Box Tertutup)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* 5. Souvenir Handover Checkbox */}
          <div className="flex items-center justify-between p-3 bg-[#f9f9f8] rounded-xl border border-[#d5c3b8]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={souvenirGiven}
                onChange={(e) => setSouvenirGiven(e.target.checked)}
                className="w-4 h-4 rounded text-[#6f4627] focus:ring-[#735c00]"
              />
              <span className="text-xs font-bold text-[#1a1c1c]">
                Serahkan Tanda Terima Souvenir Resepsi
              </span>
            </label>
            <Gift className="w-4 h-4 text-[#735c00]" />
          </div>

          {/* Tombol Aksi Bawah */}
          <div className="pt-3 border-t border-[#d5c3b8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 h-12 border-2 border-[#d5c3b8] text-[#1a1c1c] font-semibold rounded-xl hover:bg-[#eeeeed] transition-all text-sm"
            >
              BATAL
            </button>
            <button
              type="submit"
              className="flex-1 sm:flex-none px-6 h-12 bg-[#6f4627] hover:bg-[#8b5e3c] text-white font-bold rounded-xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
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
