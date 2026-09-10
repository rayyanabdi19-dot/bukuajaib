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
  CheckCircle2,
  Mail,
  Phone,
  UserPlus,
  LogIn
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
  // Mode: login or register
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form state (empty by default, no demo credentials)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [registerName, setRegisterName] = useState('');
  const [registerUsername, setRegisterUsername] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerRole, setRegisterRole] = useState<'admin' | 'receptionist'>('admin');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  // Status and feedback
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

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

      if (resp.ok) {
        const res = await resp.json();
        if (res.success && res.user) {
          setAuthSuccess(`Selamat datang, ${res.user.name}! Membuka buku tamu...`);
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess(res.user, res.data);
            } else {
              onLogin(res.user.role, res.user.username);
            }
            onEnterApp();
          }, 400);
          return;
        } else {
          setAuthError(res.message || 'Username atau kata sandi tidak cocok.');
          setIsAuthLoading(false);
          return;
        }
      } else if (resp.status === 400 || resp.status === 401) {
        const res = await resp.json().catch(() => ({}));
        setAuthError(res.message || 'Username atau kata sandi tidak cocok. Silakan periksa kembali atau buat akun baru.');
        setIsAuthLoading(false);
        return;
      }
      // If 404 or other server status (e.g. static hosting like Cloudflare Pages), fall through to local storage
      throw new Error('API server unavailable (Static / Edge deployment)');
    } catch (err: any) {
      // Offline-first / Static host fallback (Cloudflare Pages / Vercel Static)
      try {
        const localUsersStr = localStorage.getItem('buku_ajaib_registered_users');
        const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
        const localAccount = localUsers[cleanUsername];

        if (localAccount && localAccount.password === cleanPassword) {
          const userSession: UserSession = {
            id: localAccount.id,
            username: localAccount.username,
            name: localAccount.name,
            email: localAccount.email,
            role: localAccount.role,
            phone: localAccount.phone,
            desk: localAccount.role === 'admin' ? 'Meja Utama VIP' : 'Meja Penerima Tamu 1',
            isLoggedIn: true,
            loginAt: new Date().toLocaleTimeString('id-ID'),
          };
          setAuthSuccess(`Selamat datang, ${userSession.name}! Membuka buku tamu...`);
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess(userSession);
            } else {
              onLogin(userSession.role, userSession.username);
            }
            onEnterApp();
          }, 400);
          return;
        }
      } catch (localErr) {
        console.warn('Local storage check error:', localErr);
      }

      setAuthError('Username atau kata sandi tidak cocok. Jika Anda baru pertama kali menggunakan deployment ini, silakan klik tab "Daftar Akun Baru" di atas.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Handle User Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setIsAuthLoading(true);

    const cleanName = registerName.trim();
    const cleanUsername = registerUsername.trim().toLowerCase();
    const cleanEmail = registerEmail.trim();
    const cleanPassword = registerPassword.trim();

    if (!cleanUsername || !cleanPassword) {
      setAuthError('Username dan Password wajib diisi.');
      setIsAuthLoading(false);
      return;
    }

    if (cleanPassword.length < 6) {
      setAuthError('Password minimal 6 karakter demi keamanan akun.');
      setIsAuthLoading(false);
      return;
    }

    try {
      const resp = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName || cleanUsername,
          username: cleanUsername,
          email: cleanEmail || `${cleanUsername}@bukuajaib.id`,
          password: cleanPassword,
          phone: registerPhone.trim(),
          role: registerRole,
        }),
      });

      if (resp.ok) {
        const res = await resp.json();
        if (res.success && res.user) {
          // Also mirror to local storage for static/offline resilience
          try {
            const localUsersStr = localStorage.getItem('buku_ajaib_registered_users');
            const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
            localUsers[cleanUsername] = {
              id: res.user.id,
              username: cleanUsername,
              email: res.user.email,
              password: cleanPassword,
              name: res.user.name,
              phone: registerPhone.trim(),
              role: registerRole,
            };
            localStorage.setItem('buku_ajaib_registered_users', JSON.stringify(localUsers));
          } catch (e) {}

          setAuthSuccess(`Akun berhasil dibuat! Selamat datang, ${res.user.name}!`);
          setTimeout(() => {
            if (onLoginSuccess) {
              onLoginSuccess(res.user, res.data);
            } else {
              onLogin(res.user.role, res.user.username);
            }
            onEnterApp();
          }, 400);
          return;
        } else {
          setAuthError(res.message || 'Pendaftaran gagal. Silakan coba lagi dengan username lain.');
          setIsAuthLoading(false);
          return;
        }
      } else if (resp.status === 400) {
        const res = await resp.json().catch(() => ({}));
        setAuthError(res.message || 'Username sudah terdaftar.');
        setIsAuthLoading(false);
        return;
      }
      throw new Error('API server unavailable (Static / Edge deployment)');
    } catch (err: any) {
      // Offline-first / Static host fallback (Cloudflare Pages, Vercel Static)
      try {
        const localUsersStr = localStorage.getItem('buku_ajaib_registered_users');
        const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};

        if (localUsers[cleanUsername]) {
          setAuthError('Username ini sudah terdaftar di browser ini. Silakan gunakan nama lain atau langsung login.');
          setIsAuthLoading(false);
          return;
        }

        const newUserId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const newUserData: UserSession = {
          id: newUserId,
          username: cleanUsername,
          name: cleanName || cleanUsername,
          email: cleanEmail || `${cleanUsername}@bukuajaib.id`,
          role: registerRole,
          phone: registerPhone.trim(),
          desk: registerRole === 'admin' ? 'Meja Utama VIP' : 'Meja Penerima Tamu 1',
          isLoggedIn: true,
          loginAt: new Date().toLocaleTimeString('id-ID'),
        };

        localUsers[cleanUsername] = {
          ...newUserData,
          password: cleanPassword,
        };
        localStorage.setItem('buku_ajaib_registered_users', JSON.stringify(localUsers));

        setAuthSuccess(`Akun berhasil dibuat! Selamat datang, ${newUserData.name}!`);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess(newUserData);
          } else {
            onLogin(newUserData.role, newUserData.username);
          }
          onEnterApp();
        }, 400);
      } catch (e) {
        setAuthError('Gagal menyimpan pendaftaran akun lokal. Pastikan penyimpanan browser aktif.');
      }
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
          'Login Google di dalam iframe pratinjau dibatasi kebijakan browser. Buka aplikasi di Tab Baru atau gunakan Username & Password terdaftar Anda.'
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
      <div className="relative w-full lg:w-[56%] xl:w-[58%] min-h-[340px] sm:min-h-[420px] lg:min-h-screen flex items-center justify-center bg-[#f7f5f2] overflow-hidden">
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

      {/* ================= RIGHT SECTION: CLEAN ELEGANT CARD ================= */}
      <div className="w-full lg:w-[44%] xl:w-[42%] bg-white flex flex-col justify-center px-6 sm:px-12 lg:px-10 xl:px-14 py-8 sm:py-12 z-30 min-h-[500px] lg:min-h-screen">
        <div className="w-full max-w-[420px] mx-auto flex flex-col justify-center">
          
          {/* 1. BRAND LOGO */}
          <div className="mb-5 sm:mb-6">
            <BukuAjaibLogo size={62} />
          </div>

          {/* 2. WELCOME HEADINGS */}
          <div className="space-y-1 mb-6">
            <p className="text-[14px] sm:text-[15px] text-[#64748b] font-medium tracking-tight">
              {authMode === 'login' ? 'Selamat Datang di' : 'Mulai Acara Anda Bersama'}
            </p>
            <h1 className="text-[30px] sm:text-[36px] font-extrabold text-[#0f172a] tracking-tight leading-none">
              BukuAjaib
            </h1>
            <p className="text-[13px] sm:text-[14px] text-[#788596] leading-relaxed pt-1">
              {authMode === 'login' 
                ? 'Abadikan setiap pesan dan doa terbaik dari para tamu di hari istimewa Anda.' 
                : 'Buat akun pengelola resepsi atau meja penerima tamu baru.'}
            </p>
          </div>

          {/* TAB SWITCHER: MASUK vs DAFTAR */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'login'
                  ? 'bg-white text-[#b59265] shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                authMode === 'register'
                  ? 'bg-white text-[#b59265] shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Daftar Akun Baru</span>
            </button>
          </div>

          {/* 3. ALERTS / FEEDBACK */}
          {authError && (
            <div className="mb-4 p-3 bg-amber-50/90 border border-amber-200 rounded-xl text-xs text-[#5f3e1b] flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">
                <span>{authError}</span>
                {authError.includes('Tab Baru') && (
                  <button
                    type="button"
                    onClick={() => window.open(window.location.href, '_blank')}
                    className="mt-1 inline-flex items-center gap-1 font-bold text-amber-800 hover:underline cursor-pointer"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Buka di Tab Baru</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {authSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{authSuccess}</span>
            </div>
          )}

          {/* 4A. LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Field 1: Username */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <User className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <input
                  id="login-username-input"
                  type="text"
                  required
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Username / Email"
                  className="w-full bg-transparent pl-3 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoComplete="username"
                />
              </div>

              {/* Field 2: Password */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-4 py-3 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <input
                  id="login-password-input"
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Kata Sandi"
                  className="w-full bg-transparent pl-3 pr-2 text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-1 cursor-pointer"
                  aria-label={showLoginPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showLoginPassword ? (
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  ) : (
                    <EyeOff className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
              </div>

              {/* Submit Button (Warm Golden Bronze) */}
              <button
                id="btn-main-login"
                type="submit"
                disabled={isAuthLoading}
                className="w-full mt-2 py-3 px-6 rounded-xl bg-[#b59265] hover:bg-[#a48154] active:scale-[0.99] text-white font-medium text-[15px] shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <span>Login ke Sistem</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2] ml-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 4B. REGISTER FORM */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Field 1: Nama Lengkap */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <User className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <input
                  id="register-name-input"
                  type="text"
                  required
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="Nama Lengkap / Mempelai"
                  className="w-full bg-transparent pl-2.5 text-xs sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Field 2: Username */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <span className="text-xs font-bold text-slate-400 mr-1 select-none">@</span>
                <input
                  id="register-username-input"
                  type="text"
                  required
                  value={registerUsername}
                  onChange={(e) => setRegisterUsername(e.target.value)}
                  placeholder="Username (huruf & angka, tanpa spasi)"
                  className="w-full bg-transparent pl-1 text-xs sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoComplete="username"
                />
              </div>

              {/* Field 3: Email */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <Mail className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <input
                  id="register-email-input"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="Alamat Email (opsional)"
                  className="w-full bg-transparent pl-2.5 text-xs sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoComplete="email"
                />
              </div>

              {/* Field 4: Password */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <Lock className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <input
                  id="register-password-input"
                  type={showRegisterPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Kata Sandi (min. 6 karakter)"
                  className="w-full bg-transparent pl-2.5 pr-2 text-xs sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                  className="text-slate-400 hover:text-slate-600 focus:outline-none transition-colors p-0.5 cursor-pointer"
                  aria-label={showRegisterPassword ? 'Sembunyikan password' : 'Lihat password'}
                >
                  {showRegisterPassword ? (
                    <Eye className="w-4 h-4 stroke-[1.8]" />
                  ) : (
                    <EyeOff className="w-4 h-4 stroke-[1.8]" />
                  )}
                </button>
              </div>

              {/* Field 5: WhatsApp Phone */}
              <div className="relative flex items-center border border-slate-200 hover:border-slate-300 rounded-xl px-3.5 py-2.5 bg-white focus-within:border-[#b59265] focus-within:ring-2 focus-within:ring-[#b59265]/20 transition-all shadow-2xs">
                <Phone className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.8]" />
                <input
                  id="register-phone-input"
                  type="tel"
                  value={registerPhone}
                  onChange={(e) => setRegisterPhone(e.target.value)}
                  placeholder="Nomor HP / WhatsApp (opsional)"
                  className="w-full bg-transparent pl-2.5 text-xs sm:text-[13.5px] text-slate-800 placeholder-slate-400 focus:outline-none"
                />
              </div>

              {/* Role Selection */}
              <div className="flex items-center gap-2 pt-1 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Peran:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="registerRole"
                    value="admin"
                    checked={registerRole === 'admin'}
                    onChange={() => setRegisterRole('admin')}
                    className="accent-[#b59265]"
                  />
                  <span>Admin Acara</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer ml-2">
                  <input
                    type="radio"
                    name="registerRole"
                    value="receptionist"
                    checked={registerRole === 'receptionist'}
                    onChange={() => setRegisterRole('receptionist')}
                    className="accent-[#b59265]"
                  />
                  <span>Petugas Meja Tamu</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                id="btn-main-register"
                type="submit"
                disabled={isAuthLoading}
                className="w-full mt-2 py-3 px-6 rounded-xl bg-[#b59265] hover:bg-[#a48154] active:scale-[0.99] text-white font-medium text-[15px] shadow-sm hover:shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
              >
                {isAuthLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mendaftarkan Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Buat Akun & Masuk</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.2] ml-0.5" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* 5. FOOTER & DECORATIVE DIVIDER */}
          <div className="mt-7 text-center space-y-2">
            <p className="text-xs text-slate-400 font-normal tracking-wide">
              Buku Tamu Digital untuk Momen Spesial Anda
            </p>
            <div className="flex items-center justify-center gap-2 text-[#c2a275]/60">
              <span className="w-7 h-px bg-[#c2a275]/30"></span>
              <Heart className="w-3 h-3 fill-[#c2a275]/60 text-[#c2a275]/60" />
              <span className="w-7 h-px bg-[#c2a275]/30"></span>
            </div>
          </div>

          {/* 6. GOOGLE SIGN-IN ONLY (No demo button) */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-[#b59265] transition-all font-medium shadow-2xs cursor-pointer"
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
              <span>Masuk dengan Akun Google</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
