import { Guest, ActivityLog, WeddingEventInfo, UserSession } from '../types';

export const INITIAL_EVENT_INFO: WeddingEventInfo = {
  coupleTitle: 'Buku Tamu Resepsi',
  fullTitle: 'Resepsi Pernikahan',
  groomName: 'Pengantin Pria',
  brideName: 'Pengantin Wanita',
  dateStr: 'Minggu, 20 September 2026',
  timeStr: '10:00 - 21:00 WIB',
  location: 'Gedung Resepsi',
  hall: 'Ballroom Utama',
  targetGuests: 500,
  souvenirStock: 500,
  serverSyncIntervalSeconds: 0.2,
  version: 'v.1.0.0 (Production)',
};

// Data tamu awal kosong (siap diisi tamu riil via form check-in, scan QR, atau import Excel/CSV)
export const INITIAL_GUESTS: Guest[] = [];

// Log aktivitas awal sistem
export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: 'log-init',
    time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB',
    date: new Date().toISOString().split('T')[0],
    officer: 'Sistem',
    type: 'update',
    message: 'Sistem Buku Tamu Digital siap digunakan untuk mencatat presensi tamu & amplop.',
    color: 'emerald',
  },
];

export const INITIAL_USER: UserSession = {
  isLoggedIn: false,
  username: '',
  name: '',
  email: '',
  role: 'admin',
  desk: 'Meja Utama VIP',
  loginAt: '',
};

export const initialGuests = INITIAL_GUESTS;
export const initialLogs = INITIAL_LOGS;
export const initialWeddingEvent = INITIAL_EVENT_INFO;
export const initialUserSession = INITIAL_USER;
