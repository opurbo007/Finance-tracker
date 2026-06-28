'use client'
import { useMemo, useState } from 'react'
import { useData } from '@/components/DataProvider'
import { MetricTile, TransactionItem, DateDivider, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { formatBdt, transactionSignedAmount, todayStr } from '@/lib/utils'
import type { Transaction } from '@/types'

export default function BorrowPage() {
  const { transactions, loading, updateTransaction, deleteTransaction } = useData()

  const [editTx, setEditTx] = useState<Transaction | null>(null)
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active')
  const [clearTx, setClearTx] = useState<Transaction | null>(null)
  const [clearNote, setClearNote] = useState('')
  const [clearing, setClearing] = useState(false)

  const allBorrow = useMemo(
    () => transactions.filter((tx) => tx.type === 'borrow'),
    [transactions],
  )

  const activeBorrows = useMemo(
    () => allBorrow.filter((tx) => !tx.cleared),
    [allBorrow],
  )

  const clearedBorrows = useMemo(
    () => allBorrow.filter((tx) => tx.cleared),
    [allBorrow],
  )

  const borrows = activeTab === 'active' ? activeBorrows : clearedBorrows

  const summary = useMemo(() => {
    const lent = activeBorrows
      .filter((tx) => tx.borrowDirection === 'lent')
      .reduce((sum, tx) => sum + tx.amount, 0)

    const borrowed = activeBorrows
      .filter((tx) => tx.borrowDirection === 'borrowed')
      .reduce((sum, tx) => sum + tx.amount, 0)

    return {
      lent,
      borrowed,
      net: borrowed - lent,
      count: activeBorrows.length,
    }
  }, [activeBorrows])

  const grouped = useMemo(() => {
    const map: Record<string, typeof borrows> = {}
    for (const tx of borrows) {
      if (!map[tx.date]) map[tx.date] = []
      map[tx.date]!.push(tx)
    }
    return Object.entries(map).sort(([a], [b]) => b.localeCompare(a))
  }, [borrows])

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

  async function handleClear() {
    if (!clearTx) return
    setClearing(true)
    try {
      await updateTransaction(clearTx._id, {
        cleared: true,
        clearedDate: todayStr(),
        clearedNote: clearNote,
        wealthEffect: 'none',
      })
    } finally {
      setClearing(false)
      setClearTx(null)
      setClearNote('')
    }
  }

  return (
    <div className="px-4 pt-safe">
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>People & balances</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>Borrow</h1>
      </div>

      {activeTab === 'active' && (
        <>
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
        </>
      )}

      {/* Tab buttons */}
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('active')}
          className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
          style={{
            background: activeTab === 'active' ? 'var(--accent)' : 'var(--surface-2)',
            color: activeTab === 'active' ? 'white' : 'var(--text-2)',
            border: activeTab === 'active' ? '1px solid var(--accent)' : '1px solid transparent',
          }}
        >
          Active ({activeBorrows.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('history')}
          className="px-4 py-1.5 text-sm font-medium rounded-lg transition-all duration-150"
          style={{
            background: activeTab === 'history' ? 'var(--accent)' : 'var(--surface-2)',
            color: activeTab === 'history' ? 'white' : 'var(--text-2)',
            border: activeTab === 'history' ? '1px solid var(--accent)' : '1px solid transparent',
          }}
        >
          History ({clearedBorrows.length})
        </button>
      </div>

      {loading ? (
        <Spinner />
      ) : borrows.length === 0 ? (
        <EmptyState
          icon="🤝"
          message={
            activeTab === 'active'
              ? 'No active borrows. Tap + to track borrowed or lent money.'
              : 'No cleared borrows yet.'
          }
        />
      ) : (
        <div className="pb-6">
          {grouped.map(([date, txs]) => {
            const net = txs.reduce((sum, tx) => sum + transactionSignedAmount(tx), 0)
            return (
              <div key={date}>
                <DateDivider date={date} net={net} />
                <div className="space-y-2">
                  {txs.map((tx) => (
                    <div key={tx._id} className="relative">
                      <TransactionItem
                        tx={tx}
                        onEdit={() => setEditTx(tx)}
                        onDelete={() => setDeleteTx(tx)}
                      />
                      {activeTab === 'active' && tx.borrowDirection && (
                        <button
                          type="button"
                          onClick={() => { setClearTx(tx); setClearNote('') }}
                          className="absolute bottom-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-md transition-all"
                          style={{
                            background: 'rgba(16,185,129,0.12)',
                            color: 'var(--emerald)',
                            border: '1px solid rgba(16,185,129,0.2)',
                          }}
                        >
                          Clear
                        </button>
                      )}
                      {activeTab === 'history' && tx.clearedDate && (
                        <div
                          className="absolute bottom-2 right-2 text-[10px]"
                          style={{ color: 'var(--text-3)' }}
                        >
                          Cleared {tx.clearedDate}
                          {tx.clearedNote ? ` · ${tx.clearedNote}` : ''}
                        </div>
                      )}
                    </div>
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

      {/* Clear borrow dialog */}
      {clearTx && (
        <div
          className="bottom-sheet-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget) { setClearTx(null); setClearNote('') }}}
          style={{ alignItems: 'center' }}
        >
          <div
            className="neo-panel"
            style={{
              padding: '24px 20px',
              width: 'calc(100% - 48px)',
              maxWidth: 360,
              animation: 'confirmIn 0.18s cubic-bezier(0.2,0.8,0.2,1)',
            }}
          >
            <style>{`
              @keyframes confirmIn {
                from { opacity: 0; transform: scale(0.92); }
                to   { opacity: 1; transform: scale(1); }
              }
            `}</style>

            <div
              style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(16, 185, 129, 0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <span style={{ fontSize: 22 }}>✅</span>
            </div>

            <h3
              style={{
                fontSize: 17, fontWeight: 700, color: 'var(--text)',
                textAlign: 'center', margin: '0 0 4px', fontFamily: "'Syne', sans-serif",
              }}
            >
              Clear borrow?
            </h3>
            <p
              style={{
                fontSize: 13, color: 'var(--text-3)', textAlign: 'center',
                margin: '0 0 16px', lineHeight: 1.5,
              }}
            >
              Mark &ldquo;{clearTx.description}&rdquo; as settled.
              {clearTx.linkedWealthId ? ' Wealth will be adjusted.' : ''}
            </p>

            <textarea
              value={clearNote}
              onChange={(e) => setClearNote(e.target.value)}
              placeholder="Add a note (optional)"
              rows={2}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'var(--surface-2)', color: 'var(--text)',
                fontSize: 13, resize: 'none', marginBottom: 16,
                fontFamily: "'Outfit', sans-serif", outline: 'none',
              }}
            />

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { setClearTx(null); setClearNote('') }}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'var(--surface)', color: 'var(--text-2)',
                  fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                disabled={clearing}
                style={{
                  flex: 1, padding: '12px', borderRadius: 12, border: 'none',
                  background: 'linear-gradient(135deg, #10B981, #059669)',
                  color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                  fontFamily: "'Outfit', sans-serif",
                  boxShadow: '0 4px 16px rgba(16,185,129,0.35)',
                  opacity: clearing ? 0.6 : 1,
                }}
              >
                {clearing ? 'Clearing...' : 'Clear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
