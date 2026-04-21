'use client'
import { useMemo, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { useData } from '@/components/DataProvider'
import { WealthCard, SectionLabel, EmptyState, Spinner, ConfirmDialog } from '@/components/ui'
import { AddWealthSheet } from '@/components/AddWealthSheet'
import { TransferWealthSheet } from '@/components/TransferWealthSheet'
import { formatBdt } from '@/lib/utils'
import type { WealthAccount } from '@/types'

export default function WealthPage() {
  const { wealthAccounts, loading, deleteWealthAccount } = useData()

  const [editAccount,  setEditAccount]  = useState<WealthAccount | null>(null)
  const [deleteAccount, setDeleteAccount] = useState<WealthAccount | null>(null)
  const [showTransfer, setShowTransfer] = useState(false)
  const [deleting,     setDeleting]     = useState(false)

  const { assets, liabilities, netWorth } = useMemo(() => {
    const a = wealthAccounts.filter(w => !w.isDebt).reduce((s, w) => s + w.amount, 0)
    const l = wealthAccounts.filter(w =>  w.isDebt).reduce((s, w) => s + w.amount, 0)
    return { assets: a, liabilities: l, netWorth: a - l }
  }, [wealthAccounts])

  const nonDebts = wealthAccounts.filter(w => !w.isDebt)
  const debts    = wealthAccounts.filter(w =>  w.isDebt)
  const total    = assets + liabilities
  const assetPct = total > 0 ? (assets / total) * 100 : 50

  async function handleConfirmDelete() {
    if (!deleteAccount) return
    setDeleting(true)
    try {
      await deleteWealthAccount(deleteAccount._id)
    } finally {
      setDeleting(false)
      setDeleteAccount(null)
    }
  }

  return (
    <div className="px-4 pt-safe">
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>Portfolio</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>Wealth</h1>
      </div>

      {/* Net worth hero */}
      <div className="hero-card p-5 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
          Net Worth
        </p>
        <p className="text-4xl font-bold font-display mb-4 relative z-10"
          style={{ color: netWorth < 0 ? 'var(--rose)' : 'var(--text)' }}>
          {netWorth < 0 ? '-' : ''}{formatBdt(Math.abs(netWorth))}
        </p>

        {total > 0 && (
          <div className="mb-4">
            <div className="flex rounded-full overflow-hidden h-2" style={{ background: 'rgba(108,126,150,0.12)' }}>
              <div className="h-full transition-all duration-300"
                style={{ width: `${assetPct}%`, background: 'var(--emerald)' }} />
              <div className="flex-1 h-full" style={{ background: 'var(--rose)' }} />
            </div>
          </div>
        )}

        <div className="flex gap-6 pt-4" style={{ borderTop: '1px solid rgba(108,126,150,0.12)' }}>
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-3)' }}>Assets</p>
            <p className="text-sm font-bold font-display" style={{ color: 'var(--emerald)' }}>{formatBdt(assets)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-3)' }}>Liabilities</p>
            <p className="text-sm font-bold font-display" style={{ color: 'var(--rose)' }}>{formatBdt(liabilities)}</p>
          </div>
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'var(--text-3)' }}>Accounts</p>
            <p className="text-sm font-bold font-display" style={{ color: 'var(--text-2)' }}>{wealthAccounts.length}</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowTransfer(true)}
        disabled={nonDebts.length < 2}
        className="secondary-action w-full mb-4"
      >
        <ArrowRightLeft size={16} />
        <span>Transfer wealth with custom amount</span>
      </button>

      {loading ? <Spinner /> : wealthAccounts.length === 0
        ? <EmptyState icon="🏦" message="No accounts yet. Tap + to add your bank, savings, or assets." />
        : (
          <>
            {nonDebts.length > 0 && (
              <>
                <SectionLabel>Accounts &amp; Assets</SectionLabel>
                <div className="space-y-2">
                  {nonDebts.map(acc => (
                    <WealthCard key={acc._id} account={acc}
                      onEdit={() => setEditAccount(acc)}
                      onDelete={() => setDeleteAccount(acc)} />
                  ))}
                </div>
              </>
            )}
            {debts.length > 0 && (
              <>
                <SectionLabel>Debts &amp; Liabilities</SectionLabel>
                <div className="space-y-2">
                  {debts.map(acc => (
                    <WealthCard key={acc._id} account={acc}
                      onEdit={() => setEditAccount(acc)}
                      onDelete={() => setDeleteAccount(acc)} />
                  ))}
                </div>
              </>
            )}
          </>
        )
      }
      <div className="h-6" />

      {/* Edit sheet */}
      <AddWealthSheet
        open={!!editAccount}
        onClose={() => setEditAccount(null)}
        editAccount={editAccount}
      />

      <TransferWealthSheet
        open={showTransfer}
        onClose={() => setShowTransfer(false)}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteAccount}
        title="Remove account?"
        message={deleteAccount
          ? `"${deleteAccount.name}" (${formatBdt(deleteAccount.amount)}) will be permanently removed.`
          : ''}
        confirmLabel={deleting ? 'Removing…' : 'Remove'}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteAccount(null)}
      />
    </div>
  )
}
