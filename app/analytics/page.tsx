'use client'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useData } from '@/components/DataProvider'
import { MetricTile, SectionLabel, EmptyState, Spinner } from '@/components/ui'
import { formatBdt, currentMonth } from '@/lib/utils'
import { CAT_COLORS, ALL_CATEGORIES } from '@/types'

function monthLabel(month: string, format: 'long' | 'short' = 'long') {
  const [year, monthIndex] = month.split('-').map(Number)
  return new Date(year ?? 0, (monthIndex ?? 1) - 1, 1).toLocaleDateString('en-GB', {
    month: format,
    year: 'numeric',
  })
}

function shiftMonth(month: string, offset: number) {
  const [year, monthIndex] = month.split('-').map(Number)
  const date = new Date(year ?? 0, (monthIndex ?? 1) - 1 + offset, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function daysForAverage(month: string) {
  const [year, monthIndex] = month.split('-').map(Number)
  if (month === currentMonth()) return new Date().getDate()
  return new Date(year ?? 0, monthIndex ?? 1, 0).getDate()
}

export default function AnalyticsPage() {
  const { transactions, loading } = useData()
  const [selectedMonth, setSelectedMonth] = useState(currentMonth())

  const monthOptions = useMemo(() => {
    const months = new Set(transactions.map(t => t.date.slice(0, 7)))
    months.add(currentMonth())
    return Array.from(months).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  const monthlyHistory = useMemo(() => {
    return monthOptions.map(month => {
      const monthly = transactions.filter(t => t.date.startsWith(month) && t.type !== 'borrow')
      const income = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
      const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
      return { month, income, expense, balance: income - expense }
    }).filter(report => report.income > 0 || report.expense > 0)
  }, [transactions, monthOptions])

  const { income, expense, balance, dailyAvg, catStats } = useMemo(() => {
    const monthly = transactions.filter(t => t.date.startsWith(selectedMonth) && t.type !== 'borrow')
    const income  = monthly.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
    const expense = monthly.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
    const avgDays = daysForAverage(selectedMonth)

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
      balance: income - expense,
      dailyAvg: avgDays > 0 ? expense / avgDays : 0,
      catStats,
    }
  }, [transactions, selectedMonth])

  const maxCat = catStats[0]?.total ?? 1
  const monthName = monthLabel(selectedMonth)
  const oldestMonth = monthOptions[monthOptions.length - 1] ?? selectedMonth
  const newestMonth = monthOptions[0] ?? selectedMonth
  const previousMonth = shiftMonth(selectedMonth, -1)
  const nextMonth = shiftMonth(selectedMonth, 1)
  const canGoPrevious = previousMonth >= oldestMonth
  const canGoNext = nextMonth <= newestMonth

  return (
    <div className="px-4 pt-safe">
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>Reports</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>
          Analytics
        </h1>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setSelectedMonth(previousMonth)}
          disabled={!canGoPrevious}
          className="icon-button w-10 h-10 disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="input-field h-11 py-0"
          aria-label="Report month"
        >
          {monthOptions.map(month => (
            <option key={month} value={month}>{monthLabel(month)}</option>
          ))}
        </select>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setSelectedMonth(nextMonth)}
          disabled={!canGoNext}
          className="icon-button w-10 h-10 disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>

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

      <SectionLabel>{monthName} spending</SectionLabel>

      {loading ? (
        <Spinner />
      ) : catStats.length === 0 ? (
        <EmptyState icon="ðŸ“Š" message="No expenses found for this month." />
      ) : (
        <div className="space-y-3">
          {catStats.map((stat, i) => {
            const pct = Math.round((stat.total / maxCat) * 100)
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

      <SectionLabel>Monthly history</SectionLabel>

      {loading ? (
        <Spinner />
      ) : monthlyHistory.length === 0 ? (
        <EmptyState icon="ðŸ“‹" message="Previous month reports will appear here." />
      ) : (
        <div className="space-y-2 pb-6">
          {monthlyHistory.map(report => (
            <button
              key={report.month}
              type="button"
              onClick={() => setSelectedMonth(report.month)}
              className="card p-3 w-full text-left"
              style={{
                borderColor: report.month === selectedMonth ? 'var(--accent)' : undefined,
                boxShadow: report.month === selectedMonth ? '0 0 0 1px var(--accent)' : undefined,
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold font-display" style={{ color: 'var(--text)' }}>
                    {monthLabel(report.month, 'short')}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                    Income {formatBdt(report.income)} Â· Spent {formatBdt(report.expense)}
                  </p>
                </div>
                <p
                  className="text-sm font-bold font-display flex-shrink-0"
                  style={{ color: report.balance >= 0 ? 'var(--emerald)' : 'var(--rose)' }}
                >
                  {report.balance >= 0 ? '+' : '-'}{formatBdt(Math.abs(report.balance))}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
