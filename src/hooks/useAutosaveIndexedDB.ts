import { useEffect, useRef, useState, useCallback } from 'react';
import { Guest, ActivityLog, WeddingEventInfo } from '../types';
import { saveAppStateToIndexedDB } from '../services/indexedDBService';

interface UseAutosaveIndexedDBProps {
  guests: Guest[];
  logs: ActivityLog[];
  eventInfo: WeddingEventInfo;
  enabled?: boolean;
  intervalMs?: number; // Default 10000 (10 detik)
  onSaveSuccess?: (timestamp: number) => void;
}

export interface AutosaveState {
  lastSaved: Date | null;
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveCount: number;
  forceSaveNow: () => Promise<void>;
}

export function useAutosaveIndexedDB({
  guests,
  logs,
  eventInfo,
  enabled = true,
  intervalMs = 10000, // 10 detik
  onSaveSuccess,
}: UseAutosaveIndexedDBProps): AutosaveState {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveCount, setSaveCount] = useState<number>(0);

  // Keep latest references without resetting the 10-second timer
  const guestsRef = useRef(guests);
  const logsRef = useRef(logs);
  const eventInfoRef = useRef(eventInfo);
  const onSaveSuccessRef = useRef(onSaveSuccess);

  useEffect(() => {
    guestsRef.current = guests;
  }, [guests]);

  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  useEffect(() => {
    eventInfoRef.current = eventInfo;
  }, [eventInfo]);

  useEffect(() => {
    onSaveSuccessRef.current = onSaveSuccess;
  }, [onSaveSuccess]);

  // Eksekusi penyimpanan ke IndexedDB
  const performSave = useCallback(async () => {
    if (!enabled) return;

    setIsSaving(true);
    setSaveStatus('saving');

    try {
      const result = await saveAppStateToIndexedDB(
        guestsRef.current,
        logsRef.current,
        eventInfoRef.current
      );

      if (result.success) {
        const now = new Date(result.timestamp);
        setLastSaved(now);
        setSaveStatus('saved');
        setSaveCount((prev) => prev + 1);

        if (onSaveSuccessRef.current) {
          onSaveSuccessRef.current(result.timestamp);
        }
      } else {
        setSaveStatus('error');
      }
    } catch (err) {
      console.warn('Autosave IndexedDB error:', err);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  }, [enabled]);

  // Initial save saat aplikasi baru terbuka (setelah 1.5 detik)
  useEffect(() => {
    if (!enabled) return;
    const initialTimer = setTimeout(() => {
      performSave();
    }, 1500);

    return () => clearTimeout(initialTimer);
  }, [enabled, performSave]);

  // Interval autosave setiap 10 detik (10.000 ms)
  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(() => {
      performSave();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [enabled, intervalMs, performSave]);

  return {
    lastSaved,
    isSaving,
    saveStatus,
    saveCount,
    forceSaveNow: performSave,
  };
}
