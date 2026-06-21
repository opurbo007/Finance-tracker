'use client'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRightLeft } from 'lucide-react'
import { BottomSheet } from '@/components/ui'
import { useData } from '@/components/DataProvider'
import { formatBdt } from '@/lib/utils'

interface Props {
  open: boolean
  onClose: () => void
}

export function TransferWealthSheet({ open, onClose }: Props) {
  const { wealthAccounts, transferWealth } = useData()
  const assetAccounts = useMemo(
    () => wealthAccounts.filter(account => !account.isDebt && !account.isHidden),
    [wealthAccounts],
  )

  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    const [first, second] = assetAccounts
    setFromId(first?._id ?? '')
    setToId(second?._id ?? '')
    setAmount('')
    setError('')
  }, [open, assetAccounts])

  const fromAccount = assetAccounts.find(account => account._id === fromId)
  const toAccount = assetAccounts.find(account => account._id === toId)
  const parsedAmount = Number.parseFloat(amount)
  const canTransfer =
    !!fromAccount &&
    !!toAccount &&
    fromId !== toId &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= fromAccount.amount

  async function handleTransfer() {
    if (!fromAccount || !toAccount) {
      setError('Choose both accounts first.')
      return
    }
    if (fromId === toId) {
      setError('Source and destination must be different.')
      return
    }
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError('Enter a valid amount to transfer.')
      return
    }
    if (parsedAmount > fromAccount.amount) {
      setError('Transfer amount is higher than the available balance.')
      return
    }

    setSaving(true)
    setError('')
    try {
      await transferWealth(fromId, toId, parsedAmount)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Transfer failed.')
    } finally {
      setSaving(false)
    }
  }

  function swapAccounts() {
    setFromId(toId)
    setToId(fromId)
    setError('')
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Transfer Wealth">
      {assetAccounts.length < 2 ? (
        <div className="neo-panel p-4 text-sm" style={{ color: 'var(--text-2)' }}>
          Add at least two asset accounts before using transfers.
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <div className="neo-panel p-4">
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>From</p>
              <select value={fromId} onChange={e => setFromId(e.target.value)} className="input-field">
                {assetAccounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.name} · {formatBdt(account.amount)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={swapAccounts}
                className="icon-button w-12 h-12"
                aria-label="Swap accounts"
              >
                <ArrowRightLeft size={18} />
              </button>
            </div>

            <div className="neo-panel p-4">
              <p className="text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>To</p>
              <select value={toId} onChange={e => setToId(e.target.value)} className="input-field">
                {assetAccounts.map(account => (
                  <option key={account._id} value={account._id}>
                    {account.name} · {formatBdt(account.amount)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="transfer-amount" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
                Custom Amount (৳)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none" style={{ color: 'var(--text-3)' }}>
                  ৳
                </span>
                <input
                  id="transfer-amount"
                  type="number"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
            </div>

            <div className="neo-panel p-4">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div>
                  <p style={{ color: 'var(--text-3)' }}>Available balance</p>
                  <p className="font-semibold font-display" style={{ color: 'var(--text)' }}>
                    {fromAccount ? formatBdt(fromAccount.amount) : formatBdt(0)}
                  </p>
                </div>
                <div className="text-right">
                  <p style={{ color: 'var(--text-3)' }}>After transfer</p>
                  <p className="font-semibold font-display" style={{ color: 'var(--accent-strong)' }}>
                    {fromAccount && Number.isFinite(parsedAmount) ? formatBdt(fromAccount.amount - parsedAmount) : formatBdt(fromAccount?.amount ?? 0)}
                  </p>
                </div>
              </div>
            </div>

            {error && (
              <div className="status-pill danger justify-center">
                {error}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleTransfer}
            disabled={saving || !canTransfer}
            className="btn-primary mt-5"
          >
            {saving ? 'Transferring...' : 'Transfer Amount'}
          </button>
        </>
      )}
    </BottomSheet>
  )
}
