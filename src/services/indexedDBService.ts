import { Guest, ActivityLog, WeddingEventInfo } from '../types';

const DB_NAME = 'buku_ajaib_indexed_db';
const DB_VERSION = 1;

export interface AppStateSnapshot {
  id: string;
  guests: Guest[];
  logs: ActivityLog[];
  eventInfo: WeddingEventInfo;
  timestamp: number;
  savedAtISO: string;
}

let dbInstance: IDBDatabase | null = null;
let dbOpeningPromise: Promise<IDBDatabase> | null = null;

/**
 * Initialize and open IndexedDB database
 */
export function openIndexedDB(): Promise<IDBDatabase> {
  if (dbInstance) {
    return Promise.resolve(dbInstance);
  }
  if (dbOpeningPromise) {
    return dbOpeningPromise;
  }

  dbOpeningPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung di peramban ini.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Store 1: Atomic full app state
      if (!db.objectStoreNames.contains('app_state')) {
        db.createObjectStore('app_state', { keyPath: 'id' });
      }

      // Store 2: Individual guests collection for granular inspection
      if (!db.objectStoreNames.contains('guests')) {
        const guestStore = db.createObjectStore('guests', { keyPath: 'id' });
        guestStore.createIndex('name', 'name', { unique: false });
        guestStore.createIndex('envelopeStatus', 'envelopeStatus', { unique: false });
      }

      // Store 3: Activity logs collection
      if (!db.objectStoreNames.contains('logs')) {
        db.createObjectStore('logs', { keyPath: 'id' });
      }

      // Store 4: Event settings
      if (!db.objectStoreNames.contains('event_info')) {
        db.createObjectStore('event_info', { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      dbInstance.onclose = () => {
        dbInstance = null;
      };
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      const error = (event.target as IDBOpenDBRequest).error;
      console.warn('Gagal membuka IndexedDB BukuAjaib:', error);
      dbOpeningPromise = null;
      reject(error || new Error('Gagal membuka IndexedDB'));
    };
  });

  return dbOpeningPromise;
}

/**
 * Menyimpan seluruh state aplikasi (guests, logs, eventInfo) ke dalam IndexedDB
 */
export async function saveAppStateToIndexedDB(
  guests: Guest[],
  logs: ActivityLog[],
  eventInfo: WeddingEventInfo
): Promise<{ success: boolean; timestamp: number }> {
  try {
    const db = await openIndexedDB();
    const timestamp = Date.now();
    const snapshot: AppStateSnapshot = {
      id: 'current_state',
      guests,
      logs,
      eventInfo,
      timestamp,
      savedAtISO: new Date(timestamp).toISOString(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        ['app_state', 'guests', 'logs', 'event_info'],
        'readwrite'
      );

      transaction.onerror = (event) => {
        console.error('IndexedDB transaction error:', event);
        reject(new Error('Transaksi IndexedDB gagal.'));
      };

      transaction.oncomplete = () => {
        resolve({ success: true, timestamp });
      };

      // 1. Simpan atomic snapshot
      const appStateStore = transaction.objectStore('app_state');
      appStateStore.put(snapshot);

      // 2. Simpan individual eventInfo
      const eventStore = transaction.objectStore('event_info');
      eventStore.put({ id: 'active', ...eventInfo, updatedAt: timestamp });

      // 3. Simpan individual guests
      const guestStore = transaction.objectStore('guests');
      guestStore.clear();
      for (const guest of guests) {
        guestStore.put(guest);
      }

      // 4. Simpan logs (batasi 150 log terbaru untuk performa optimal)
      const logsStore = transaction.objectStore('logs');
      logsStore.clear();
      const recentLogs = logs.slice(0, 150);
      for (const log of recentLogs) {
        logsStore.put(log);
      }
    });
  } catch (err) {
    console.warn('Gagal autosave ke IndexedDB:', err);
    return { success: false, timestamp: Date.now() };
  }
}

/**
 * Membaca state aplikasi dari IndexedDB
 */
export async function loadAppStateFromIndexedDB(): Promise<AppStateSnapshot | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('app_state', 'readonly');
      const store = transaction.objectStore('app_state');
      const request = store.get('current_state');

      request.onsuccess = () => {
        const result = request.result as AppStateSnapshot | undefined;
        resolve(result || null);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (err) {
    console.warn('Gagal membaca state dari IndexedDB:', err);
    return null;
  }
}

/**
 * Mengosongkan data IndexedDB saat reset aplikasi
 */
export async function clearAppStateFromIndexedDB(): Promise<boolean> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const transaction = db.transaction(
        ['app_state', 'guests', 'logs', 'event_info'],
        'readwrite'
      );
      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => resolve(false);

      transaction.objectStore('app_state').clear();
      transaction.objectStore('guests').clear();
      transaction.objectStore('logs').clear();
      transaction.objectStore('event_info').clear();
    });
  } catch (err) {
    console.warn('Gagal mengosongkan IndexedDB:', err);
    return false;
  }
}

/**
 * Mengambil waktu autosave terakhir
 */
export async function getLastIndexedDBSaveTime(): Promise<number | null> {
  const state = await loadAppStateFromIndexedDB();
  return state ? state.timestamp : null;
}
