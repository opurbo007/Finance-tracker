'use client'
import { useMemo } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { useData } from '@/components/DataProvider'
import { BudgetBar, SectionLabel, TransactionItem, EmptyState, Spinner } from '@/components/ui'
import { formatBdt, greeting, currentMonth } from '@/lib/utils'

export default function DashboardPage() {
  const { transactions, loading, deleteTransaction } = useData()

  const today = new Date().toISOString().split('T')[0] ?? ''
  const month = currentMonth()

  const summary = useMemo(() => {
    const monthly = transactions.filter(t => t.date.startsWith(month))
    const income  = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const pct     = income > 0 ? Math.min(100, Math.round((expense / income) * 100)) : expense > 0 ? 100 : 0
    return { income, expense, balance: income - expense, pct }
  }, [transactions, month])

  const todayTx = useMemo(() =>
    transactions.filter(t => t.date === today), [transactions, today])

  const dateStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  return (
    <div className="px-4 pt-safe">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between py-5">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-3)' }}>{dateStr}</p>
          <h1 className="text-2xl font-bold font-display mt-0.5" style={{ color: 'var(--text)' }}>
            {greeting()} 👋
          </h1>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/auth' })}
          className="w-10 h-10 rounded-2xl flex items-center justify-center transition-colors"
          style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}
        >
          <LogOut size={16} />
        </button>
      </div>

      {/* ── Hero balance card ────────────────────────────────────────────── */}
      <div className="hero-card p-5 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Balance this month
        </p>
        <p
          className="text-4xl font-bold font-display mb-4 relative z-10"
          style={{ color: summary.balance >= 0 ? '#fff' : 'var(--rose)' }}
        >
          {summary.balance < 0 ? '−' : ''}{formatBdt(Math.abs(summary.balance))}
        </p>
        <BudgetBar pct={summary.pct} />

        {/* Income / Expense row */}
        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'var(--emerald-dim)' }}>
              <TrendingUp size={13} style={{ color: 'var(--emerald)' }} />
            </div>
            <div>
              <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Income</p>
              <p className="text-sm font-semibold font-display" style={{ color: 'var(--emerald)' }}>
                {formatBdt(summary.income)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: 'var(--rose-dim)' }}>
              <TrendingDown size={13} style={{ color: 'var(--rose)' }} />
            </div>
            <div>
              <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Spent</p>
              <p className="text-sm font-semibold font-display" style={{ color: 'var(--rose)' }}>
                {formatBdt(summary.expense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today ───────────────────────────────────────────────────────── */}
      <SectionLabel>Today&apos;s Activity</SectionLabel>

      {loading
        ? <Spinner />
        : todayTx.length === 0
          ? <EmptyState icon="📋" message="No transactions today. Tap + to add one." />
          : (
            <div className="space-y-2 pb-4">
              {todayTx.map(tx => (
                <TransactionItem key={tx._id} tx={tx} onDelete={() => deleteTransaction(tx._id)} />
              ))}
            </div>
          )
      }
    </div>
  )
}
