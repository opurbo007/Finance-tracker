'use client'
import { useMemo } from 'react'
import { useData } from '@/components/DataProvider'
import { MetricTile, SectionLabel, EmptyState, Spinner } from '@/components/ui'
import { formatBdt, currentMonth } from '@/lib/utils'
import { CAT_COLORS, ALL_CATEGORIES } from '@/types'

export default function AnalyticsPage() {
  const { transactions, loading } = useData()
  const month      = currentMonth()
  const dayOfMonth = new Date().getDate()

  const { income, expense, balance, dailyAvg, catStats } = useMemo(() => {
    const monthly = transactions.filter(t => t.date.startsWith(month) && t.type !== 'borrow')
    const income  = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    const catMap: Record<string, { label: string; emoji: string; total: number; color: string }> = {}
    for (const t of monthly.filter(x => x.type === 'expense')) {
      if (!catMap[t.category]) {
        const def = ALL_CATEGORIES.find(c => c.id === t.category)
        catMap[t.category] = {
          label: def?.label ?? t.category,
          emoji: t.categoryEmoji,
          total: 0,
          color: CAT_COLORS[t.category] ?? '#888780',
        }
      }
      catMap[t.category]!.total += t.amount
    }
    const catStats = Object.entries(catMap)
      .map(([id, d]) => ({ id, ...d }))
      .sort((a, b) => b.total - a.total)

    return {
      income, expense,
      balance:  income - expense,
      dailyAvg: dayOfMonth > 0 ? expense / dayOfMonth : 0,
      catStats,
    }
  }, [transactions, month, dayOfMonth])

  const maxCat = catStats[0]?.total ?? 1
  const monthName = new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 pt-safe">
      {/* Header */}
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>{monthName}</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>
          Analytics
        </h1>
      </div>

      {/* 2×2 metric grid */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <MetricTile
          label="Spent"
          value={formatBdt(expense)}
          valueColor="var(--rose)"
          variant="expense"
        />
        <MetricTile
          label="Daily avg"
          value={formatBdt(dailyAvg)}
          valueColor="var(--amber)"
          variant="amber"
        />
        <MetricTile
          label="Income"
          value={formatBdt(income)}
          valueColor="var(--emerald)"
          variant="income"
        />
        <MetricTile
          label="Saved"
          value={formatBdt(Math.max(0, balance))}
          valueColor="var(--sky)"
          variant="saving"
        />
      </div>

      {/* Category breakdown */}
      <SectionLabel>Spending by category</SectionLabel>

      {loading ? (
        <Spinner />
      ) : catStats.length === 0 ? (
        <EmptyState icon="📊" message="No expenses this month yet." />
      ) : (
        <div className="space-y-3 pb-6">
          {catStats.map((stat, i) => {
            const pct     = Math.round((stat.total / maxCat) * 100)
            const sharePct = expense > 0 ? Math.round((stat.total / expense) * 100) : 0
            return (
              <div
                key={stat.id}
                className="card p-3"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                    style={{ background: stat.color + '22' }}
                  >
                    {stat.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                        {stat.label}
                      </span>
                      <span className="text-sm font-bold font-display" style={{ color: stat.color }}>
                        {formatBdt(stat.total)}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Bar */}
                <div className="flex items-center gap-2">
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'rgba(255,255,255,0.06)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: stat.color }}
                    />
                  </div>
                  <span className="text-[10px] font-medium w-8 text-right" style={{ color: 'var(--text-3)' }}>
                    {sharePct}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
