'use client'
import { useState, useEffect } from 'react'
import { BottomSheet, SelectableChip } from '@/components/ui'
import { ALL_WEALTH_TYPES, type WealthAccount } from '@/types'
import { useData } from '@/components/DataProvider'

interface Props {
  open:        boolean
  onClose:     () => void
  /** When provided, sheet operates in edit mode */
  editAccount?: WealthAccount | null
}

const VALID_BADGE_TYPES = new Set<WealthAccount['badgeType']>([
  'liquid', 'secure', 'invest', 'cash', 'debt',
])

function toBadgeType(raw: string): WealthAccount['badgeType'] {
  return VALID_BADGE_TYPES.has(raw as WealthAccount['badgeType'])
    ? (raw as WealthAccount['badgeType'])
    : 'liquid'
}

export function AddWealthSheet({ open, onClose, editAccount }: Props) {
  const { addWealthAccount, updateWealthAccount } = useData()
  const isEdit = !!editAccount

  const [selectedType, setSelectedType] = useState(ALL_WEALTH_TYPES[0]!)
  const [name,   setName]   = useState('')
  const [amount, setAmount] = useState('')
  const [notes,  setNotes]  = useState('')
  const [saving, setSaving] = useState(false)

  // Populate fields when editing
  useEffect(() => {
    if (editAccount) {
      const wt = ALL_WEALTH_TYPES.find(t => t.id === editAccount.accountType) ?? ALL_WEALTH_TYPES[0]!
      setSelectedType(wt)
      setName(editAccount.name)
      setAmount(String(editAccount.amount))
      setNotes(editAccount.notes)
    } else {
      setSelectedType(ALL_WEALTH_TYPES[0]!)
      setName('')
      setAmount('')
      setNotes('')
    }
  }, [editAccount, open])

  async function handleSave() {
    const amt = parseFloat(amount)
    if (!amt || !name.trim()) return
    setSaving(true)
    try {
      if (isEdit && editAccount) {
        await updateWealthAccount(editAccount._id, {
          name:        name.trim(),
          accountType: selectedType.id,
          typeLabel:   selectedType.label,
          emoji:       selectedType.emoji,
          badgeType:   toBadgeType(selectedType.badge),
          badgeLabel:  selectedType.badgeLabel,
          amount:      amt,
          isDebt:      selectedType.isDebt,
          notes:       notes.trim(),
        })
      } else {
        await addWealthAccount({
          name:        name.trim(),
          accountType: selectedType.id,
          typeLabel:   selectedType.label,
          emoji:       selectedType.emoji,
          badgeType:   toBadgeType(selectedType.badge),
          badgeLabel:  selectedType.badgeLabel,
          amount:      amt,
          isDebt:      selectedType.isDebt,
          notes:       notes.trim(),
        })
      }
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const rows = ALL_WEALTH_TYPES.reduce<(typeof ALL_WEALTH_TYPES)[]>((acc, t, i) => {
    if (i % 3 === 0) acc.push([])
    acc[acc.length - 1]!.push(t)
    return acc
  }, [])

  return (
    <BottomSheet open={open} onClose={onClose} title={isEdit ? 'Edit Account' : 'Add Account / Asset'}>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--text-3)' }}>Type</label>
          <div className="space-y-2">
            {rows.map((row, ri) => (
              <div key={ri} className="grid grid-cols-3 gap-2">
                {row.map(wt => (
                  <SelectableChip key={wt.id} label={wt.label} emoji={wt.emoji}
                    selected={selectedType.id === wt.id} onClick={() => setSelectedType(wt)} />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="w-name" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
            Name
          </label>
          <input id="w-name" type="text" placeholder="e.g. Dutch Bangla Bank, Sanchay Patra"
            value={name} onChange={e => setName(e.target.value)} className="input-field" />
        </div>

        <div>
          <label htmlFor="w-amount" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
            Amount (৳)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base font-medium select-none"
              style={{ color: 'var(--text-3)' }}>৳</span>
            <input id="w-amount" type="number" inputMode="decimal" placeholder="0"
              value={amount} onChange={e => setAmount(e.target.value)} className="input-field pl-8" />
          </div>
        </div>

        <div>
          <label htmlFor="w-notes" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
            Notes <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>(optional)</span>
          </label>
          <input id="w-notes" type="text" placeholder="Account number, maturity date, etc."
            value={notes} onChange={e => setNotes(e.target.value)} className="input-field" />
      </div>
      </div>

      <button type="button" onClick={handleSave} disabled={saving || !amount || !name}
        className="btn-primary mt-5">
        {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Account'}
      </button>
    </BottomSheet>
  )
}
