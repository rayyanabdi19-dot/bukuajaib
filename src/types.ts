export type PartyType = 'laki' | 'perempuan';
export type EnvelopeStatus = 'counted' | 'pending' | 'none';
export type UserRole = 'admin' | 'receptionist';

export interface Guest {
  id: string; // e.g. "BT-0526"
  numericId: number;
  name: string;
  relation: string;
  category: 'VIP' | 'Keluarga' | 'Rekan Kerja' | 'Teman Sekolah' | 'Komunitas' | 'Umum';
  party: PartyType;
  guestCount: number; // total people physically attending
  checkInTime: string; // e.g. "19:14 WIB"
  checkInDate: string;
  desk: string; // e.g. "Meja 1"
  officer: string; // e.g. "Ratna (Meja 1)"
  hasEnvelope: boolean;
  envelopeCode?: string; // e.g. "AMP-0498"
  envelopeAmount: number; // 0 if pending or none
  envelopeStatus: EnvelopeStatus;
  envelopeBox?: 'box_male' | 'box_female';
  souvenirGiven: boolean;
  souvenirCount?: number;
  tableNumber?: string;
  phone?: string;
  notes?: string;
}

export interface ActivityLog {
  id: string;
  time: string; // e.g. "19:14"
  date?: string;
  officer?: string;
  type: 'checkin' | 'envelope' | 'counted' | 'souvenir' | 'update' | 'export' | 'guest_checkin' | 'envelope_count';
  message: string;
  detail?: string;
  color: 'emerald' | 'amber' | 'rose' | 'primary' | 'neutral';
}

export interface WeddingEventInfo {
  coupleTitle: string;
  fullTitle: string;
  groomName: string;
  brideName: string;
  dateStr: string;
  timeStr: string;
  location: string;
  hall: string;
  targetGuests: number;
  souvenirStock: number;
  serverSyncIntervalSeconds: number;
  version: string;
}

export interface UserSession {
  id?: string;
  isLoggedIn: boolean;
  username: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  desk: string;
  loginAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}
