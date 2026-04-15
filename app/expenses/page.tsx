'use client'
import { useMemo } from 'react'
import { useData } from '@/components/DataProvider'
import { TransactionItem, SectionLabel, EmptyState, Spinner } from '@/components/ui'
import { formatBdt, formatDate } from '@/lib/utils'

export default function ExpensesPage() {
  const { transactions, loading, deleteTransaction } = useData()

  const grouped = useMemo(() => {
    const map: Record<string, typeof transactions> = {}
    transactions.forEach(tx => {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date].push(tx)
    })
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [transactions])

  return (
    <div className="p-4 space-y-1 pt-6">
      <h1 className="text-xl font-semibold mb-4">All Transactions</h1>

      {loading ? <Spinner /> : transactions.length === 0
        ? <EmptyState icon="💸" message="No transactions yet. Tap + to add your first one." />
        : grouped.map(([date, txs]) => {
            const dayNet = txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
            return (
              <div key={date}>
                <div className="flex items-center justify-between px-1 py-2">
                  <span className="section-label">{formatDate(date)}</span>
                  <span className="text-xs font-semibold"
                    style={{ color: dayNet >= 0 ? '#639922' : '#E24B4A' }}>
                    {dayNet >= 0 ? '+' : ''}{formatBdt(Math.abs(dayNet))}
                  </span>
                </div>
                <div className="space-y-2 mb-2">
                  {txs.map(tx => (
                    <TransactionItem key={tx._id} tx={tx} onDelete={() => deleteTransaction(tx._id)} />
                  ))}
                </div>
              </div>
            )
          })
      }
      <div className="h-4" />
    </div>
  )
}
