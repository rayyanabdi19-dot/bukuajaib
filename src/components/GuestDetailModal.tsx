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
    <div className="fixed inset-0 z-50 bg-[#1e1b4b]/40 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="glass-panel bg-white/95 rounded-2xl border border-white/90 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 via-orange-600 to-purple-600 px-6 py-4 text-white flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-xs shadow-2xs">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-serif-luxury text-lg font-bold">
                {mode === 'edit' ? 'Edit Data Tamu' : 'Kartu Registrasi Tamu'}
              </h3>
              <p className="text-xs text-orange-100">
                Kode: <span className="font-mono font-bold text-white bg-white/20 px-1.5 py-0.5 rounded-md">{guest.id}</span> • {guest.checkInTime}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'view' ? (
          <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
            {/* Guest Summary Card */}
            <div className="p-4 rounded-2xl border border-purple-100 space-y-2 bg-purple-50/40 glass-card">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold bg-white/90 px-2.5 py-1 rounded-md text-purple-950 border border-purple-200/80 shadow-2xs">
                  {guest.id}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    guest.party === 'laki'
                      ? 'bg-orange-100 text-orange-950 border border-orange-300'
                      : 'bg-purple-100 text-purple-950 border border-purple-300'
                  }`}
                >
                  {guest.party === 'laki' ? 'Pihak Laki-laki' : 'Pihak Perempuan'}
                </span>
              </div>

              <div>
                <h4 className="font-serif-luxury text-xl font-bold text-[#1e1b4b]">{guest.name}</h4>
                <p className="text-xs text-gray-600 mt-0.5">{guest.relation}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-purple-100/70">
                <div>
                  <span className="text-gray-500">Jumlah Hadir:</span>
                  <p className="font-bold text-[#1e1b4b]">{guest.guestCount} Orang</p>
                </div>
                <div>
                  <span className="text-gray-500">Lokasi Meja:</span>
                  <p className="font-bold text-[#1e1b4b]">{guest.tableNumber || 'Reguler'}</p>
                </div>
              </div>
            </div>

            {/* Amplop Status Box */}
            <div className="p-4 rounded-2xl border border-purple-100/80 bg-white/80 space-y-1 text-xs shadow-2xs">
              <span className="font-bold text-purple-950 uppercase tracking-wider text-[11px]">Status Amplop</span>
              {guest.hasEnvelope ? (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-orange-950">
                      {guest.envelopeStatus === 'counted'
                        ? formatRupiah(guest.envelopeAmount)
                        : 'Belum Dihitung (Dalam Box)'}
                    </span>
                    <span className="font-mono text-[11px] bg-purple-50 px-2 py-0.5 rounded-md text-purple-950 border border-purple-200/70">
                      {guest.envelopeCode}
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-1">
                    Kotak Simpan: {guest.envelopeBox === 'box_male' ? 'Box Pria' : 'Box Wanita'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Tamu hadir tanpa amplop (Kado fisik / Ucapan).</p>
              )}
            </div>

            {/* Souvenir Badge */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl border border-purple-100/80 bg-white/80 text-xs shadow-2xs">
              <span className="font-bold text-[#1e1b4b] flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-orange-500" />
                <span>Souvenir Resepsi:</span>
              </span>
              <span
                className={`font-semibold px-2.5 py-0.5 rounded-full ${
                  guest.souvenirGiven
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-orange-50 text-orange-900 border border-orange-200'
                }`}
              >
                {guest.souvenirGiven ? 'Sudah Diserahkan' : 'Belum Diambil'}
              </span>
            </div>

            {/* Officer info */}
            <div className="text-[11px] text-gray-500 flex items-center justify-between pt-1">
              <span>Dicatat oleh: <strong className="text-purple-950">{guest.officer}</strong></span>
              <span>Waktu: {guest.checkInTime}</span>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-purple-100/70 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handlePrintReceipt}
                className="px-3.5 py-2 border border-purple-200/80 hover:bg-purple-50 rounded-xl text-xs font-bold text-purple-950 flex items-center gap-1.5 shadow-2xs"
              >
                <Printer className="w-4 h-4 text-purple-600" />
                <span>Cetak Slip Souvenir</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className="px-4 py-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
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
              <label className="block text-xs font-bold uppercase text-purple-950">Nama Tamu</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-purple-200/80 rounded-xl text-sm font-semibold text-[#1e1b4b] focus:border-purple-500 shadow-2xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-purple-950">Pihak</label>
                <select
                  value={party}
                  onChange={(e) => setParty(e.target.value as any)}
                  className="w-full px-3.5 py-2 bg-white border border-purple-200/80 rounded-xl text-xs font-semibold text-purple-950 focus:border-purple-500"
                >
                  <option value="laki">Pihak Laki-laki</option>
                  <option value="perempuan">Pihak Perempuan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-purple-950">Jumlah Fisik</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value, 10) || 1)}
                  className="w-full px-3.5 py-2 bg-white border border-purple-200/80 rounded-xl text-sm font-bold text-purple-950 focus:border-purple-500 shadow-2xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-purple-950">Relasi / Jabatan</label>
              <input
                type="text"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                className="w-full px-3.5 py-2 bg-white border border-purple-200/80 rounded-xl text-xs text-purple-950 focus:border-purple-500"
              />
            </div>

            <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 space-y-2.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-purple-950">
                <input
                  type="checkbox"
                  checked={hasEnvelope}
                  onChange={(e) => setHasEnvelope(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-400"
                />
                <span>Ada Amplop</span>
              </label>

              {hasEnvelope && (
                <div className="space-y-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-semibold text-purple-950">Nominal (Rp)</label>
                    <input
                      type="text"
                      value={envelopeAmount}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setEnvelopeAmount(val ? parseInt(val, 10).toLocaleString('id-ID') : '');
                      }}
                      className="w-full px-3.5 py-2 bg-white border border-purple-200/80 rounded-xl text-sm font-bold text-orange-950 focus:border-purple-500 shadow-2xs"
                    />
                  </div>
                  <div className="flex gap-4 text-xs font-semibold text-purple-950">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="editEnvelopeStatus"
                        value="counted"
                        checked={envelopeStatus === 'counted'}
                        onChange={() => setEnvelopeStatus('counted')}
                        className="text-purple-600 focus:ring-purple-400"
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
                        className="text-purple-600 focus:ring-purple-400"
                      />
                      <span>Belum Dihitung</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-3.5 bg-white/90 border border-purple-200/80 rounded-2xl text-xs shadow-2xs">
              <label className="flex items-center gap-2 font-bold cursor-pointer text-purple-950">
                <input
                  type="checkbox"
                  checked={souvenirGiven}
                  onChange={(e) => setSouvenirGiven(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-400"
                />
                <span>Souvenir Sudah Diberikan</span>
              </label>
            </div>

            <div className="pt-2 border-t border-purple-100/70 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setMode('view')}
                className="px-4 py-2 border border-purple-200/80 text-xs font-bold rounded-xl text-gray-600 hover:bg-purple-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-orange-500 to-purple-600 hover:from-orange-600 hover:to-purple-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md"
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
