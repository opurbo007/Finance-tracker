import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/** Returns the authenticated user's ID, or null if not logged in. */
export async function getAuthUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}
