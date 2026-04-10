import type { Request } from 'express';

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

// ─── DB Row types ─────────────────────────────────────────────────────────────
export interface UserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  fcm_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface MedicineRow {
  id: string;
  user_id: string;
  name: string;
  dosage: string;
  form: string;
  frequency: string;
  times: string[];
  start_date: string;
  end_date: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReminderRow {
  id: string;
  user_id: string;
  medicine_id: string;
  scheduled_at: string;
  status: 'pending' | 'taken' | 'missed' | 'snoozed';
  snoozed_until: string | null;
  taken_at: string | null;
  created_at: string;
  // joined fields
  medicine_name?: string;
  dosage?: string;
}

export interface VitalRow {
  id: string;
  user_id: string;
  type: 'blood_pressure' | 'blood_sugar' | 'weight';
  value: string | null;
  systolic: number | null;
  diastolic: number | null;
  unit: string;
  notes: string | null;
  logged_at: string;
  created_at: string;
}

export interface ShareTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}
