'use client'
import {
  createContext, useContext, useEffect,
  useState, useCallback, type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import type { Transaction, WealthAccount } from '@/types'

// ─── Context type ─────────────────────────────────────────────────────────────

interface DataContextType {
  transactions:        Transaction[]
  wealthAccounts:      WealthAccount[]
  loading:             boolean
  addTransaction:      (data: NewTransaction)      => Promise<void>
  deleteTransaction:   (id: string)                => Promise<void>
  addWealthAccount:    (data: NewWealthAccount)    => Promise<void>
  deleteWealthAccount: (id: string)                => Promise<void>
  updateWealthAmount:  (id: string, amount: number) => Promise<void>
  refresh:             ()                          => Promise<void>
}

type NewTransaction   = Omit<Transaction,   '_id' | 'userId' | 'createdAt'>
type NewWealthAccount = Omit<WealthAccount, '_id' | 'userId' | 'createdAt'>

// ─── Helpers ──────────────────────────────────────────────────────────────────

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: JSON_HEADERS, ...init })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string }
    throw new Error(err.error ?? 'Request failed')
  }
  return res.json() as Promise<T>
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()

  const [transactions,   setTransactions]   = useState<Transaction[]>([])
  const [wealthAccounts, setWealthAccounts] = useState<WealthAccount[]>([])
  const [loading,        setLoading]        = useState(false)

  // ── Fetch all ──────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoading(true)
    try {
      const [txs, accounts] = await Promise.all([
        apiFetch<Transaction[]>('/api/transactions'),
        apiFetch<WealthAccount[]>('/api/wealth-accounts'),
      ])
      setTransactions(txs)
      setWealthAccounts(accounts)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { void fetchAll() }, [fetchAll])

  // ── Transactions ───────────────────────────────────────────────────────────
  const addTransaction = async (data: NewTransaction) => {
    const tx = await apiFetch<Transaction>('/api/transactions', {
      method: 'POST',
      body:   JSON.stringify(data),
    })
    setTransactions(prev => [tx, ...prev])
  }

  const deleteTransaction = async (id: string) => {
    await apiFetch<{ success: true }>('/api/transactions', {
      method: 'DELETE',
      body:   JSON.stringify({ id }),
    })
    setTransactions(prev => prev.filter(t => t._id !== id))
  }

  // ── Wealth accounts ────────────────────────────────────────────────────────
  const addWealthAccount = async (data: NewWealthAccount) => {
    const acc = await apiFetch<WealthAccount>('/api/wealth-accounts', {
      method: 'POST',
      body:   JSON.stringify(data),
    })
    setWealthAccounts(prev => [...prev, acc])
  }

  const deleteWealthAccount = async (id: string) => {
    await apiFetch<{ success: true }>('/api/wealth-accounts', {
      method: 'DELETE',
      body:   JSON.stringify({ id }),
    })
    setWealthAccounts(prev => prev.filter(a => a._id !== id))
  }

  const updateWealthAmount = async (id: string, amount: number) => {
    await apiFetch<{ success: true }>('/api/wealth-accounts', {
      method: 'PATCH',
      body:   JSON.stringify({ id, amount }),
    })
    setWealthAccounts(prev => prev.map(a => a._id === id ? { ...a, amount } : a))
  }

  return (
    <DataContext.Provider value={{
      transactions, wealthAccounts, loading,
      addTransaction, deleteTransaction,
      addWealthAccount, deleteWealthAccount, updateWealthAmount,
      refresh: fetchAll,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData(): DataContextType {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within <DataProvider>')
  return ctx
}
