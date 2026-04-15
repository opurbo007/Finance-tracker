import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBdt(amount: number): string {
  return '৳' + Math.round(Math.abs(amount)).toLocaleString('en-IN')
}

export function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (isToday(d))     return 'Today'
    if (isYesterday(d)) return 'Yesterday'
    return format(d, 'd MMM')
  } catch {
    return dateStr
  }
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function currentMonth(): string {
  return format(new Date(), 'yyyy-MM')
}

export function greeting(): string {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}
