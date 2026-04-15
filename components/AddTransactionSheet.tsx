'use client'
import { useState } from 'react'
import { BottomSheet, TypeToggle, SelectableChip } from '@/components/ui'
import { ALL_CATEGORIES, PAYMENT_METHODS } from '@/types'
import { useData } from '@/components/DataProvider'

interface Props { open: boolean; onClose: () => void }

export function AddTransactionSheet({ open, onClose }: Props) {
  const { addTransaction } = useData()
  const [type,     setType]     = useState<'expense'|'income'>('expense')
  const [amount,   setAmount]   = useState('')
  const [desc,     setDesc]     = useState('')
  const [cat,      setCat]      = useState('food')
  const [method,   setMethod]   = useState('Cash')
  const [date,     setDate]     = useState(new Date().toISOString().split('T')[0])
  const [saving,   setSaving]   = useState(false)

  const catObj = ALL_CATEGORIES.find(c => c.id === cat)!

  async function handleSave() {
    const amt = parseFloat(amount)
    if (!amt || !desc.trim()) return
    setSaving(true)
    try {
      await addTransaction({
        type, amount: amt, description: desc.trim(),
        category: cat, categoryEmoji: catObj.emoji,
        paymentMethod: method, date,
      })
      setAmount(''); setDesc(''); setCat('food'); setMethod('Cash')
      setDate(new Date().toISOString().split('T')[0])
      onClose()
    } finally { setSaving(false) }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Transaction">
      <TypeToggle value={type} onChange={setType} />

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Amount (৳)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
            <input
              type="number" inputMode="decimal" placeholder="0.00"
              value={amount} onChange={e => setAmount(e.target.value)}
              className="input-field pl-8"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
          <input
            type="text" placeholder="What was this for?"
            value={desc} onChange={e => setDesc(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Category</label>
          <div className="grid grid-cols-4 gap-2">
            {ALL_CATEGORIES.map(c => (
              <SelectableChip key={c.id} label={c.label} emoji={c.emoji}
                selected={cat === c.id} onClick={() => setCat(c.id)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Method</label>
            <select value={method} onChange={e => setMethod(e.target.value)} className="input-field">
              {PAYMENT_METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
        </div>
      </div>

      <button onClick={handleSave} disabled={saving || !amount || !desc}
        className="btn-primary mt-5 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? 'Saving…' : 'Save Transaction'}
      </button>
    </BottomSheet>
  )
}
