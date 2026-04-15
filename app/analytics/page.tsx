'use client'
import { useMemo } from 'react'
import { useData } from '@/components/DataProvider'
import { SummaryCard, SectionLabel, EmptyState, Spinner } from '@/components/ui'
import { formatBdt, currentMonth } from '@/lib/utils'
import { CAT_COLORS, ALL_CATEGORIES } from '@/types'

export default function AnalyticsPage() {
  const { transactions, loading } = useData()
  const month = currentMonth()
  const dayOfMonth = new Date().getDate()

  const { income, expense, balance, dailyAvg, catStats } = useMemo(() => {
    const monthly = transactions.filter(t => t.date.startsWith(month))
    const income  = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

    // Category breakdown
    const catMap: Record<string, { label: string; emoji: string; total: number }> = {}
    monthly.filter(t => t.type === 'expense').forEach(t => {
      if (!catMap[t.category]) {
        const def = ALL_CATEGORIES.find(c => c.id === t.category)
        catMap[t.category] = { label: def?.label ?? t.category, emoji: t.categoryEmoji, total: 0 }
      }
      catMap[t.category].total += t.amount
    })
    const catStats = Object.entries(catMap)
      .map(([id, d]) => ({ id, ...d }))
      .sort((a, b) => b.total - a.total)

    return { income, expense, balance: income - expense, dailyAvg: expense / dayOfMonth, catStats }
  }, [transactions, month, dayOfMonth])

  const maxCat = catStats[0]?.total ?? 1

  return (
    <div className="p-4 space-y-4 pt-6">
      <h1 className="text-xl font-semibold">Analytics</h1>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="This Month" value={formatBdt(expense)}   valueColor="#E24B4A" />
        <SummaryCard label="Daily Avg"  value={formatBdt(dailyAvg)}  valueColor="#BA7517" />
        <SummaryCard label="Income"     value={formatBdt(income)}    valueColor="#639922" />
        <SummaryCard label="Saved"      value={formatBdt(Math.max(0, balance))} valueColor="#185FA5" />
      </div>

      <SectionLabel>Spending by Category</SectionLabel>

      {loading ? <Spinner /> : catStats.length === 0
        ? <EmptyState icon="📊" message="No expense data for this month yet." />
        : <div className="space-y-3">
            {catStats.map(stat => {
              const pct = Math.round((stat.total / maxCat) * 100)
              const color = CAT_COLORS[stat.id] ?? '#888780'
              return (
                <div key={stat.id} className="flex items-center gap-3">
                  <span className="text-xl w-7 flex-shrink-0">{stat.emoji}</span>
                  <span className="text-xs text-gray-500 w-20 flex-shrink-0 truncate">
                    {stat.label}
                  </span>
                  <div className="flex-1 h-4 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-20 text-right flex-shrink-0">
                    {formatBdt(stat.total)}
                  </span>
                </div>
              )
            })}
          </div>
      }
      <div className="h-4" />
    </div>
  )
}
