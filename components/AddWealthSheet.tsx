'use client'
import { useState } from 'react'
import { BottomSheet, SelectableChip } from '@/components/ui'
import { ALL_WEALTH_TYPES } from '@/types'
import { useData } from '@/components/DataProvider'

interface Props { open: boolean; onClose: () => void }

export function AddWealthSheet({ open, onClose }: Props) {
  const { addWealthAccount } = useData()
  const [selectedType, setSelectedType] = useState(ALL_WEALTH_TYPES[0])
  const [name,   setName]   = useState('')
  const [amount, setAmount] = useState('')
  const [notes,  setNotes]  = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const amt = parseFloat(amount)
    if (!amt || !name.trim()) return
    setSaving(true)
    try {
      await addWealthAccount({
        name: name.trim(),
        accountType: selectedType.id,
        typeLabel:   selectedType.label,
        emoji:       selectedType.emoji,
        badgeType:   selectedType.badge as any,
        badgeLabel:  selectedType.badgeLabel,
        amount:      amt,
        isDebt:      selectedType.isDebt,
        notes:       notes.trim(),
      })
      setName(''); setAmount(''); setNotes('')
      setSelectedType(ALL_WEALTH_TYPES[0])
      onClose()
    } finally { setSaving(false) }
  }

  // 3 per row
  const rows = ALL_WEALTH_TYPES.reduce<(typeof ALL_WEALTH_TYPES)[]>((acc, t, i) => {
    if (i % 3 === 0) acc.push([])
    acc[acc.length - 1].push(t)
    return acc
  }, [])

  return (
    <BottomSheet open={open} onClose={onClose} title="Add Account / Asset">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-2 block">Type</label>
          <div className="space-y-2">
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-2">
                {row.map(wt => (
                  <SelectableChip key={wt.id} label={wt.label} emoji={wt.emoji}
                    selected={selectedType.id === wt.id}
                    onClick={() => setSelectedType(wt)} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Name</label>
          <input type="text" placeholder="e.g. Dutch Bangla Bank, Sanchay Patra"
            value={name} onChange={e => setName(e.target.value)} className="input-field" />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Amount (৳)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">৳</span>
            <input type="number" inputMode="decimal" placeholder="0"
              value={amount} onChange={e => setAmount(e.target.value)} className="input-field pl-8" />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500 mb-1 block">Notes (optional)</label>
          <input type="text" placeholder="Account number, maturity date, etc."
            value={notes} onChange={e => setNotes(e.target.value)} className="input-field" />
        </div>
      </div>

      <button onClick={handleSave} disabled={saving || !amount || !name}
        className="btn-primary mt-5 disabled:opacity-40 disabled:cursor-not-allowed">
        {saving ? 'Saving…' : 'Add Account'}
      </button>
    </BottomSheet>
  )
}
