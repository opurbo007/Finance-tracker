'use client'
import { useMemo, useState } from 'react'
import { useData } from '@/components/DataProvider'
import { MetricTile, TransactionItem, DateDivider, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { formatBdt, transactionSignedAmount } from '@/lib/utils'
import type { Transaction } from '@/types'

export default function BorrowPage() {
  const { transactions, loading, deleteTransaction } = useData()

  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)

  const borrowTransactions = useMemo(
    () => transactions.filter((tx) => tx.type === 'borrow'),
    [transactions],
  )

  const summary = useMemo(() => {
    const lent = borrowTransactions
      .filter((tx) => tx.borrowDirection === 'lent')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const borrowed = borrowTransactions
      .filter((tx) => tx.borrowDirection === 'borrowed')
      .reduce((sum, tx) => sum + tx.amount, 0)

    return {
      lent,
      borrowed,
      net: borrowed - lent,
      count: borrowTransactions.length,
    }
  }, [borrowTransactions])

  const grouped = useMemo(() => {
    const map: Record<string, typeof borrowTransactions> = {}
    for (const tx of borrowTransactions) {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date]!.push(tx)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [borrowTransactions])

  async function handleConfirmDelete() {
    if (!deleteTx) return
    setDeleting(true)
    try {
      await deleteTransaction(deleteTx._id)
    } finally {
      setDeleting(false)
      setDeleteTx(null)
    }
  }

  return (
    <div className="px-4 pt-safe">
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>People & balances</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>Borrow</h1>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <MetricTile
          label="Lent"
          value={formatBdt(summary.lent)}
          valueColor="var(--amber)"
          variant="amber"
        />
        <MetricTile
          label="Borrowed"
          value={formatBdt(summary.borrowed)}
          valueColor="var(--sky)"
          variant="saving"
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-2">
        <MetricTile
          label="Net"
          value={`${summary.net >= 0 ? '+' : '-'}${formatBdt(Math.abs(summary.net))}`}
          valueColor={summary.net >= 0 ? 'var(--emerald)' : 'var(--rose)'}
          variant="balance"
        />
        <MetricTile
          label="Entries"
          value={String(summary.count)}
          valueColor="var(--text)"
        />
      </div>

      {loading ? (
        <Spinner />
      ) : borrowTransactions.length === 0 ? (
        <EmptyState icon="🤝" message="No borrow entries yet. Tap + to track borrowed or lent money." />
      ) : (
        <div className="pb-6">
          {grouped.map(([date, txs]) => {
            const net = txs.reduce((sum, tx) => sum + transactionSignedAmount(tx), 0)
            return (
              <div key={date}>
                <DateDivider date={date} net={net} />
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <TransactionItem
                      key={tx._id}
                      tx={tx}
                      onEdit={() => setEditTx(tx)}
                      onDelete={() => setDeleteTx(tx)}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddTransactionSheet
        open={!!editTx}
        onClose={() => setEditTx(null)}
        editTx={editTx}
      />

      <ConfirmDialog
        open={!!deleteTx}
        title="Delete borrow entry?"
        message={deleteTx ? `"${deleteTx.description}" will be permanently removed.` : ''}
        confirmLabel={deleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTx(null)}
      />
    </div>
  )
}
