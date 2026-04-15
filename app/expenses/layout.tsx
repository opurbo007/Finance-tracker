import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import type { ReactNode } from 'react'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/auth')
  return <AppShell>{children}</AppShell>
}
