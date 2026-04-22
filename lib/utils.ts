import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, parseISO } from 'date-fns'
import type { Transaction } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBdt(amount: number): string {
  return '৳' + Math.round(Math.abs(amount)).toLocaleString('en-IN')
}

export function formatDate(dateStr: string): string {
  try {
    const d = parseISO(dateStr)
    if (isToday(d)) return 'Today'
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

export function transactionSignedAmount(tx: Transaction): number {
  if (tx.type === 'income') return tx.amount
  if (tx.type === 'expense') return -tx.amount
  return tx.borrowDirection === 'borrowed' ? tx.amount : -tx.amount
}
