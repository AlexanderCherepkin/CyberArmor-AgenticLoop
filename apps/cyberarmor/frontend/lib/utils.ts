import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCents(cents: number, currency: string = 'USD'): string {
  const amount = (cents / 100).toFixed(2);
  return `${currency} ${amount}`;
}

export function parseCurrency(value: string): number {
  const numeric = value.replace(/[^0-9.-]/g, '');
  return Math.round(parseFloat(numeric || '0') * 100);
}
