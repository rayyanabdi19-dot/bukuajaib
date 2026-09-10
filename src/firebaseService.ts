import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { Guest, ActivityLog, WeddingEventInfo, UserProfile } from './types';

export const DEFAULT_EVENT_ID = 'event_wedding_utama';

/**
 * Ensures the master wedding event exists in Firestore
 */
export async function initializeMasterEvent(eventInfo: WeddingEventInfo, ownerId?: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const effectiveOwnerId = ownerId || auth.currentUser.uid;
  const path = `events/${DEFAULT_EVENT_ID}`;
  const docRef = doc(db, 'events', DEFAULT_EVENT_ID);
  
  let existingSnap;
  try {
    existingSnap = await getDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }

  if (existingSnap && !existingSnap.exists()) {
    try {
      await setDoc(docRef, {
        id: DEFAULT_EVENT_ID,
        ownerId: effectiveOwnerId,
        coupleTitle: eventInfo.coupleTitle || 'Budi & Siti Wedding',
        fullTitle: eventInfo.fullTitle || 'BUDI & SITI — Resepsi Siang & Malam',
        groomName: eventInfo.groomName || 'Budi Pratama, S.T.',
        brideName: eventInfo.brideName || 'Siti Nurhaliza, S.E.',
        dateStr: eventInfo.dateStr || 'Minggu, 20 September 2026',
        timeStr: eventInfo.timeStr || '10:00 - 21:00 WIB',
        location: eventInfo.location || 'Gedung Serbaguna, Jakarta',
        hall: eventInfo.hall || 'Ballroom Lantai 2',
        targetGuests: Number(eventInfo.targetGuests) || 600,
        souvenirStock: Number(eventInfo.souvenirStock) || 650,
        version: eventInfo.version || 'v.1.0.2 (Firebase)',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
}

/**
 * Updates master wedding event details in Firestore
 */
export async function updateMasterEvent(eventInfo: Partial<WeddingEventInfo>): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `events/${DEFAULT_EVENT_ID}`;
  try {
    const docRef = doc(db, 'events', DEFAULT_EVENT_ID);
    await updateDoc(docRef, {
      ...eventInfo,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

/**
 * Subscribes to real-time updates for master wedding event
 */
export function subscribeToMasterEvent(
  arg1: string | ((eventInfo: Partial<WeddingEventInfo>) => void),
  arg2?: (eventInfo: Partial<WeddingEventInfo>) => void
): Unsubscribe {
  if (!auth.currentUser) {
    return () => {};
  }
  const eventId = typeof arg1 === 'string' ? arg1 : DEFAULT_EVENT_ID;
  const onUpdate = typeof arg1 === 'function' ? arg1 : (arg2 || (() => {}));

  const path = `events/${eventId}`;
  const docRef = doc(db, 'events', eventId);
  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        onUpdate(snapshot.data() as Partial<WeddingEventInfo>);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Subscribes to guests collection in real-time
 */
export function subscribeToGuests(
  arg1: string | ((guests: Guest[]) => void),
  arg2?: (guests: Guest[]) => void
): Unsubscribe {
  if (!auth.currentUser) {
    return () => {};
  }
  const eventId = typeof arg1 === 'string' ? arg1 : DEFAULT_EVENT_ID;
  const onUpdate = typeof arg1 === 'function' ? arg1 : (arg2 || (() => {}));

  const path = `events/${eventId}/guests`;
  const guestsCol = collection(db, 'events', eventId, 'guests');
  return onSnapshot(
    guestsCol,
    (snapshot) => {
      const guestList: Guest[] = [];
      snapshot.forEach((d) => {
        guestList.push(d.data() as Guest);
      });
      // Sort guests by numericId descending
      guestList.sort((a, b) => (b.numericId || 0) - (a.numericId || 0));
      onUpdate(guestList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Adds or saves a guest record to Firestore
 */
export async function saveGuestToFirestore(guest: Guest): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `events/${DEFAULT_EVENT_ID}/guests/${guest.id}`;
  try {
    const guestDoc = doc(db, 'events', DEFAULT_EVENT_ID, 'guests', guest.id);
    await setDoc(guestDoc, {
      ...guest,
      envelopeAmount: Number(guest.envelopeAmount || 0),
      guestCount: Number(guest.guestCount || 1)
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Deletes a guest record from Firestore
 */
export async function deleteGuestFromFirestore(guestId: string): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `events/${DEFAULT_EVENT_ID}/guests/${guestId}`;
  try {
    const guestDoc = doc(db, 'events', DEFAULT_EVENT_ID, 'guests', guestId);
    await deleteDoc(guestDoc);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Subscribes to activity logs collection in real-time
 */
export function subscribeToActivityLogs(
  arg1: string | ((logs: ActivityLog[]) => void),
  arg2?: (logs: ActivityLog[]) => void
): Unsubscribe {
  if (!auth.currentUser) {
    return () => {};
  }
  const eventId = typeof arg1 === 'string' ? arg1 : DEFAULT_EVENT_ID;
  const onUpdate = typeof arg1 === 'function' ? arg1 : (arg2 || (() => {}));

  const path = `events/${eventId}/logs`;
  const logsCol = collection(db, 'events', eventId, 'logs');
  return onSnapshot(
    logsCol,
    (snapshot) => {
      const logList: ActivityLog[] = [];
      snapshot.forEach((d) => {
        logList.push(d.data() as ActivityLog);
      });
      onUpdate(logList);
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Appends an activity log to Firestore
 */
export async function addActivityLogToFirestore(log: ActivityLog): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `events/${DEFAULT_EVENT_ID}/logs/${log.id}`;
  try {
    const logDoc = doc(db, 'events', DEFAULT_EVENT_ID, 'logs', log.id);
    await setDoc(logDoc, log);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Saves user profile in /users/{userId}
 */
export async function saveUserProfile(user: UserProfile): Promise<void> {
  if (!auth.currentUser) {
    return;
  }
  const path = `users/${user.id}`;
  try {
    const userDoc = doc(db, 'users', user.id);
    await setDoc(userDoc, user, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
