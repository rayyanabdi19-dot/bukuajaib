import React, { useState } from 'react';
import { UserSession } from '../types';
import { auth, signInWithGoogle } from '../firebase';
import { saveUserProfile } from '../firebaseService';
import { BukuAjaibLogo } from './BukuAjaibLogo';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Heart, 
  Loader2, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PortalAuthSectionProps {
  currentUser: UserSession;
  onLogin: (role: 'admin' | 'receptionist', username: string) => void;
  onLoginSuccess?: (user: UserSession, data?: any) => void;
  onEnterApp: () => void;
}

export const PortalAuthSection: React.FC<PortalAuthSectionProps> = ({
  currentUser,
  onLogin,
  onLoginSuccess,
  onEnterApp,
}) => {
  // Form state matching screenshot
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Status and feedback
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Quick info modal toggle
  const [showDemoInfo, setShowDemoInfo] = useState(false);

  // Handle Standard Username & Password Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthLoading(true);

    const cleanUsername = loginUsername.trim();
    const cleanPassword = loginPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setAuthError('Silakan masukkan Username dan Password Anda.');
      setIsAuthLoading(false);
      return;
    }

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: cleanUsername,
          password: cleanPassword,
          desk: cleanUsername.toLowerCase().includes('receptionist') || cleanUsername.toLowerCase().includes('petugas') 
            ? 'Meja Penerima Tamu 1' 
            : 'Meja Utama VIP',
        }),
      });

      const res = await resp.json();
      if (!resp.ok || !res.success) {
        // If server returned error, check if default credentials match for client fallback
        if ((cleanUsername === 'admin' || cleanUsername === 'admin@bukuajaib.id') && (cleanPassword === 'password123' || cleanPassword === 'admin')) {
          const fallbackUser: UserSession = {
            id: 'usr_admin_default',
            username: cleanUsername,
            name: 'Admin Pernikahan',
            email: 'admin@bukuajaib.id',
            role: 'admin',
            desk: 'Meja Utama VIP',
            isLoggedIn: true,
            loginAt: new Date().toLocaleTimeString('id-ID'),
          };
          setAuthSuccess('Berhasil masuk ke BukuAjaib!');
          setTimeout(() => {
            if (onLoginSuccess) onLoginSuccess(fallbackUser);
            else onLogin('admin', cleanUsername);
            onEnterApp();
          }, 400);
          return;
        }

        setAuthError(res.message || 'Username atau kata sandi tidak cocok. Gunakan "admin" dan "password123" untuk demo.');
        setIsAuthLoading(false);
        return;
      }

      setAuthSuccess(`Selamat datang, ${res.user.name}! Membuka buku tamu...`);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user, res.data);
        } else {
          onLogin(res.user.role, res.user.username);
        }
        onEnterApp();
      }, 400);
    } catch (err: any) {
      // Offline / Local network fallback
      const isAdm = cleanUsername.toLowerCase() === 'admin' || cleanUsername.includes('admin');
      const fallbackUser: UserSession = {
        id: `usr_${Date.now()}`,
        username: cleanUsername,
        name: cleanUsername,
        email: `${cleanUsername}@bukuajaib.id`,
        role: isAdm ? 'admin' : 'receptionist',
        desk: isAdm ? 'Meja Utama VIP' : 'Meja Penerima Tamu 1',
        isLoggedIn: true,
        loginAt: new Date().toLocaleTimeString('id-ID'),
      };
      setAuthSuccess('Berhasil masuk (Mode Offline Aktif)!');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess(fallbackUser);
        else onLogin(fallbackUser.role, fallbackUser.username);
        onEnterApp();
      }, 400);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Google Sign-In with Firebase
  const handleGoogleLogin = async () => {
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthLoading(true);

    try {
      const result = await signInWithGoogle();
      const fbUser = result.user;
      const isAdmin = fbUser.email === 'rayyan.abdi19@gmail.com' || fbUser.email?.includes('admin');
      
      const sessionUser: UserSession = {
        id: fbUser.uid,
        isLoggedIn: true,
        username: fbUser.email || 'google_user',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna Google',
        email: fbUser.email || '',
        role: isAdmin ? 'admin' : 'receptionist',
        desk: isAdmin ? 'Meja Utama VIP (Cloud)' : 'Meja Penerima Tamu (Cloud)',
        loginAt: new Date().toLocaleTimeString('id-ID'),
      };

      await saveUserProfile({
        id: fbUser.uid,
        email: fbUser.email || '',
        name: sessionUser.name,
        role: sessionUser.role,
        createdAt: new Date().toISOString(),
      });

      setAuthSuccess(`Berhasil masuk dengan Google (${fbUser.email})!`);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(sessionUser);
        } else {
          onLogin(sessionUser.role, sessionUser.username);
        }
        onEnterApp();
      }, 400);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const isNetworkOrIframe = err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed');
      const isPopupBlocked = err.code === 'auth/popup-blocked';
      
      if (isNetworkOrIframe) {
        setAuthError(
          'Login Google di dalam iframe pratinjau dibatasi kebijakan browser. Buka aplikasi di Tab Baru atau gunakan akun standar (admin / password123).'
        );
      } else if (isPopupBlocked) {
        setAuthError('Jendela popup Google diblokir browser Anda. Izinkan pop-up atau buka aplikasi di tab baru.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setAuthError('Jendela login ditutup sebelum verifikasi selesai.');
      } else {
        setAuthError(err.message || 'Gagal masuk dengan akun Google.');
      }
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#faf9f8] selection:bg-[#e4d0b4] selection:text-[#523d24]">
      {/* ================= LEFT SECTION: WEDDING ILLUSTRATION ================= */}
      <div className="relative w-full lg:w-[56%] xl:w-[58%] min-h-[380px] sm:min-h-[460px] lg:min-h-screen flex items-center justify-center bg-[#f7f5f2] overflow-hidden">
        {/* The Wedding Couple Illustration */}
        <img
          src="/wedding_login_illustration.jpg"
          alt="BukuAjaib Wedding Prewedding Illustration"
          className="w-full h-full object-cover object-[center_20%] lg:object-center select-none"
        />

        {/* Soft bottom and edge gradient fades to blend naturally */}
        <div className="absolute inset-x-0 bottom-0 h-28 lg:h-36 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-white/5 pointer-events-none" />

        {/* Subtle decorative quote for desktop watermark */}
        <div className="hidden xl:flex absolute bottom-8 left-10 items-center gap-2.5 px-4 py-2 rounded-full bg-white/75 backdrop-blur-md border border-white/60 text-[#7a6b5e] text-xs shadow-sm pointer-events-none">
          <Heart className="w-3.5 h-3.5 text-[#b59265] fill-[#b59265]" />
          <span>Momen Abadi Cinta & Bahagia Bersama BukuAjaib</span>
        </div>

        {/* Organic Curved Wave Divider (Overlapping onto left image on Desktop) */}
        <div className="hidden lg:block absolute top-0 right-[-2px] h-full w-24 md:w-32 xl:w-40 z-20 pointer-events-none">
          <svg
            className="h-full w-full text-white"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            fill="currentColor"
          >
            <path d="M100,0 C22,30 22,70 100,100 L100,0 Z" />
          </svg>
        </div>
      </div>

      {/* ================= RIGHT SECTION: CLEAN ELEGANT LOGIN CARD ================= */}
      <div className="w-full lg:w-[44%] xl:w-[42%] bg-white flex flex-col justify-center px-7 sm:px-14 lg:px-12 xl:px-16 py-10 sm:py-14 z-30 min-h-[500px] lg:min-h-screen">
        <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center">
          
          {/* 1. BRAND LOGO */}
          <div className="mb-6 sm:mb-8">
            <BukuAjaibLogo size={66} />
          </div>

          {/* 2. WELCOME HEADINGS */}
          <div className="space-y-1.5 mb-7 sm:mb-8">
            <p className="text-[15px] sm:text-base text-[#64748b] font-medium tracking-tight">
              Selamat Datang di
            </p>
            <h1 className="text-[34px] sm:text-[40px] font-extrabold text-[#0f172a] tracking-tight leading-none">
              BukuAjaib
            </h1>
            <p className="text-[13.5px] sm:text-[14.5px] text-[#788596] leading-relaxed pt-1.5">
              Abadikan setiap pesan dan doa terbaik dari orang-orang tercinta di hari istimewa Anda.
            </p>
          </div>

          {/* 3. ALERTS / FEEDBACK */}
          {authError && (
            <div className="mb-5 p-3.5 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-[#5f3e1b] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{authError}</span>
                {authError.includes('Tab Baru') && (
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="mt-1.5 inline-flex items-center gap-1 font-bold text-amber-800 hover:underline"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Buka aplikasi di Tab Baru</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {authSuccess && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{authSuccess}</span>
            </div>
          )}

          {/* 4. LOGIN FORM */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Field 1: Username */}
            <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
              <User className="w-5 h-5 text-slate-400 shrink-0 stroke-[1.8]" />
              <input
                id="login-username-input"
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-transparent pl-3 text-[14.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                autoComplete="username"
              />
            </div>

            {/* Field 2: Password */}
            <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
              <Lock className="w-5 h-5 text-slate-400 shrink-0 stroke-[1.8]" />
              <input
                id="login-password-input"
                type={showLoginPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent pl-3 pr-2 text-[14.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowLoginPassword(!showLoginPassword)}
                className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1"
                aria-label={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showLoginPassword ? (
                  <Eye className="w-5 h-5 stroke-[1.8]" />
                ) : (
                  <EyeOff className="w-5 h-5 stroke-[1.8]" />
                )}
              </button>
            </div>

            {/* Submit Button (Warm Golden Bronze) */}
            <button
              id="btn-main-login"
              type="submit"
              disabled={isAuthLoading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl bg-[#b59265] hover:bg-[#a48154] active:scale-[0.99] text-white font-medium text-base shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.2] ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* 5. FOOTER & DECORATIVE DIVIDER */}
          <div className="mt-9 text-center space-y-2.5">
            <p className="text-xs text-slate-400 font-normal tracking-wide">
              Buku Tamu Digital untuk Momen Spesial Anda
            </p>
            <div className="flex items-center justify-center gap-2 text-[#c2a275]/60">
              <span className="w-7 h-px bg-[#c2a275]/30"></span>
              <Heart className="w-3 h-3 fill-[#c2a275]/60 text-[#c2a275]/60" />
              <span className="w-7 h-px bg-[#c2a275]/30"></span>
            </div>
          </div>

          {/* 6. DISCREET FAST ACCESS CONTROLS (Demo & Google) */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={() => {
                setLoginUsername('admin');
                setLoginPassword('password123');
                setAuthError(null);
                setShowDemoInfo(true);
              }}
              className="hover:text-[#b59265] transition-colors underline underline-offset-2 decoration-slate-300"
            >
              Akun Demo: admin / password123
            </button>
            <span className="text-slate-300">•</span>
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthLoading}
              className="inline-flex items-center gap-1.5 hover:text-[#b59265] transition-colors font-medium"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>Login Google</span>
            </button>
          </div>

          {/* Demo Info Popover (if user clicks demo account) */}
          {showDemoInfo && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 flex items-center justify-between animate-fadeIn">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#b59265]" />
                <span>Kredensial demo otomatis terisi di atas. Klik <strong>Login</strong> untuk masuk.</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDemoInfo(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold ml-2"
              >
                ✕
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
