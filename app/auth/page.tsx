'use client'
import { useState, FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      if (!isLogin) {
        const res = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok) { setError(data.error); return }
      }
      const res = await signIn('credentials', { email, password, redirect: false })
      if (res?.error) { setError('Invalid email or password'); return }
      router.push('/dashboard')
    } catch { setError('Something went wrong. Please try again.') }
    finally  { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F7F8FA]">
      <div className="w-full max-w-sm animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm"
            style={{ background: 'var(--blue)' }}>
            💰
          </div>
          <h1 className="text-2xl font-semibold text-gray-900">Finance Tracker</h1>
          <p className="text-sm text-gray-400 mt-1">Track your money, grow your wealth</p>
        </div>

        {/* Tab toggle */}
        <div className="flex rounded-xl overflow-hidden border border-black/10 mb-6 bg-white">
          {['Login', 'Register'].map((t, i) => (
            <button key={t} type="button"
              onClick={() => { setIsLogin(i === 0); setError('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${
                (i === 0) === isLogin
                  ? 'text-white rounded-xl'
                  : 'text-gray-400'
              }`}
              style={(i === 0) === isLogin ? { background: 'var(--blue)' } : {}}>
              {t}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
            <input type="email" required placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="input-field" autoComplete="email" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Password</label>
            <input type="password" required placeholder="••••••••" minLength={6}
              value={password} onChange={e => setPassword(e.target.value)}
              className="input-field" autoComplete={isLogin ? 'current-password' : 'new-password'} />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="btn-primary mt-4 disabled:opacity-50">
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Your data is securely stored in MongoDB and encrypted.
        </p>
      </div>
    </div>
  )
}
