import React, { useState } from 'react';
import { WeddingEventInfo } from '../types';
import { X, Calendar, Clock, MapPin, Users, Gift, Sparkles, Heart, Check, Save } from 'lucide-react';

interface EventSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventInfo: WeddingEventInfo;
  onSave: (updated: WeddingEventInfo) => Promise<void> | void;
}

export const EventSettingsModal: React.FC<EventSettingsModalProps> = ({
  isOpen,
  onClose,
  eventInfo,
  onSave,
}) => {
  const [formData, setFormData] = useState<WeddingEventInfo>({ ...eventInfo });
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({ ...eventInfo });
      setSavedSuccess(false);
    }
  }, [isOpen, eventInfo]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(formData);
      setSavedSuccess(true);
      setTimeout(() => {
        setIsSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#d5c3b8] overflow-hidden"
        id="modal-pengaturan-acara"
      >
        {/* Modal Header */}
        <div className="p-5 border-b border-[#e6ded8] flex items-center justify-between bg-gradient-to-r from-[#fdfbf9] to-[#f7f2ee]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8c7355]/10 text-[#8c7355] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-[#1a1c1c]">Pengaturan Acara & Nama Pengantin</h2>
              <p className="text-xs text-[#7d7571]">
                Sesuaikan nama mempelai, jadwal acara, dan lokasi. Data tersinkron otomatis ke seluruh perangkat Anda.
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6">
          {/* Section: Nama Mempelai */}
          <div className="bg-[#faf7f4] p-4 rounded-xl border border-[#ede4dc] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8c7355]">
              <Heart className="w-4 h-4 fill-[#8c7355]/20 text-[#8c7355]" />
              <span>Identitas Kedua Mempelai</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Nama Mempelai Pria (Groom) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.groomName}
                  onChange={(e) => {
                    const groom = e.target.value;
                    setFormData({
                      ...formData,
                      groomName: groom,
                      coupleTitle: `${groom} & ${formData.brideName} Wedding`,
                    });
                  }}
                  placeholder="Contoh: Budi Pratama, S.T."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Nama Mempelai Wanita (Bride) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.brideName}
                  onChange={(e) => {
                    const bride = e.target.value;
                    setFormData({
                      ...formData,
                      brideName: bride,
                      coupleTitle: `${formData.groomName} & ${bride} Wedding`,
                    });
                  }}
                  placeholder="Contoh: Siti Nurhaliza, S.E."
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Judul Singkat Acara (Ditampilkan pada Header)
                </label>
                <input
                  type="text"
                  value={formData.coupleTitle}
                  onChange={(e) => setFormData({ ...formData, coupleTitle: e.target.value })}
                  placeholder="Contoh: Budi & Siti Wedding"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Judul Lengkap / Kop Cetak Berita Acara
                </label>
                <input
                  type="text"
                  value={formData.fullTitle}
                  onChange={(e) => setFormData({ ...formData, fullTitle: e.target.value })}
                  placeholder="Contoh: RESEPSI PERNIKAHAN — BUDI & SITI"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                />
              </div>
            </div>
          </div>

          {/* Section: Tanggal & Waktu */}
          <div className="bg-white p-4 rounded-xl border border-[#ede4dc] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8c7355]">
              <Calendar className="w-4 h-4 text-[#8c7355]" />
              <span>Jadwal & Waktu Acara</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Hari & Tanggal Resepsi *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.dateStr}
                    onChange={(e) => setFormData({ ...formData, dateStr: e.target.value })}
                    placeholder="Contoh: Minggu, 20 September 2026"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                  />
                  <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Jam / Waktu Operasional Resepsi *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.timeStr}
                    onChange={(e) => setFormData({ ...formData, timeStr: e.target.value })}
                    placeholder="Contoh: 10:00 - 21:00 WIB"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                  />
                  <Clock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Lokasi & Gedung */}
          <div className="bg-[#faf7f4] p-4 rounded-xl border border-[#ede4dc] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8c7355]">
              <MapPin className="w-4 h-4 text-[#8c7355]" />
              <span>Lokasi & Ruangan Gedung</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Nama Gedung / Tempat Acara
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Contoh: Gedung Serbaguna Jakarta"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Ruangan / Ballroom
                </label>
                <input
                  type="text"
                  value={formData.hall}
                  onChange={(e) => setFormData({ ...formData, hall: e.target.value })}
                  placeholder="Contoh: Grand Ballroom Lantai 2"
                  className="w-full px-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                />
              </div>
            </div>
          </div>

          {/* Section: Target Kuota & Souvenir */}
          <div className="bg-white p-4 rounded-xl border border-[#ede4dc] space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#8c7355]">
              <Users className="w-4 h-4 text-[#8c7355]" />
              <span>Target Undangan & Stok Bingkisan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Target Total Undangan (Orang)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.targetGuests}
                    onChange={(e) => setFormData({ ...formData, targetGuests: parseInt(e.target.value, 10) || 0 })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                  />
                  <Users className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4e453e] mb-1">
                  Total Stok Souvenir
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.souvenirStock}
                    onChange={(e) => setFormData({ ...formData, souvenirStock: parseInt(e.target.value, 10) || 0 })}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-[#d5c3b8] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8c7355]/30 focus:border-[#8c7355]"
                  />
                  <Gift className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className={`px-5 py-2 text-sm font-semibold rounded-lg text-white shadow-md flex items-center gap-2 transition-all ${
                savedSuccess
                  ? 'bg-emerald-600'
                  : 'bg-[#8c7355] hover:bg-[#796347]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Tersimpan & Tersinkron!</span>
                </>
              ) : isSaving ? (
                <span>Menyimpan...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
