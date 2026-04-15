'use client'
import { useState, ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Receipt, Landmark, BarChart2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AddTransactionSheet } from '@/components/AddTransactionSheet'
import { AddWealthSheet } from '@/components/AddWealthSheet'

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/expenses',   label: 'Expenses',  icon: Receipt },
  { href: '/wealth',     label: 'Wealth',    icon: Landmark },
  { href: '/analytics',  label: 'Analytics', icon: BarChart2 },
]

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [fabOpen,     setFabOpen]     = useState(false)
  const [showTxSheet, setShowTxSheet] = useState(false)
  const [showWSheet,  setShowWSheet]  = useState(false)

  function handleFabAction() {
    setFabOpen(false)
    if (pathname === '/wealth') setShowWSheet(true)
    else setShowTxSheet(true)
  }

  return (
    <div className="flex flex-col min-h-screen max-w-lg mx-auto relative">
      {/* Page content */}
      <main className="flex-1 overflow-y-auto pb-24">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-lg mx-auto">
        <div className="bg-white/95 backdrop-blur-md border-t border-black/[0.06] px-2 pt-2 pb-safe">
          <div className="flex items-center justify-around">
            {NAV.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <button key={href} onClick={() => router.push(href)}
                  className={cn('nav-tab flex-1', active && 'active')}>
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* FAB */}
      <button
        onClick={handleFabAction}
        className="fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-transform active:scale-95 md:right-[calc(50%-192px)]"
        style={{ background: 'var(--blue)' }}
        aria-label="Add"
      >
        <Plus size={26} />
      </button>

      {/* Sheets */}
      <AddTransactionSheet open={showTxSheet} onClose={() => setShowTxSheet(false)} />
      <AddWealthSheet      open={showWSheet}  onClose={() => setShowWSheet(false)} />
    </div>
  )
}
