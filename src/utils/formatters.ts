/**
 * Centralized formatting helpers ensuring all numbers throughout the platform
 * are strictly presented in English / Western Arabic digits (0, 1, 2, 3, 4, 5, 6, 7, 8, 9)
 * with standard comma separators (en-US standard).
 */

export function formatNumber(value: number | string | undefined | null): string {
  if (value === undefined || value === null || value === '') return '0';
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('en-US');
}

export function formatCurrency(value: number | string | undefined | null, suffix: string = 'ج.م'): string {
  return `${formatNumber(value)} ${suffix}`;
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}
