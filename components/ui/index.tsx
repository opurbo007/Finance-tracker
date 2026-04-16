'use client'
import { type ReactNode, useEffect } from 'react'
import { X, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { cn, formatBdt, formatDate } from '@/lib/utils'
import { CAT_COLORS, type Transaction, type WealthAccount } from '@/types'

// ── Bottom Sheet ─────────────────────────────────────────────────────────────
export function BottomSheet({ open, onClose, title, children }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode
}) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null
  return (
    <div
      className="bottom-sheet-backdrop"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bottom-sheet">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold font-display" style={{ color: 'var(--text)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Metric Tile ───────────────────────────────────────────────────────────────
export function MetricTile({
  label, value, valueColor, variant = 'default', icon, className,
}: {
  label: string
  value: string
  valueColor?: string
  variant?: 'default' | 'income' | 'expense' | 'balance' | 'saving' | 'amber'
  icon?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('metric-tile', variant !== 'default' && variant, className)}>
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-3)' }}>
          {label}
        </p>
        {icon && <span style={{ color: 'var(--text-3)' }}>{icon}</span>}
      </div>
      <p className="text-xl font-semibold font-display" style={{ color: valueColor ?? 'var(--text)' }}>
        {value}
      </p>
    </div>
  )
}

// Keep SummaryCard as alias for backward compat
export function SummaryCard({ label, value, valueColor, className }: {
  label: string; value: string; valueColor?: string; className?: string
}) {
  return <MetricTile label={label} value={value} valueColor={valueColor} className={className} />
}

// ── Budget Bar ────────────────────────────────────────────────────────────────
export function BudgetBar({ pct }: { pct: number }) {
  const color   = pct >= 100 ? 'var(--rose)' : pct >= 75 ? 'var(--amber)' : 'var(--emerald)'
  const clamped = Math.min(100, Math.max(0, pct))
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
          {pct > 0 ? `${pct}% of income spent` : 'Add income to track budget'}
        </span>
        {pct > 0 && (
          <span className="text-[11px] font-semibold" style={{ color }}>
            {pct >= 100 ? 'Over budget' : pct >= 75 ? 'Near limit' : 'On track'}
          </span>
        )}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${clamped}%`, background: color }}
        />
      </div>
    </div>
  )
}

// ── Section Label ─────────────────────────────────────────────────────────────
export function SectionLabel({ children }: { children: ReactNode }) {
  return <p className="section-label mt-5 mb-2">{children}</p>
}

// ── Transaction Item ──────────────────────────────────────────────────────────
const CAT_BG_OPACITY = '18'

export function TransactionItem({ tx, onDelete }: { tx: Transaction; onDelete: () => void }) {
  const catColor = CAT_COLORS[tx.category] ?? '#888780'
  const isIncome = tx.type === 'income'

  return (
    <div className="tx-row group">
      {/* Icon */}
      <div
        className="cat-icon flex-shrink-0"
        style={{ background: catColor + CAT_BG_OPACITY }}
      >
        {tx.categoryEmoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
          {tx.description}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
          {tx.category.charAt(0).toUpperCase() + tx.category.slice(1)}
          {' · '}{tx.paymentMethod}
          {' · '}{formatDate(tx.date)}
        </p>
      </div>

      {/* Amount + delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="text-right">
          <span
            className="text-sm font-semibold font-display block"
            style={{ color: isIncome ? 'var(--emerald)' : 'var(--rose)' }}
          >
            {isIncome ? '+' : '−'}{formatBdt(tx.amount)}
          </span>
          <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
            {isIncome ? 'income' : 'expense'}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Wealth Card ───────────────────────────────────────────────────────────────
const BADGE_CLASSES: Record<string, string> = {
  liquid: 'badge-liquid',
  secure: 'badge-secure',
  invest: 'badge-invest',
  cash:   'badge-cash',
  debt:   'badge-debt',
}

export function WealthCard({ account, onDelete }: { account: WealthAccount; onDelete: () => void }) {
  return (
    <div className="wealth-row group">
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
        style={{ background: 'var(--surface-2)' }}
      >
        {account.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--text)' }}>
          {account.name}
        </p>
        <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-3)' }}>
          {account.typeLabel}{account.notes ? ` · ${account.notes}` : ''}
        </p>
        <span className={cn('badge mt-1.5 inline-block', BADGE_CLASSES[account.badgeType] ?? 'badge-liquid')}>
          {account.badgeLabel}
        </span>
      </div>

      {/* Amount + delete */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span
          className="text-sm font-semibold font-display"
          style={{ color: account.isDebt ? 'var(--rose)' : 'var(--emerald)' }}
        >
          {account.isDebt ? '−' : ''}{formatBdt(account.amount)}
        </span>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-all"
          style={{ color: 'var(--text-3)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--rose)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-3)' }}
        >
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
      <span className="text-xl leading-none">{emoji}</span>
      <span className="truncate w-full text-center leading-tight">{label}</span>
    </button>
  )
}

// ── Type Toggle ───────────────────────────────────────────────────────────────
export function TypeToggle({ value, onChange }: {
  value: 'expense' | 'income'; onChange: (v: 'expense' | 'income') => void
}) {
  return (
    <div className="type-toggle">
      {(['expense', 'income'] as const).map(t => (
        <button
          key={t} type="button" onClick={() => onChange(t)}
          className={cn(
            'type-toggle-btn',
            value === t && (t === 'expense' ? 'active-expense' : 'active-income')
          )}
        >
          {t === 'expense' ? '↓ Expense' : '↑ Income'}
        </button>
      ))}
    </div>
  )
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center py-14 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
        style={{ background: 'var(--surface-2)' }}
      >
        {icon}
      </div>
      <p className="text-sm" style={{ color: 'var(--text-3)' }}>{message}</p>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner() {
  return (
    <div className="flex items-center justify-center py-10">
      <div
        className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
      />
    </div>
  )
}

// ── Date Divider ──────────────────────────────────────────────────────────────
export function DateDivider({ date, net }: { date: string; net: number }) {
  return (
    <div className="flex items-center justify-between px-1 pt-4 pb-1.5">
      <span className="section-label">{formatDate(date)}</span>
      <span
        className="text-xs font-semibold font-display"
        style={{ color: net >= 0 ? 'var(--emerald)' : 'var(--rose)' }}
      >
        {net >= 0 ? '+' : '−'}{formatBdt(Math.abs(net))}
      </span>
    </div>
  )
}
