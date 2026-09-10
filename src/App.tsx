import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Guest, ActivityLog, WeddingEventInfo, UserSession } from './types';
import { 
  initialGuests, 
  initialLogs, 
  initialWeddingEvent, 
  initialUserSession 
} from './data/initialData';
import { exportGuestsToCSV, printBeritaAcara, getCurrentTimeWIB } from './utils/formatters';
import { 
  auth, 
  signInWithGoogle, 
  fbSignOut, 
  onAuthStateChanged 
} from './firebase';
import { 
  DEFAULT_EVENT_ID, 
  initializeMasterEvent, 
  updateMasterEvent, 
  subscribeToMasterEvent, 
  subscribeToGuests, 
  subscribeToActivityLogs, 
  saveGuestToFirestore, 
  deleteGuestFromFirestore, 
  addActivityLogToFirestore, 
  saveUserProfile 
} from './firebaseService';

import { Header } from './components/Header';
import { SubHeader } from './components/SubHeader';
import { BentoMetrics } from './components/BentoMetrics';
import { GuestTableSection } from './components/GuestTableSection';
import { EnvelopeCashierSection } from './components/EnvelopeCashierSection';
import { RekapitulasiSection } from './components/RekapitulasiSection';
import { ActivityLogSection } from './components/ActivityLogSection';
import { FastReceptionModal } from './components/FastReceptionModal';
import { QrScannerModal } from './components/QrScannerModal';
import { GuestDetailModal } from './components/GuestDetailModal';
import { PortalAuthSection } from './components/PortalAuthSection';
import { EventSettingsModal } from './components/EventSettingsModal';
import { AnalyticsChartsSection } from './components/AnalyticsChartsSection';
import { DigitalClockCalendarModal } from './components/DigitalClockCalendarModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export default function App() {
  // Persistence with localStorage fallback
  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('buku_ajaib_guests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved guests', e);
      }
    }
    return initialGuests;
  });

  const [logs, setLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('buku_ajaib_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved logs', e);
      }
    }
    return initialLogs;
  });

  const [eventInfo, setEventInfo] = useState<WeddingEventInfo>(() => {
    const saved = localStorage.getItem('buku_ajaib_event_info');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved event info', e);
      }
    }
    return initialWeddingEvent;
  });

  const [userSession, setUserSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('buku_ajaib_active_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to load saved user session', e);
      }
    }
    return {
      ...initialUserSession,
      id: 'usr_admin_default',
      isLoggedIn: true,
    };
  });

  // Active Navigation: 'dashboard' | 'buku-tamu' | 'amplop' | 'rekap' | 'portal'
  const [activeNav, setActiveNav] = useState<string>(() => {
    const saved = localStorage.getItem('buku_ajaib_active_nav');
    return saved || 'dashboard';
  });
  const [activeSubTab, setActiveSubTab] = useState<string>('semua');

  // Modals
  const [isReceptionModalOpen, setIsReceptionModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEventSettingsOpen, setIsEventSettingsOpen] = useState(false);
  const [isClockCalendarModalOpen, setIsClockCalendarModalOpen] = useState(false);
  const [selectedGuestForDetail, setSelectedGuestForDetail] = useState<Guest | null>(null);
  const [detailModalMode, setDetailModalMode] = useState<'view' | 'edit'>('view');

  // Multi-Device sync status
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'offline'>('connected');
  const [connectedDevicesCount, setConnectedDevicesCount] = useState<number>(2);

  // Firebase Cloud State
  const [firebaseUserEmail, setFirebaseUserEmail] = useState<string | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);

  // Temporary toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        setFirebaseUserEmail(fbUser.email || null);
        setIsFirebaseConnected(true);
      } else {
        setFirebaseUserEmail(null);
        setIsFirebaseConnected(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // 2. Real-time Firebase Firestore synchronization (strictly only when user is authenticated)
  useEffect(() => {
    if (!firebaseUser || !auth.currentUser) {
      return;
    }

    let isSubscribed = true;
    let unsubGuests: (() => void) | null = null;
    let unsubLogs: (() => void) | null = null;
    let unsubEvent: (() => void) | null = null;

    async function initAndSubscribe() {
      if (!firebaseUser || !auth.currentUser) return;
      try {
        // Ensure master event exists in Firestore
        await initializeMasterEvent(eventInfo, auth.currentUser.uid);
        if (!isSubscribed) return;

        unsubGuests = subscribeToGuests(DEFAULT_EVENT_ID, (cloudGuests) => {
          if (cloudGuests && cloudGuests.length > 0) {
            setGuests(cloudGuests);
          }
        });

        unsubLogs = subscribeToActivityLogs(DEFAULT_EVENT_ID, (cloudLogs) => {
          if (cloudLogs && cloudLogs.length > 0) {
            setLogs(cloudLogs);
          }
        });

        unsubEvent = subscribeToMasterEvent(DEFAULT_EVENT_ID, (cloudEvent) => {
          if (cloudEvent) {
            setEventInfo((prev) => ({ ...prev, ...cloudEvent }));
          }
        });
        setIsFirebaseConnected(true);
      } catch (err) {
        console.error('Firebase Firestore subscription error:', err);
        setIsFirebaseConnected(false);
      }
    }

    initAndSubscribe();

    return () => {
      isSubscribed = false;
      if (unsubGuests) unsubGuests();
      if (unsubLogs) unsubLogs();
      if (unsubEvent) unsubEvent();
    };
  }, [firebaseUser]);

  useEffect(() => {
    localStorage.setItem('buku_ajaib_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('buku_ajaib_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('buku_ajaib_event_info', JSON.stringify(eventInfo));
  }, [eventInfo]);

  useEffect(() => {
    localStorage.setItem('buku_ajaib_active_session', JSON.stringify(userSession));
  }, [userSession]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Helper: Broadcast data update to server for 2-device instant sync
  const syncDataToServer = useCallback(
    async (
      updatedGuests: Guest[],
      updatedLogs: ActivityLog[],
      updatedEventInfo: WeddingEventInfo
    ) => {
      if (!userSession.id) return;
      try {
        setSyncStatus('syncing');
        await fetch(`/api/user/data/${userSession.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            guests: updatedGuests,
            logs: updatedLogs,
            eventInfo: updatedEventInfo,
          }),
        });
        setTimeout(() => setSyncStatus('connected'), 300);
      } catch (err) {
        console.error('Broadcast sync error:', err);
        setSyncStatus('offline');
      }
    },
    [userSession.id]
  );

  // Synchronize with server on user session change + SSE stream
  useEffect(() => {
    if (!userSession.id) return;
    const uid = userSession.id;

    // 1. Initial fetch of private user data from server
    fetch(`/api/user/data/${uid}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          if (Array.isArray(res.data.guests) && res.data.guests.length > 0) {
            setGuests(res.data.guests);
          }
          if (Array.isArray(res.data.logs) && res.data.logs.length > 0) {
            setLogs(res.data.logs);
          }
          if (res.data.eventInfo) {
            setEventInfo(res.data.eventInfo);
          }
        }
      })
      .catch((err) => console.error('Error fetching user data on mount:', err));

    // 2. Server-Sent Events (SSE) for Real-Time 2-Device Synchronization
    let sse: EventSource | null = null;
    try {
      sse = new EventSource(`/api/sync/stream/${uid}`);
      sse.onopen = () => {
        setSyncStatus('connected');
      };
      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'SYNC_UPDATE' && payload.data) {
            setSyncStatus('syncing');
            if (Array.isArray(payload.data.guests)) {
              setGuests(payload.data.guests);
            }
            if (Array.isArray(payload.data.logs)) {
              setLogs(payload.data.logs);
            }
            if (payload.data.eventInfo) {
              setEventInfo(payload.data.eventInfo);
            }
            setTimeout(() => setSyncStatus('connected'), 400);
          }
        } catch (e) {
          console.error('Error parsing SSE sync payload', e);
        }
      };
      sse.onerror = () => {
        setSyncStatus('offline');
      };
    } catch (e) {
      console.error('SSE connection error:', e);
    }

    // 3. Fallback polling every 4 seconds to guarantee sync between 2 devices even if network pauses
    const pollInterval = setInterval(() => {
      fetch(`/api/user/data/${uid}`)
        .then((r) => r.json())
        .then((res) => {
          if (res.success && res.data) {
            if (Array.isArray(res.data.guests)) {
              setGuests((current) => {
                if (JSON.stringify(current) !== JSON.stringify(res.data.guests)) {
                  return res.data.guests;
                }
                return current;
              });
            }
            if (res.data.eventInfo) {
              setEventInfo((current) => {
                if (JSON.stringify(current) !== JSON.stringify(res.data.eventInfo)) {
                  return res.data.eventInfo;
                }
                return current;
              });
            }
          }
        })
        .catch(() => {});
    }, 4000);

    return () => {
      if (sse) sse.close();
      clearInterval(pollInterval);
    };
  }, [userSession.id]);

  // Google Sign-In with Firebase
  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      const fbUser = result.user;
      const isAdmin = fbUser.email === 'rayyan.abdi19@gmail.com' || fbUser.email?.includes('admin');
      
      const newSession: UserSession = {
        id: fbUser.uid,
        isLoggedIn: true,
        username: fbUser.email || 'google_user',
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Pengguna Google',
        email: fbUser.email || '',
        role: isAdmin ? 'admin' : 'receptionist',
        desk: isAdmin ? 'Meja Utama VIP (Cloud)' : 'Meja Penerima Tamu (Cloud)',
        loginAt: new Date().toLocaleTimeString('id-ID'),
      };

      setUserSession(newSession);
      localStorage.setItem('buku_ajaib_active_session', JSON.stringify(newSession));
      await saveUserProfile({
        id: fbUser.uid,
        email: fbUser.email || '',
        name: newSession.name,
        role: newSession.role,
        createdAt: new Date().toISOString(),
      });
      await initializeMasterEvent(eventInfo, fbUser.uid);
      showToast(`Berhasil masuk ke Firebase Cloud (${fbUser.email})`);
    } catch (err: any) {
      console.error('Google Sign-In Error:', err);
      const isNetworkOrIframe = err.code === 'auth/network-request-failed' || err.message?.includes('network-request-failed');
      const isPopupBlocked = err.code === 'auth/popup-blocked';

      if (isNetworkOrIframe) {
        showToast('Login Google dalam iframe dibatasi browser. Buka aplikasi di Tab Baru atau gunakan akun lokal.');
      } else if (isPopupBlocked) {
        showToast('Popup Google diblokir browser. Izinkan popup di bilah URL atau buka di Tab Baru.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        showToast('Jendela login ditutup.');
      } else {
        showToast(`Gagal login Google: ${err.message || err.code}`);
      }
    }
  };

  // 1. Tambah Tamu Cepat (Fast Reception)
  const handleSaveNewGuest = (
    newGuestData: Omit<Guest, 'id' | 'numericId' | 'checkInTime' | 'checkInDate'>
  ) => {
    const maxNumericId = guests.reduce((max, g) => Math.max(max, g.numericId), 0);
    const newNumericId = maxNumericId + 1;
    const newCode = `BT-0${newNumericId}`;
    const currentTime = getCurrentTimeWIB();

    const createdGuest: Guest = {
      ...newGuestData,
      id: newCode,
      numericId: newNumericId,
      checkInTime: currentTime,
      checkInDate: '2026-09-06',
    };

    const updatedGuests = [createdGuest, ...guests];
    setGuests(updatedGuests);

    // Add activity log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      time: currentTime,
      message: `${userSession.desk} (${userSession.name}) mencatat tamu baru ${createdGuest.name} (${createdGuest.id})`,
      detail: `${createdGuest.party === 'laki' ? 'Pihak Pria' : 'Pihak Wanita'} • ${createdGuest.guestCount} Jiwa • ${
        createdGuest.hasEnvelope
          ? createdGuest.envelopeStatus === 'counted'
            ? `Amplop diverifikasi Rp ${createdGuest.envelopeAmount.toLocaleString('id-ID')}`
            : 'Amplop masuk box (belum dihitung)'
          : 'Tanpa amplop'
      }`,
      type: 'guest_checkin',
      color: createdGuest.hasEnvelope ? 'amber' : 'emerald',
    };

    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    // Firestore persistent sync
    saveGuestToFirestore(createdGuest).catch((err) => console.error('Firestore save error:', err));
    addActivityLogToFirestore(newLog).catch((err) => console.error('Firestore log error:', err));

    // Instant sync to second device
    syncDataToServer(updatedGuests, updatedLogs, eventInfo);
    showToast(`Tamu ${createdGuest.name} (${newCode}) dicatat & disinkronkan ke Cloud!`);
  };

  // 2. Update Tamu (View / Edit Modal)
  const handleUpdateGuest = (updated: Guest) => {
    const updatedGuests = guests.map((g) => (g.id === updated.id ? updated : g));
    setGuests(updatedGuests);
    setSelectedGuestForDetail(updated);

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      time: getCurrentTimeWIB(),
      message: `${userSession.name} memperbarui data registrasi tamu ${updated.name} (${updated.id})`,
      type: 'envelope_count',
      color: 'emerald',
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);

    // Firestore persistent sync
    saveGuestToFirestore(updated).catch((err) => console.error('Firestore update error:', err));
    addActivityLogToFirestore(newLog).catch((err) => console.error('Firestore log error:', err));

    syncDataToServer(updatedGuests, updatedLogs, eventInfo);
    showToast(`Data tamu ${updated.name} berhasil diperbarui di Cloud.`);
  };

  // 3. Delete Guest
  const handleDeleteGuest = (guestId: string) => {
    const target = guests.find((g) => g.id === guestId);
    if (!target) return;
    if (confirm(`Apakah Anda yakin ingin menghapus data tamu "${target.name}"?`)) {
      const updatedGuests = guests.filter((g) => g.id !== guestId);
      setGuests(updatedGuests);
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        time: getCurrentTimeWIB(),
        message: `${userSession.name} menghapus data registrasi tamu ${target.name} (${target.id})`,
        type: 'guest_checkin',
        color: 'rose',
      };
      const updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);

      // Firestore persistent delete
      deleteGuestFromFirestore(guestId).catch((err) => console.error('Firestore delete error:', err));
      addActivityLogToFirestore(newLog).catch((err) => console.error('Firestore log error:', err));

      syncDataToServer(updatedGuests, updatedLogs, eventInfo);
      showToast(`Data tamu ${target.name} telah dihapus dari Cloud.`);
    }
  };

  // 4. Update Amplop dari Kasir Dual-Box
  const handleUpdateGuestEnvelope = (
    guestId: string,
    amount: number,
    status: 'counted' | 'pending'
  ) => {
    const updatedGuests = guests.map((g) => {
      if (g.id === guestId) {
        return {
          ...g,
          envelopeAmount: amount,
          envelopeStatus: status,
        };
      }
      return g;
    });
    setGuests(updatedGuests);

    const target = guests.find((g) => g.id === guestId);
    let updatedLogs = logs;
    if (target) {
      const updatedGuest: Guest = {
        ...target,
        envelopeAmount: amount,
        envelopeStatus: status,
      };
      saveGuestToFirestore(updatedGuest).catch((err) => console.error('Firestore envelope update error:', err));

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        time: getCurrentTimeWIB(),
        message: `Kasir Amplop memverifikasi nominal amplop ${target.envelopeCode || target.id} milik ${target.name}`,
        detail: `Nominal terhitung: Rp ${amount.toLocaleString('id-ID')} (${target.party === 'laki' ? 'Kotak Pria' : 'Kotak Wanita'})`,
        type: 'envelope_count',
        color: 'amber',
      };
      updatedLogs = [newLog, ...logs];
      setLogs(updatedLogs);
      addActivityLogToFirestore(newLog).catch((err) => console.error('Firestore log error:', err));
      showToast(`Verifikasi nominal amplop ${target.name} berhasil disimpan.`);
    }

    syncDataToServer(updatedGuests, updatedLogs, eventInfo);
  };

  // 5. Scan QR Tamu
  const handleGuestScanned = (guest: Guest) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      time: getCurrentTimeWIB(),
      message: `Scanner QR memvalidasi kehadiran undangan ${guest.name} (${guest.id})`,
      type: 'guest_checkin',
      color: 'emerald',
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    syncDataToServer(guests, updatedLogs, eventInfo);
    showToast(`QR Code ${guest.name} (${guest.id}) valid!`);
  };

  // 6. Reset Simulasi Data
  const handleResetData = () => {
    if (confirm('Kembalikan seluruh data simulasi tamu dan log ke setelan awal pabrik (526 tamu terdaftar)?')) {
      localStorage.removeItem('buku_ajaib_guests');
      localStorage.removeItem('buku_ajaib_logs');
      setGuests(initialGuests);
      setLogs(initialLogs);
      syncDataToServer(initialGuests, initialLogs, eventInfo);
      showToast('Data simulasi tamu dan amplop berhasil di-reset ke setelan awal.');
    }
  };

  // 7. Pengaturan Acara & Nama Pengantin
  const handleSaveEventSettings = async (updated: WeddingEventInfo) => {
    setEventInfo(updated);
    if (userSession.id) {
      try {
        await fetch(`/api/user/event-settings/${userSession.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventInfo: updated }),
        });
      } catch (err) {
        console.error('Failed to save event settings to server', err);
      }
    }

    // Firestore persistent update
    updateMasterEvent(updated).catch((err) => console.error('Firestore event update error:', err));

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      time: getCurrentTimeWIB(),
      message: `${userSession.name} memperbarui pengaturan acara: ${updated.coupleTitle}`,
      detail: `Mempelai: ${updated.groomName} & ${updated.brideName} • Jadwal: ${updated.dateStr}`,
      type: 'update',
      color: 'emerald',
    };
    const updatedLogs = [newLog, ...logs];
    setLogs(updatedLogs);
    addActivityLogToFirestore(newLog).catch((err) => console.error('Firestore log error:', err));

    syncDataToServer(guests, updatedLogs, updated);
    showToast('Pengaturan nama pengantin & jadwal acara berhasil disimpan & disinkronkan ke Cloud!');
  };

  // 8. Logout
  const handleLogout = async () => {
    try {
      await fbSignOut(auth);
    } catch (e) {
      console.error('Error signing out from Firebase:', e);
    }
    localStorage.removeItem('buku_ajaib_active_session');
    setUserSession({
      id: '',
      username: '',
      name: '',
      email: '',
      role: 'admin',
      desk: 'Meja Tamu',
      isLoggedIn: false,
      loginAt: '',
    });
    setActiveNav('portal');
    showToast('Anda telah keluar dari sesi meja.');
  };

  // 9. Exports
  const handleExportCsv = () => {
    exportGuestsToCSV(guests);
    showToast('File rekapitulasi Excel (.csv) berhasil diunduh.');
  };

  const handleExportPdf = () => {
    printBeritaAcara(eventInfo, guests);
  };

  // If user navigates to portal auth tab or is not logged in
  if (activeNav === 'portal' || !userSession.isLoggedIn) {
    return (
      <PortalAuthSection
        currentUser={userSession}
        onLoginSuccess={(user, data) => {
          setUserSession(user);
          localStorage.setItem('buku_ajaib_active_session', JSON.stringify(user));
          if (data) {
            if (Array.isArray(data.guests)) setGuests(data.guests);
            if (Array.isArray(data.logs)) setLogs(data.logs);
            if (data.eventInfo) setEventInfo(data.eventInfo);
          }
          setActiveNav('dashboard');
          showToast(`Selamat datang ${user.name}! Akun aktif & tersinkron di 2 perangkat.`);
        }}
        onLogin={(role, username) => {
          const updated: UserSession = {
            id: `usr-${Date.now()}`,
            username,
            name: username,
            email: `${username}@bukuajaib.id`,
            role,
            desk: role === 'admin' ? 'Meja Utama VIP' : 'Meja Penerima Tamu 1',
            isLoggedIn: true,
            loginAt: getCurrentTimeWIB(),
          };
          setUserSession(updated);
          localStorage.setItem('buku_ajaib_active_session', JSON.stringify(updated));
          setActiveNav('dashboard');
          showToast(`Berhasil masuk sebagai ${role === 'admin' ? 'Admin Pernikahan' : 'Petugas Meja Tamu'}`);
        }}
        onEnterApp={() => setActiveNav('dashboard')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f8] flex flex-col font-sans selection:bg-[#fed65b] selection:text-[#745c00]">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1a1c1c] text-white px-4 py-3 rounded-xl shadow-2xl border border-[#735c00] flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#fed65b] shrink-0" />
          <span className="text-xs sm:text-sm font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white text-xs ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main App Header */}
      <Header
        user={userSession}
        eventInfo={eventInfo}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenReceptionModal={() => setIsReceptionModalOpen(true)}
        onOpenQrModal={() => setIsQrModalOpen(true)}
        onSwitchToPortal={() => setActiveNav('portal')}
        onResetData={handleResetData}
        onOpenEventSettings={() => setIsEventSettingsOpen(true)}
        onOpenClockCalendar={() => setIsClockCalendarModalOpen(true)}
        onLogout={handleLogout}
        firebaseConnected={isFirebaseConnected}
        firebaseUserEmail={firebaseUserEmail}
        onGoogleSignIn={handleGoogleSignIn}
      />

      {/* Sub Header (Event Info & Quick Actions) */}
      <SubHeader
        eventInfo={eventInfo}
        onOpenReceptionModal={() => setIsReceptionModalOpen(true)}
        onExportPdf={handleExportPdf}
        onExportExcel={handleExportCsv}
        onOpenEventSettings={() => setIsEventSettingsOpen(true)}
        syncStatus={syncStatus}
        connectedDevicesCount={connectedDevicesCount}
        firebaseConnected={isFirebaseConnected}
      />

      {/* Main Content Area with Smooth Framer Motion Tab Transitions */}
      <main className="max-w-[78rem] w-full mx-auto px-3 sm:px-4 md:px-6 py-6 flex-1">
        <AnimatePresence mode="wait" initial={false}>
          {/* VIEW 1: DASHBOARD UTAMA */}
          {activeNav === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              {/* Bento Metrics Bar */}
              <BentoMetrics guests={guests} eventInfo={eventInfo} />

              {/* Visualisasi Analytics Charts (Tren Per Jam & Kategori Pihak Mempelai) */}
              <AnalyticsChartsSection
                guests={guests}
                eventInfo={eventInfo}
                title="Analisis Visual: Kehadiran Tamu & Nominal Amplop"
                subtitle="Grafik tren kedatangan per jam dan komparasi penerimaan amplop berdasarkan kategori pihak mempelai"
              />

              {/* Guest Table Section */}
              <GuestTableSection
                guests={guests}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onViewGuest={(g) => {
                  setSelectedGuestForDetail(g);
                  setDetailModalMode('view');
                }}
                onEditGuest={(g) => {
                  setSelectedGuestForDetail(g);
                  setDetailModalMode('edit');
                }}
                onDeleteGuest={handleDeleteGuest}
                onOpenReceptionModal={() => setIsReceptionModalOpen(true)}
              />

              {/* Bottom 2-Column Grid: Rekapitulasi & Activity Log (As seen in Image 3) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7">
                  <RekapitulasiSection
                    guests={guests}
                    onExportPdf={handleExportPdf}
                    onExportExcel={handleExportCsv}
                  />
                </div>

                <div className="lg:col-span-5">
                  <ActivityLogSection logs={logs} />
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 2: DEDICATED ANALISIS & GRAFIK */}
          {activeNav === 'analisis' && (
            <motion.div
              key="analisis"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              <BentoMetrics guests={guests} eventInfo={eventInfo} />

              <AnalyticsChartsSection
                guests={guests}
                eventInfo={eventInfo}
                title="Dashboard Analisis & Tren Resepsi Pernikahan"
                subtitle="Pantauan visual tren kedatangan tamu per jam serta total nominal amplop masuk berdasarkan kategori pihak mempelai"
              />

              <RekapitulasiSection
                guests={guests}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportCsv}
              />
            </motion.div>
          )}

          {/* VIEW 3: BUKU TAMU LENGKAP */}
          {activeNav === 'buku-tamu' && (
            <motion.div
              key="buku-tamu"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              <GuestTableSection
                guests={guests}
                activeSubTab={activeSubTab}
                setActiveSubTab={setActiveSubTab}
                onViewGuest={(g) => {
                  setSelectedGuestForDetail(g);
                  setDetailModalMode('view');
                }}
                onEditGuest={(g) => {
                  setSelectedGuestForDetail(g);
                  setDetailModalMode('edit');
                }}
                onDeleteGuest={handleDeleteGuest}
                onOpenReceptionModal={() => setIsReceptionModalOpen(true)}
              />

              <ActivityLogSection logs={logs} />
            </motion.div>
          )}

          {/* VIEW 4: MANAJEMEN KASIR AMPLOP */}
          {activeNav === 'amplop' && (
            <motion.div
              key="amplop"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              <EnvelopeCashierSection
                guests={guests}
                onUpdateGuestEnvelope={handleUpdateGuestEnvelope}
              />

              <AnalyticsChartsSection
                guests={guests}
                eventInfo={eventInfo}
                title="Komparasi Donasi Amplop Masuk Berdasarkan Pihak & Kategori"
                subtitle="Akuntabilitas penerimaan amplop menurut kelompok relasi keluarga, rekan kerja, dan sahabat"
              />

              <RekapitulasiSection
                guests={guests}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportCsv}
              />
            </motion.div>
          )}

          {/* VIEW 5: REKAPITULASI & LAPORAN */}
          {activeNav === 'rekap' && (
            <motion.div
              key="rekap"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              <BentoMetrics guests={guests} eventInfo={eventInfo} />

              <AnalyticsChartsSection
                guests={guests}
                eventInfo={eventInfo}
                title="Visualisasi Rekapitulasi Kehadiran & Amplop"
                subtitle="Grafik arus jam kedatangan dan distribusi nominal amplop per kategori"
              />

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-8">
                  <RekapitulasiSection
                    guests={guests}
                    onExportPdf={handleExportPdf}
                    onExportExcel={handleExportCsv}
                  />
                </div>

                <div className="lg:col-span-4">
                  <ActivityLogSection logs={logs} />
                </div>
              </div>
            </motion.div>
          )}

          {/* VIEW 6: LAPORAN & EXPORT */}
          {activeNav === 'laporan' && (
            <motion.div
              key="laporan"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              <RekapitulasiSection
                guests={guests}
                onExportPdf={handleExportPdf}
                onExportExcel={handleExportCsv}
              />

              <AnalyticsChartsSection
                guests={guests}
                eventInfo={eventInfo}
                title="Lampiran Analisis Visual Laporan Pernikahan"
                subtitle="Grafik tren kehadiran per jam dan total nominal per kategori pihak mempelai untuk dokumentasi"
              />
            </motion.div>
          )}

          {/* VIEW 7: LOG AKTIVITAS */}
          {activeNav === 'log-aktivitas' && (
            <motion.div
              key="log-aktivitas"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
              className="space-y-6"
            >
              <ActivityLogSection logs={logs} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#d5c3b8] py-4 text-xs text-[#51443c] mt-auto">
        <div className="max-w-[75rem] mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div>
            <span className="font-bold text-[#6f4627]">Buku Ajaib v.1.0.2</span> • Sistem Buku Tamu & Kasir Amplop Resepsi Pernikahan
          </div>
          <div className="flex items-center gap-3 font-medium">
            <button
              type="button"
              onClick={() => setIsEventSettingsOpen(true)}
              className="text-[#6f4627] font-bold hover:underline"
            >
              Atur Pengantin & Jadwal
            </button>
            <span>•</span>
            <button onClick={() => setActiveNav('portal')} className="hover:text-[#6f4627] hover:underline">
              Portal Akses & Bantuan
            </button>
            <span>•</span>
            <button onClick={handleResetData} className="hover:text-red-700 hover:underline">
              Reset Simulasi
            </button>
          </div>
        </div>
      </footer>

      {/* Modal 1: Fast Reception Entry */}
      <FastReceptionModal
        isOpen={isReceptionModalOpen}
        onClose={() => setIsReceptionModalOpen(false)}
        nextGuestNumber={guests.length + 1}
        currentDesk={userSession.desk}
        onSaveGuest={handleSaveNewGuest}
      />

      {/* Modal 2: QR Scanner */}
      <QrScannerModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        guests={guests}
        onGuestScanned={(g) => {
          handleGuestScanned(g);
          setSelectedGuestForDetail(g);
          setDetailModalMode('view');
        }}
      />

      {/* Modal 3: Guest Detail & Edit & Thermal Slip Print */}
      <GuestDetailModal
        guest={selectedGuestForDetail}
        mode={detailModalMode}
        onClose={() => setSelectedGuestForDetail(null)}
        onUpdateGuest={handleUpdateGuest}
      />

      {/* Modal 4: Event Settings Modal (Pengaturan Nama Pengantin & Jadwal Acara) */}
      <EventSettingsModal
        isOpen={isEventSettingsOpen}
        onClose={() => setIsEventSettingsOpen(false)}
        eventInfo={eventInfo}
        onSave={handleSaveEventSettings}
      />

      {/* Modal 5: Digital Clock & Reception Calendar Modal */}
      <DigitalClockCalendarModal
        isOpen={isClockCalendarModalOpen}
        onClose={() => setIsClockCalendarModalOpen(false)}
        eventInfo={eventInfo}
        guests={guests}
      />

      {/* PWA Offline Connection Banner / Pill */}
      <OfflineIndicator />
    </div>
  );
}
