'use client'
import { useState, type ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Receipt, Landmark, BarChart2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { AddWealthSheet } from '@/components/AddWealthSheet'

const NAV = [
  { href: '/dashboard', label: 'Home',     icon: LayoutDashboard },
  { href: '/expenses',  label: 'Expenses', icon: Receipt },
  { href: '/wealth',    label: 'Wealth',   icon: Landmark },
  { href: '/analytics', label: 'Stats',    icon: BarChart2 },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()

  const [showTxSheet, setShowTxSheet] = useState(false)
  const [showWSheet,  setShowWSheet]  = useState(false)

  function handleFab() {
    if (pathname === '/wealth') setShowWSheet(true)
    else setShowTxSheet(true)
  }

  return (
    <div className="flex flex-col min-h-dvh max-w-[480px] mx-auto">

      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-28">
        {children}
      </main>

      {/* Bottom nav bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 max-w-[480px] mx-auto"
        style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
      >
        {/* Blur backdrop */}
        <div
          className="absolute inset-0 rounded-t-3xl"
          style={{
            background: 'rgba(10,10,15,0.85)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        />

        <div className="relative flex items-center px-3 pt-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <button
                key={href}
                onClick={() => router.push(href)}
                className={cn('nav-tab', active && 'active')}
              >
                <Icon size={20} strokeWidth={active ? 2 : 1.6} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* FAB */}
      <button
        onClick={handleFab}
        aria-label="Add"
        className="fixed bottom-[76px] right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center text-white transition-transform active:scale-95 md:right-[calc(50%-216px)]"
        style={{
          background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
          boxShadow: '0 4px 24px rgba(108,99,255,0.5), 0 0 0 1px rgba(108,99,255,0.3)',
        }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      <AddTransactionSheet open={showTxSheet} onClose={() => setShowTxSheet(false)} />
      <AddWealthSheet      open={showWSheet}  onClose={() => setShowWSheet(false)} />
    </div>
  )
}
