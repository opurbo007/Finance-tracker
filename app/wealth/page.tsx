'use client'
import { useMemo } from 'react'
import { useData } from '@/components/DataProvider'
import { WealthCard, SectionLabel, EmptyState, Spinner } from '@/components/ui'
import { formatBdt } from '@/lib/utils'

export default function WealthPage() {
  const { wealthAccounts, loading, deleteWealthAccount } = useData()

  const { assets, liabilities, netWorth } = useMemo(() => {
    const assets      = wealthAccounts.filter(a => !a.isDebt).reduce((s, a) => s + a.amount, 0)
    const liabilities = wealthAccounts.filter(a => a.isDebt).reduce((s, a) => s + a.amount, 0)
    return { assets, liabilities, netWorth: assets - liabilities }
  }, [wealthAccounts])

  const nonDebts = wealthAccounts.filter(a => !a.isDebt)
  const debts    = wealthAccounts.filter(a =>  a.isDebt)

  return (
    <div className="p-4 space-y-4 pt-6">
      <h1 className="text-xl font-semibold">Wealth Overview</h1>

      {/* Net worth hero card */}
      <div className="rounded-2xl p-5 text-white" style={{ background: 'var(--blue)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider opacity-75 mb-1">Net Worth</p>
        <p className="text-3xl font-semibold mb-4"
          style={{ color: netWorth < 0 ? '#FFAAAA' : 'white' }}>
          {netWorth < 0 ? '-' : ''}{formatBdt(Math.abs(netWorth))}
        </p>
        <div className="flex gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Assets</p>
            <p className="text-sm font-semibold text-green-300">{formatBdt(assets)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider opacity-60 mb-0.5">Liabilities</p>
            <p className="text-sm font-semibold text-red-300">{formatBdt(liabilities)}</p>
          </div>
        </div>
      </div>

      {loading ? <Spinner /> : wealthAccounts.length === 0
        ? <EmptyState icon="🏦" message="No accounts yet. Tap + to add your bank, savings, or assets." />
        : <>
            {nonDebts.length > 0 && (
              <>
                <SectionLabel>Accounts & Assets</SectionLabel>
                <div className="space-y-2">
                  {nonDebts.map(acc => (
                    <WealthCard key={acc._id} account={acc} onDelete={() => deleteWealthAccount(acc._id)} />
                  ))}
                </div>
              </>
            )}
            {debts.length > 0 && (
              <>
                <SectionLabel>Debts & Liabilities</SectionLabel>
                <div className="space-y-2">
                  {debts.map(acc => (
                    <WealthCard key={acc._id} account={acc} onDelete={() => deleteWealthAccount(acc._id)} />
                  ))}
                </div>
              </>
            )}
          </>
      }
      <div className="h-4" />
    </div>
  )
}
