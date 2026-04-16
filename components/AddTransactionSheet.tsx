'use client'
import { useState } from 'react'
import { BottomSheet, TypeToggle, SelectableChip } from '@/components/ui'
import { ALL_CATEGORIES, PAYMENT_METHODS } from '@/types'
import { useData } from '@/components/DataProvider'

interface Props { open: boolean; onClose: () => void }

function todayISO(): string {
  return new Date().toISOString().split('T')[0] ?? ''
}

export function AddTransactionSheet({ open, onClose }: Props) {
  const { addTransaction } = useData()
  const [type,   setType]   = useState<'expense' | 'income'>('expense')
  const [amount, setAmount] = useState('')
  const [desc,   setDesc]   = useState('')
  const [cat,    setCat]    = useState('food')
  const [method, setMethod] = useState('Cash')
  const [date,   setDate]   = useState(todayISO)
  const [saving, setSaving] = useState(false)

  const catObj = ALL_CATEGORIES.find(c => c.id === cat)

  async function handleSave() {
    const amt = parseFloat(amount)
    if (!amt || !desc.trim() || !catObj) return
    setSaving(true)
    try {
      await addTransaction({
        type, amount: amt, description: desc.trim(),
        category: cat, categoryEmoji: catObj.emoji,
        paymentMethod: method, date,
      })
      setAmount(''); setDesc(''); setCat('food'); setMethod('Cash'); setDate(todayISO())
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Transaction">
      <TypeToggle value={type} onChange={setType} />

      <div className="space-y-4">
        {/* Amount */}
        <div>
          <label htmlFor="tx-amount" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
            Amount
          </label>
          <div className="relative">
            <span
              className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none"
              style={{ color: 'var(--text-3)' }}
            >৳</span>
            <input
              id="tx-amount" type="number" inputMode="decimal" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="input-field pl-9"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="tx-desc" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
            Description
          </label>
          <input
            id="tx-desc" type="text" placeholder="What was this for?"
            value={desc} onChange={e => setDesc(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Category */}
        <div>
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-3)' }}>Category</p>
          <div className="grid grid-cols-4 gap-2">
            {ALL_CATEGORIES.map(c => (
              <SelectableChip key={c.id} label={c.label} emoji={c.emoji}
                selected={cat === c.id} onClick={() => setCat(c.id)} />
            ))}
          </div>
        </div>

        {/* Date + Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tx-date" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
              Date
            </label>
            <input id="tx-date" type="date" value={date}
              onChange={e => setDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label htmlFor="tx-method" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
              Method
            </label>
            <select id="tx-method" value={method}
              onChange={e => setMethod(e.target.value)} className="input-field">
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button
        type="button" onClick={handleSave}
        disabled={saving || !amount || !desc}
        className="btn-primary mt-5"
      >
        {saving ? 'Saving…' : 'Save Transaction'}
      </button>
    </BottomSheet>
  )
}
