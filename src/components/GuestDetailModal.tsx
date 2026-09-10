import React, { useState } from 'react';
import { Guest, PartyType, EnvelopeStatus } from '../types';
import { formatRupiah, parseRupiahInput } from '../utils/formatters';
import { 
  X, 
  User, 
  Gift, 
  Printer, 
  Edit3, 
  Save, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  CreditCard,
  MapPin,
  FileCheck
} from 'lucide-react';

interface GuestDetailModalProps {
  guest: Guest | null;
  mode: 'view' | 'edit';
  onClose: () => void;
  onUpdateGuest: (updated: Guest) => void;
}

export const GuestDetailModal: React.FC<GuestDetailModalProps> = ({
  guest,
  mode: initialMode,
  onClose,
  onUpdateGuest,
}) => {
  if (!guest) return null;

  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [name, setName] = useState(guest.name);
  const [relation, setRelation] = useState(guest.relation);
  const [category, setCategory] = useState(guest.category);
  const [party, setParty] = useState<PartyType>(guest.party);
  const [guestCount, setGuestCount] = useState(guest.guestCount);
  const [hasEnvelope, setHasEnvelope] = useState(guest.hasEnvelope);
  const [envelopeAmount, setEnvelopeAmount] = useState(
    guest.envelopeAmount > 0 ? guest.envelopeAmount.toLocaleString('id-ID') : ''
  );
  const [envelopeStatus, setEnvelopeStatus] = useState<EnvelopeStatus>(guest.envelopeStatus);
  const [souvenirGiven, setSouvenirGiven] = useState(guest.souvenirGiven);
  const [tableNumber, setTableNumber] = useState(guest.tableNumber || '');
  const [phone, setPhone] = useState(guest.phone || '');
  const [notes, setNotes] = useState(guest.notes || '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: Guest = {
      ...guest,
      name: name.trim(),
      relation: relation.trim(),
      category,
      party,
      guestCount,
      hasEnvelope,
      envelopeAmount: hasEnvelope && envelopeStatus === 'counted' ? parseRupiahInput(envelopeAmount) : 0,
      envelopeStatus: hasEnvelope ? envelopeStatus : 'none',
      envelopeBox: hasEnvelope ? (party === 'laki' ? 'box_male' : 'box_female') : undefined,
      souvenirGiven,
      souvenirCount: souvenirGiven ? 1 : 0,
      tableNumber: tableNumber.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    };
    onUpdateGuest(updated);
    setMode('view');
  };

  const handlePrintReceipt = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <html>
        <head>
          <title>Struk Bukti Kehadiran & Souvenir</title>
          <style>
            body { font-family: monospace; width: 280px; padding: 10px; margin: 0 auto; text-align: center; }
            .dashed { border-top: 1px dashed #000; margin: 8px 0; }
            h2 { margin: 4px 0; font-size: 16px; }
            p { margin: 2px 0; font-size: 12px; }
            .left { text-align: left; }
          </style>
        </head>
        <body>
          <h2>BUDI & SITI WEDDING</h2>
          <p>Tanda Terima Souvenir & Meja Tamu</p>
          <div class="dashed"></div>
          <p class="left">Kode: <strong>${guest.id}</strong></p>
          <p class="left">Nama: <strong>${guest.name}</strong></p>
          <p class="left">Pihak: ${guest.party === 'laki' ? 'Keluarga Laki-laki' : 'Keluarga Perempuan'}</p>
          <p class="left">Hadir: ${guest.guestCount} Jiwa</p>
          <p class="left">Meja: ${guest.tableNumber || '-'}</p>
          <div class="dashed"></div>
          <p><strong>[ ${guest.souvenirGiven ? 'SOUVENIR SUDAH DITERIMA' : 'KLAIM SOUVENIR'} ]</strong></p>
          <p>${guest.checkInTime} • ${guest.desk}</p>
          <div class="dashed"></div>
          <p style="font-size: 10px;">Terima kasih atas doa restu & kehadiran Anda</p>
          <script>window.onload = function() { window.print(); };</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border-2 border-[#735c00]/60 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="bg-[#8b5e3c] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-[#fed65b]" />
            <div>
              <h3 className="font-serif-luxury text-lg font-bold">
                {mode === 'edit' ? 'Edit Data Tamu' : 'Kartu Registrasi Tamu'}
              </h3>
              <p className="text-xs text-[#ffe3d1]">
                Kode: <span className="font-mono font-bold text-[#fed65b]">{guest.id}</span> • {guest.checkInTime}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'view' ? (
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Guest Summary Card */}
            <div className="p-4 bg-[#f9f9f8] rounded-xl border border-[#d5c3b8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-[#eeeeed] px-2.5 py-1 rounded text-[#6f4627]">
                  {guest.id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    guest.party === 'laki'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : 'bg-rose-100 text-rose-900 border border-rose-300'
                  }`}
                >
                  {guest.party === 'laki' ? 'Pihak Laki-laki' : 'Pihak Perempuan'}
                </span>
              </div>

              <div>
                <h4 className="font-serif-luxury text-xl font-bold text-[#1a1c1c]">{guest.name}</h4>
                <p className="text-xs text-[#51443c] mt-0.5">{guest.relation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-[#eeeeed]">
                <div>
                  <span className="text-[#51443c]">Jumlah Hadir:</span>
                  <p className="font-bold text-[#1a1c1c]">{guest.guestCount} Orang</p>
                </div>
                <div>
                  <span className="text-[#51443c]">Lokasi Meja:</span>
                  <p className="font-bold text-[#1a1c1c]">{guest.tableNumber || 'Reguler'}</p>
                </div>
              </div>
            </div>

            {/* Amplop Status Box */}
            <div className="p-4 rounded-xl border border-[#d5c3b8] bg-[#f3f4f3] space-y-1 text-xs">
              <span className="font-bold text-[#51443c] uppercase tracking-wider">Status Amplop</span>
              {guest.hasEnvelope ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-[#6f4627]">
                      {guest.envelopeStatus === 'counted'
                        ? formatRupiah(guest.envelopeAmount)
                        : 'Belum Dihitung (Dalam Box)'}
                    </span>
                    <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded text-[#51443c]">
                      {guest.envelopeCode}
                    </span>
                  </div>
                  <p className="text-[#51443c] text-[11px] mt-1">
                    Kotak Simpan: {guest.envelopeBox === 'box_male' ? 'Box Pria' : 'Box Wanita'}
                  </p>
                </div>
              ) : (
                <p className="text-[#51443c] italic">Tamu hadir tanpa amplop (Kado fisik / Ucapan).</p>
              )}
            </div>

            {/* Souvenir Badge */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#d5c3b8] bg-white text-xs">
              <span className="font-bold text-[#1a1c1c] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-[#735c00]" />
                <span>Souvenir Resepsi:</span>
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  guest.souvenirGiven
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {guest.souvenirGiven ? 'Sudah Diserahkan' : 'Belum Diambil'}
              </span>
            </div>

            {/* Officer info */}
            <div className="text-[11px] text-[#51443c] flex items-center justify-between pt-1">
              <span>Dicatat oleh: <strong>{guest.officer}</strong></span>
              <span>Waktu: {guest.checkInTime}</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#eeeeed] flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-3.5 py-2 border border-[#d5c3b8] hover:bg-[#eeeeed] rounded-xl text-xs font-bold text-[#1a1c1c] flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-[#6f4627]" />
                <span>Cetak Slip Souvenir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="px-4 py-2 bg-[#8b5e3c] text-white hover:bg-[#6f4627] rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Ubah Data</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase text-[#51443c]">Nama Tamu</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d5c3b8] rounded-xl text-sm font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#51443c]">Pihak</label>
                <select
                  value={party}
                  onChange={(e) => setParty(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#d5c3b8] rounded-xl text-xs font-semibold"
                >
                  <option value="laki">Pihak Laki-laki</option>
                  <option value="perempuan">Pihak Perempuan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#51443c]">Jumlah Fisik</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3 py-2 bg-white border border-[#d5c3b8] rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#51443c]">Relasi / Jabatan</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#d5c3b8] rounded-xl text-xs"
              />
            </div>

            <div className="p-3 bg-[#f3f4f3] rounded-xl border border-[#d5c3b8] space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1a1c1c]">
                <input
                  type="checkbox"
                  checked={hasEnvelope}
                  onChange={(e) => setHasEnvelope(e.target.checked)}
                  className="rounded text-[#6f4627]"
                />
                <span>Ada Amplop</span>
              </label>

              {hasEnvelope && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#51443c]">Nominal (Rp)</label>
                    <input
                      type="text"
                      value={envelopeAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setEnvelopeAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-[#d5c3b8] rounded-lg text-sm font-bold text-[#6f4627]"
                    />
                  </div>
                  <div className="flex gap-4 text-xs font-semibold">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="editEnvelopeStatus"
                        value="counted"
                        checked={envelopeStatus === 'counted'}
                        onChange={() => setEnvelopeStatus('counted')}
                      />
                      <span>Sudah Dihitung</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="editEnvelopeStatus"
                        value="pending"
                        checked={envelopeStatus === 'pending'}
                        onChange={() => setEnvelopeStatus('pending')}
                      />
                      <span>Belum Dihitung</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-white border border-[#d5c3b8] rounded-xl text-xs">
              <label className="flex items-center gap-2 font-bold cursor-pointer">
                <input
                  type="checkbox"
                  checked={souvenirGiven}
                  onChange={(e) => setSouvenirGiven(e.target.checked)}
                  className="rounded text-[#6f4627]"
                />
                <span>Souvenir Sudah Diberikan</span>
              </label>
            </div>

            <div className="pt-2 border-t border-[#eeeeed] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-4 py-2 border border-[#d5c3b8] text-xs font-bold rounded-xl"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#6f4627] text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
