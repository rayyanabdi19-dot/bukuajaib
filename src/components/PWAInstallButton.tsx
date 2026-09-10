import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'header' | 'drawer' | 'banner';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  // If running in standalone PWA, suppress the install prompt button
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 3000);
    }
  };

  if (!isInstallable && !isIOS) {
    // Neither beforeinstallprompt fired nor iOS device detected
    return null;
  }

  if (variant === 'drawer') {
    return (
      <>
        {isInstallable && (
          <button
            type="button"
            onClick={handleInstallClick}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#6f4627] to-[#8b5e3c] text-white text-xs font-bold shadow-xs hover:opacity-95 transition-all"
            title="Pasang Buku Ajaib sebagai Aplikasi Desktop/HP"
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span>Install Aplikasi (PWA Offline)</span>
            </div>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Instan</span>
          </button>
        )}

        {isIOS && (
          <button
            type="button"
            onClick={() => setShowIOSGuide(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[#faf6f2] border border-[#d5c3b8] text-[#6f4627] text-xs font-bold hover:bg-[#ede5df] transition-all"
          >
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#8b5e3c]" />
              <span>Pasang di iPhone / iPad</span>
            </div>
            <span className="text-[10px] text-[#8c7355]">Panduan</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#d5c3b8] text-[#1a1c1c]">
              <div className="flex items-center justify-between pb-3 border-b border-[#eeeeed]">
                <h3 className="font-serif-luxury font-bold text-base text-[#6f4627] flex items-center gap-2">
                  <Smartphone className="w-5 h-5" /> Pasang di iOS Safari
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-[#51443c] hover:bg-[#faf6f2]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-[#51443c]">
                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#faf6f2] border border-[#d5c3b8] flex items-center justify-center text-[#6f4627] font-bold shrink-0 text-[11px]">
                    1
                  </div>
                  <div>
                    Buka peramban <strong>Safari</strong> dan ketuk ikon{' '}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                      <Share2 className="w-3 h-3 inline" /> Bagikan (Share)
                    </span>{' '}
                    di bilah navigasi bawah Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#faf6f2] border border-[#d5c3b8] flex items-center justify-center text-[#6f4627] font-bold shrink-0 text-[11px]">
                    2
                  </div>
                  <div>
                    Gulir ke bawah menu lalu pilih{' '}
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold">
                      <PlusSquare className="w-3 h-3 inline" /> Tambah ke Layar Utama (Add to Home Screen)
                    </span>.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-[#faf6f2] border border-[#d5c3b8] flex items-center justify-center text-[#6f4627] font-bold shrink-0 text-[11px]">
                    3
                  </div>
                  <div>
                    Ketuk <strong>Tambah (Add)</strong> di pojok kanan atas. Buku Ajaib kini siap dibuka secara offline dari layar utama iPhone/iPad Anda!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-xl bg-[#6f4627] text-white text-xs font-bold hover:bg-[#8b5e3c] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Header variant
  return (
    <>
      {isInstallable && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#faf6f2] hover:bg-[#ede5df] text-[#6f4627] border border-[#d5c3b8] rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 shrink-0"
          title="Pasang aplikasi ke desktop/HP untuk akses offline super cepat"
        >
          {installedSuccess ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Terpasang!</span>
            </>
          ) : (
            <>
              <Download className="w-3.5 h-3.5 text-[#8b5e3c]" />
              <span className="hidden md:inline">Install </span>
              <span>Aplikasi</span>
            </>
          )}
        </button>
      )}

      {isIOS && (
        <button
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#faf6f2] hover:bg-[#ede5df] text-[#6f4627] border border-[#d5c3b8] rounded-xl text-xs font-semibold shadow-2xs transition-all active:scale-95 shrink-0"
          title="Petunjuk pasang di iOS Safari"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#8b5e3c]" />
          <span>Install iOS</span>
        </button>
      )}

      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-[#d5c3b8] text-[#1a1c1c]">
            <div className="flex items-center justify-between pb-3 border-b border-[#eeeeed]">
              <h3 className="font-serif-luxury font-bold text-base text-[#6f4627] flex items-center gap-2">
                <Smartphone className="w-5 h-5" /> Pasang di iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-[#51443c] hover:bg-[#faf6f2]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-[#51443c]">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#faf6f2] border border-[#d5c3b8] flex items-center justify-center text-[#6f4627] font-bold shrink-0 text-[11px]">
                  1
                </div>
                <div>
                  Buka peramban <strong>Safari</strong> dan ketuk tombol{' '}
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">
                    <Share2 className="w-3 h-3 inline" /> Bagikan (Share)
                  </span>{' '}
                  di bilah menu Safari.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#faf6f2] border border-[#d5c3b8] flex items-center justify-center text-[#6f4627] font-bold shrink-0 text-[11px]">
                  2
                </div>
                <div>
                  Pilih menu{' '}
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 font-semibold">
                    <PlusSquare className="w-3 h-3 inline" /> Tambah ke Layar Utama
                  </span>.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#faf6f2] border border-[#d5c3b8] flex items-center justify-center text-[#6f4627] font-bold shrink-0 text-[11px]">
                  3
                </div>
                <div>
                  Ketuk <strong>Tambah</strong> di pojok kanan atas. Buku Ajaib kini siap dibuka langsung dari Home Screen tanpa perlu mengetik alamat URL lagi.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-xl bg-[#6f4627] text-white text-xs font-bold hover:bg-[#8b5e3c] transition-colors"
            >
              Tutup Panduan
            </button>
          </div>
        </div>
      )}
    </>
  );
};
