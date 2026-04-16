import { AppShell } from '@/components/layout/AppShell'
import type { ReactNode } from 'react'

// Auth protection is handled entirely by middleware.ts
export default function AppLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>
}

