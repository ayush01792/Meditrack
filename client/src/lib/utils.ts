import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, pattern = 'MMM dd, yyyy') {
  return format(new Date(date), pattern);
}

export function formatTime(date: string | Date) {
  return format(new Date(date), 'hh:mm a');
}

export function formatRelative(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatFrequency(freq: string) {
  const map: Record<string, string> = {
    once_daily: 'Once daily',
    twice_daily: 'Twice daily',
    thrice_daily: 'Thrice daily',
    as_needed: 'As needed',
  };
  return map[freq] ?? freq;
}

export function getVitalUnit(type: string) {
  const map: Record<string, string> = {
    blood_pressure: 'mmHg',
    blood_sugar: 'mg/dL',
    weight: 'kg',
  };
  return map[type] ?? '';
}

export function getVitalNormalRange(type: string): { min: number; max: number } | null {
  const map: Record<string, { min: number; max: number }> = {
    blood_sugar: { min: 70, max: 140 },
    weight: { min: 45, max: 100 },
  };
  return map[type] ?? null;
}
