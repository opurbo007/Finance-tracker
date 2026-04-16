'use client'
import { useMemo } from 'react'
import { useData } from '@/components/DataProvider'
import { WealthCard, SectionLabel, EmptyState, Spinner } from '@/components/ui'
import { formatBdt } from '@/lib/utils'

export default function WealthPage() {
  const { wealthAccounts, loading, deleteWealthAccount } = useData()

  const { assets, liabilities, netWorth } = useMemo(() => {
    const a = wealthAccounts.filter(w => !w.isDebt).reduce((s, w) => s + w.amount, 0)
    const l = wealthAccounts.filter(w =>  w.isDebt).reduce((s, w) => s + w.amount, 0)
    return { assets: a, liabilities: l, netWorth: a - l }
  }, [wealthAccounts])

  const nonDebts = wealthAccounts.filter(w => !w.isDebt)
  const debts    = wealthAccounts.filter(w =>  w.isDebt)

  // Net worth bar width (assets vs liabilities)
  const total   = assets + liabilities
  const assetPct = total > 0 ? (assets / total) * 100 : 50

  return (
    <div className="px-4 pt-safe">
      {/* Header */}
      <div className="py-5">
        <p className="text-[13px] mb-0.5" style={{ color: 'var(--text-3)' }}>Portfolio</p>
        <h1 className="text-2xl font-bold font-display" style={{ color: 'var(--text)' }}>
          Wealth
        </h1>
      </div>

      {/* Net worth hero */}
      <div className="hero-card p-5 mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
          Net Worth
        </p>
        <p
          className="text-4xl font-bold font-display mb-4 relative z-10"
          style={{ color: netWorth < 0 ? 'var(--rose)' : '#fff' }}
        >
          {netWorth < 0 ? '−' : ''}{formatBdt(Math.abs(netWorth))}
        </p>

        {/* Assets vs liabilities bar */}
        {total > 0 && (
          <div className="mb-4">
            <div className="flex rounded-full overflow-hidden h-2" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full transition-all duration-700"
                style={{ width: `${assetPct}%`, background: 'var(--emerald)' }}
              />
              <div className="flex-1 h-full" style={{ background: 'var(--rose)' }} />
            </div>
          </div>
        )}

        {/* Assets / liabilities row */}
        <div className="flex gap-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Assets</p>
            <p className="text-sm font-bold font-display" style={{ color: 'var(--emerald)' }}>
              {formatBdt(assets)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Liabilities</p>
            <p className="text-sm font-bold font-display" style={{ color: 'var(--rose)' }}>
              {formatBdt(liabilities)}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Accounts</p>
            <p className="text-sm font-bold font-display" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {wealthAccounts.length}
            </p>
          </div>
        </div>
      </div>

      {/* Account list */}
      {loading ? <Spinner /> : wealthAccounts.length === 0
        ? <EmptyState icon="🏦" message="No accounts yet. Tap + to add your bank, savings, or assets." />
        : (
          <>
            {nonDebts.length > 0 && (
              <>
                <SectionLabel>Accounts &amp; Assets</SectionLabel>
                <div className="space-y-2">
                  {nonDebts.map(acc => (
                    <WealthCard key={acc._id} account={acc} onDelete={() => deleteWealthAccount(acc._id)} />
                  ))}
                </div>
              </>
            )}
            {debts.length > 0 && (
              <>
                <SectionLabel>Debts &amp; Liabilities</SectionLabel>
                <div className="space-y-2">
                  {debts.map(acc => (
                    <WealthCard key={acc._id} account={acc} onDelete={() => deleteWealthAccount(acc._id)} />
                  ))}
                </div>
              </>
            )}
          </>
        )
      }
      <div className="h-6" />
    </div>
  )
}
