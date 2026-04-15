'use client'
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useSession } from 'next-auth/react'
import type { Transaction, WealthAccount } from '@/types'

interface DataContextType {
  transactions:   Transaction[]
  wealthAccounts: WealthAccount[]
  loading:        boolean
  addTransaction: (data: Omit<Transaction, '_id' | 'userId' | 'createdAt'>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  addWealthAccount: (data: Omit<WealthAccount, '_id' | 'userId' | 'createdAt'>) => Promise<void>
  deleteWealthAccount: (id: string) => Promise<void>
  updateWealthAmount: (id: string, amount: number) => Promise<void>
  refresh: () => Promise<void>
}

const DataContext = createContext<DataContextType | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [transactions,   setTransactions]   = useState<Transaction[]>([])
  const [wealthAccounts, setWealthAccounts] = useState<WealthAccount[]>([])
  const [loading, setLoading] = useState(false)

  const fetchAll = useCallback(async () => {
    if (status !== 'authenticated') return
    setLoading(true)
    try {
      const [txRes, wRes] = await Promise.all([
        fetch('/api/transactions'),
        fetch('/api/wealth-accounts'),
      ])
      if (txRes.ok) setTransactions(await txRes.json())
      if (wRes.ok)  setWealthAccounts(await wRes.json())
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => { fetchAll() }, [fetchAll])

  const addTransaction = async (data: Omit<Transaction, '_id' | 'userId' | 'createdAt'>) => {
    const res = await fetch('/api/transactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const tx  = await res.json()
    setTransactions(prev => [tx, ...prev])
  }

  const deleteTransaction = async (id: string) => {
    await fetch('/api/transactions', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setTransactions(prev => prev.filter(t => t._id !== id))
  }

  const addWealthAccount = async (data: Omit<WealthAccount, '_id' | 'userId' | 'createdAt'>) => {
    const res = await fetch('/api/wealth-accounts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    const acc = await res.json()
    setWealthAccounts(prev => [...prev, acc])
  }

  const deleteWealthAccount = async (id: string) => {
    await fetch('/api/wealth-accounts', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setWealthAccounts(prev => prev.filter(a => a._id !== id))
  }

  const updateWealthAmount = async (id: string, amount: number) => {
    await fetch('/api/wealth-accounts', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, amount }) })
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

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
