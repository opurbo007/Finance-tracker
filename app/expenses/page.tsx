'use client'
import { useMemo } from 'react'
import { useData } from '@/components/DataProvider'
import { TransactionItem, DateDivider, EmptyState, Spinner } from '@/components/ui'
import { formatDate } from '@/lib/utils'

export default function ExpensesPage() {
  const { transactions, loading, deleteTransaction } = useData()

  const grouped = useMemo(() => {
    const map: Record<string, typeof transactions> = {}
    for (const tx of transactions) {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date]!.push(tx)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [transactions])

  return (
    <div className="px-4 pt-safe">
      {/* Header */}
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>History</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>
          Transactions
        </h1>
      </div>

      {loading
        ? <Spinner />
        : transactions.length === 0
          ? <EmptyState icon="💸" message="No transactions yet. Tap + to add your first one." />
          : (
            <div className="pb-6">
              {grouped.map(([date, txs]) => {
                const net = txs.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0)
                return (
                  <div key={date}>
                    <DateDivider date={date} net={net} />
                    <div className="space-y-2">
                      {txs.map(tx => (
                        <TransactionItem
                          key={tx._id}
                          tx={tx}
                          onDelete={() => deleteTransaction(tx._id)}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )
      }
    </div>
  )
}
