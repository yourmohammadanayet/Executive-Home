import { format, isValid } from 'date-fns';

export function safeFormatDate(dateVal: any, formatStr: string, fallback = '-'): string {
  if (!dateVal) return fallback;
  try {
    const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
    if (!isValid(d) || isNaN(d.getTime())) {
      return fallback;
    }
    return format(d, formatStr);
  } catch {
    return fallback;
  }
}
