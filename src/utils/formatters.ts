/**
 * Centralized formatting helpers ensuring all numbers throughout the platform
 * are strictly presented in English / Western Arabic digits (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
 * with standard comma separators (en-US standard).
 */

export function toEnglishDigits(value: number | string | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  return str
    .replace(/[٠-٩]/g, (w) => arabicDigits.indexOf(w).toString())
    .replace(/[۰-۹]/g, (w) => persianDigits.indexOf(w).toString());
}

export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '0';
  const cleanStr = toEnglishDigits(value).replace(/,/g, '').trim();
  const num = typeof value === 'number' ? value : parseFloat(cleanStr);
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

export function formatCurrency(value: number | string | undefined | null, suffix: string = 'ج.م'): string {
  return `${formatNumber(value)} ${suffix}`;
}

export function formatDate(dateInput: string | Date | undefined | null): string {
  if (!dateInput) return '';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);
  
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

