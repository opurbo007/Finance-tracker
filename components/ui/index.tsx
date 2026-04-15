'use client'
import { ReactNode, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { cn, formatBdt, formatDate } from '@/lib/utils'
import { CAT_COLORS, type Transaction, type WealthAccount } from '@/types'

// ── Bottom Sheet ─────────────────────────────────────────────────────────────
export function BottomSheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div className="bottom-sheet-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bottom-sheet w-full max-w-lg">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Summary Card ─────────────────────────────────────────────────────────────
export function SummaryCard({ label, value, valueColor, className }: {
  label: string; value: string; valueColor?: string; className?: string
}) {
  return (
    <div className={cn('card-surface p-4', className)}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-semibold" style={{ color: valueColor }}>{value}</p>
    </div>
  )
}

// ── Budget Bar ────────────────────────────────────────────────────────────────
export function BudgetBar({ pct }: { pct: number }) {
  const color = pct >= 100 ? '#E24B4A' : pct >= 75 ? '#BA7517' : '#639922'
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div>
      <div className="h-1.5 rounded-full bg-black/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-1.5">
        {pct > 0 ? `${pct}% of income spent this month` : 'Add income to track budget'}
      </p>
    </div>
  )
}

// ── Section Label ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label mt-4 mb-2">{children}</p>
}

// ── Transaction Item ──────────────────────────────────────────────────────────
export function TransactionItem({ tx, onDelete }: { tx: Transaction; onDelete: () => void }) {
  const catColor = CAT_COLORS[tx.category] ?? '#888780'
  const isIncome = tx.type === 'income'
  return (
    <div className="card px-4 py-3 flex items-center gap-3 animate-fade-in">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: catColor + '20' }}>
        {tx.categoryEmoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{tx.description}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)} · {tx.paymentMethod} · {formatDate(tx.date)}
        </p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-sm font-semibold" style={{ color: isIncome ? '#639922' : '#E24B4A' }}>
          {isIncome ? '+' : '-'}{formatBdt(tx.amount)}
        </span>
        <button onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors ml-1">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Wealth Card ───────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<string, string> = {
  liquid: 'badge-liquid', secure: 'badge-secure',
  invest: 'badge-invest', cash: 'badge-cash', debt: 'badge-debt',
}
export function WealthCard({ account, onDelete }: { account: WealthAccount; onDelete: () => void }) {
  return (
    <div className="card px-4 py-3 flex items-center gap-3 animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
        {account.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{account.name}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">
          {account.typeLabel}{account.notes ? ` · ${account.notes}` : ''}
        </p>
        <span className={cn('badge mt-1 inline-block', BADGE_STYLES[account.badgeType] ?? 'badge-liquid')}>
          {account.badgeLabel}
        </span>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <span className="text-sm font-semibold" style={{ color: account.isDebt ? '#E24B4A' : '#639922' }}>
          {account.isDebt ? '-' : ''}{formatBdt(account.amount)}
        </span>
        <button onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors ml-1">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Selectable Chip ───────────────────────────────────────────────────────────
export function SelectableChip({ label, emoji, selected, onClick }: {
  label: string; emoji: string; selected: boolean; onClick: () => void
}) {
  return (
    <button type="button" onClick={onClick} className={cn('chip-select', selected && 'selected')}>
      <span className="text-xl">{emoji}</span>
      <span className="truncate w-full text-center">{label}</span>
    </button>
  )
}

// ── Toggle Tabs (Expense / Income) ────────────────────────────────────────────
export function TypeToggle({ value, onChange }: {
  value: 'expense' | 'income'; onChange: (v: 'expense' | 'income') => void
}) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-black/10 mb-4">
      {(['expense', 'income'] as const).map(t => (
        <button key={t} type="button" onClick={() => onChange(t)}
          className={cn(
            'flex-1 py-2.5 text-sm font-medium transition-all',
            value === t
              ? t === 'expense'
                ? 'bg-red-50 text-red-500'
                : 'bg-green-50 text-green-700'
              : 'text-gray-400 bg-white'
          )}>
          {t.charAt(0).toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  )
}

// ── Loading spinner ───────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
    </div>
  )
}
