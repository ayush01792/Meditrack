// ─── Auth ────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

// ─── Medicine ────────────────────────────────────────────────────────────────

export type MedicineFrequency = 'once_daily' | 'twice_daily' | 'thrice_daily' | 'as_needed';
export type MedicineForm = 'tablet' | 'capsule' | 'syrup' | 'injection' | 'drops' | 'other';

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  form: MedicineForm;
  frequency: MedicineFrequency;
  times: string[]; // e.g. ["08:00", "20:00"]
  startDate: string;
  endDate?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface MedicinePayload {
  name: string;
  dosage: string;
  form: MedicineForm;
  frequency: MedicineFrequency;
  times: string[];
  startDate: string;
  endDate?: string;
  notes?: string;
}

// ─── Reminder ────────────────────────────────────────────────────────────────

export type ReminderStatus = 'pending' | 'taken' | 'missed' | 'snoozed';

export interface Reminder {
  id: string;
  medicineId: string;
  medicineName: string;
  dosage: string;
  scheduledAt: string;
  status: ReminderStatus;
  snoozedUntil?: string;
  takenAt?: string;
}

// ─── Vitals ──────────────────────────────────────────────────────────────────

export type VitalType = 'blood_pressure' | 'blood_sugar' | 'weight';

export interface VitalEntry {
  id: string;
  type: VitalType;
  value: number;
  unit: string;
  systolic?: number; // for BP: systolic
  diastolic?: number; // for BP: diastolic
  loggedAt: string;
  notes?: string;
}

export interface VitalPayload {
  type: VitalType;
  value?: number;
  systolic?: number;
  diastolic?: number;
  notes?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface AdherenceStats {
  total: number;
  taken: number;
  missed: number;
  snoozed: number;
  adherenceRate: number; // 0-100
}

export interface DashboardSummary {
  adherence: AdherenceStats;
  todayReminders: Reminder[];
  activeMedicines: number;
  recentVitals: VitalEntry[];
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
