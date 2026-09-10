import React, { useState } from 'react';
import { Guest } from '../types';
import { 
  QrCode, 
  X, 
  Camera, 
  Scan, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Sparkles
} from 'lucide-react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  guests: Guest[];
  onGuestScanned: (guest: Guest) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  guests,
  onGuestScanned,
}) => {
  const [manualCode, setManualCode] = useState('');
  const [scannedResult, setScannedResult] = useState<Guest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleScanCode = (code: string) => {
    setErrorMsg('');
    const target = guests.find(
      (g) => g.id.toLowerCase() === code.trim().toLowerCase() || g.phone === code.trim()
    );

    if (target) {
      setScannedResult(target);
      onGuestScanned(target);
    } else {
      setErrorMsg(`Kode "${code}" tidak ditemukan dalam daftar undangan resmi.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-[#735c00] max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95">
        {/* Header */}
        <div className="bg-[#8b5e3c] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#fed65b]" />
            <h3 className="font-serif-luxury text-lg font-bold">Scanner QR & Barcode Tamu</h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Simulated Camera Viewfinder */}
          <div className="relative w-full aspect-video bg-[#1a1c1c] rounded-xl overflow-hidden flex flex-col items-center justify-center border-2 border-[#d5c3b8]">
            <div className="absolute inset-4 border-2 border-dashed border-[#fed65b]/60 rounded-lg flex items-center justify-center pointer-events-none">
              <div className="w-full h-0.5 bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse"></div>
            </div>

            <Camera className="w-8 h-8 text-[#83746b] mb-2" />
            <p className="text-xs text-white/70 font-semibold px-4 text-center">
              Arahkan QR Code dari Undangan Digital / Fisik Tamu
            </p>
            <p className="text-[10px] text-white/50 mt-1">
              Kamera siap siaga • Kompatibel Scanner Barcode USB / Bluetooth
            </p>
          </div>

          {/* Quick Simulation Clickers */}
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-[#51443c] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#735c00]" />
              <span>Simulasi Scan QR Undangan Tamu:</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {guests.slice(0, 4).map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => handleScanCode(g.id)}
                  className="px-2.5 py-1.5 bg-[#f3f4f3] hover:bg-amber-100 border border-[#d5c3b8] rounded-lg text-xs font-semibold text-[#1a1c1c] flex items-center gap-1.5 transition-all"
                >
                  <Scan className="w-3.5 h-3.5 text-[#6f4627]" />
                  <span>{g.id} ({g.name.split(' ')[0]})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Manual Code Input */}
          <div className="space-y-1 pt-2 border-t border-[#eeeeed]">
            <label className="block text-xs font-bold uppercase text-[#51443c]">
              Atau Ketik Kode Undangan Manual:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="Misal: BT-0526"
                className="flex-1 px-3 py-2 bg-white border border-[#d5c3b8] rounded-xl text-sm font-mono uppercase focus:border-[#735c00] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleScanCode(manualCode)}
                className="px-4 py-2 bg-[#6f4627] text-white rounded-xl text-xs font-bold hover:bg-[#8b5e3c]"
              >
                Cek Kode
              </button>
            </div>
          </div>

          {/* Error notice */}
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success Result */}
          {scannedResult && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-1 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Undangan Terverifikasi!</span>
                </span>
                <span className="font-mono text-xs font-bold text-emerald-900">{scannedResult.id}</span>
              </div>
              <p className="font-bold text-sm text-[#1a1c1c]">{scannedResult.name}</p>
              <p className="text-xs text-[#51443c]">{scannedResult.relation} • {scannedResult.guestCount} orang</p>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-[#d5c3b8] rounded-xl text-xs font-bold text-[#51443c] hover:bg-[#eeeeed]"
            >
              Tutup Scanner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
