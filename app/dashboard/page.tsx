'use client'
import { useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'
import { useData } from '@/components/DataProvider'
import { SummaryCard, BudgetBar, SectionLabel, TransactionItem, EmptyState, Spinner } from '@/components/ui'
import { formatBdt, greeting, currentMonth } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { transactions, loading, deleteTransaction } = useData()

  const today = new Date().toISOString().split('T')[0]
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
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between pt-2">
        <div>
          <h1 className="text-xl font-semibold">{greeting()} 👋</h1>
          <p className="text-xs text-gray-400 mt-0.5">{dateStr}</p>
        </div>
        <button onClick={() => signOut({ callbackUrl: '/auth' })}
          className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors mt-1">
          <LogOut size={15} />
        </button>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Income"   value={formatBdt(summary.income)}  valueColor="#639922" />
        <SummaryCard label="Expenses" value={formatBdt(summary.expense)} valueColor="#E24B4A" />
      </div>

      {/* Balance + budget bar */}
      <div className="card p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Balance this month</p>
        <p className="text-2xl font-semibold mb-3"
          style={{ color: summary.balance >= 0 ? '#639922' : '#E24B4A' }}>
          {summary.balance < 0 ? '-' : ''}{formatBdt(summary.balance)}
        </p>
        <BudgetBar pct={summary.pct} />
      </div>

      {/* Today */}
      <SectionLabel>Today's Transactions</SectionLabel>
      {loading ? <Spinner /> : todayTx.length === 0
        ? <EmptyState icon="📋" message="No transactions today. Tap + to add one." />
        : <div className="space-y-2">
            {todayTx.map(tx => (
              <TransactionItem key={tx._id} tx={tx} onDelete={() => deleteTransaction(tx._id)} />
            ))}
          </div>
      }
    </div>
  )
}
