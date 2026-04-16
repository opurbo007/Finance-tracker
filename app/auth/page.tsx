'use client'
import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface RegisterResponse {
  success?: boolean
  error?:   string
}

export default function AuthPage() {
  const router = useRouter()

  const [isLogin,  setIsLogin]  = useState(true)
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (!isLogin) {
        const res  = await fetch('/api/auth/register', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json() as RegisterResponse
        if (!res.ok) { setError(data.error ?? 'Registration failed'); return }
      }
      const result = await signIn('credentials', { email, password, redirect: false })
      if (result?.error) { setError('Invalid email or password'); return }
      router.push('/dashboard')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-dvh flex flex-col items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-120px', left: '50%', transform: 'translateX(-50%)',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(108,99,255,0.18) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '0', right: '-80px',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">

        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl mx-auto mb-5 flex items-center justify-center text-3xl relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1a1040, #0d1a2e)',
              border: '1px solid rgba(108,99,255,0.3)',
              boxShadow: '0 8px 32px rgba(108,99,255,0.3)',
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/icon-192x192.png" alt="" width={80} height={80} className="rounded-3xl" />
          </div>
          <h1
            className="text-3xl font-bold font-display mb-2"
            style={{ color: 'var(--text)' }}
          >
            Finance
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            Your money, beautifully tracked
          </p>
        </div>

        {/* Tab toggle */}
        <div
          className="flex rounded-2xl overflow-hidden mb-6 p-1"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {(['Login', 'Register'] as const).map((label, i) => {
            const active = (i === 0) === isLogin
            return (
              <button
                key={label}
                type="button"
                onClick={() => { setIsLogin(i === 0); setError('') }}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                style={
                  active
                    ? {
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-2))',
                        color: 'white',
                        boxShadow: '0 2px 12px rgba(108,99,255,0.4)',
                      }
                    : { color: 'var(--text-3)' }
                }
              >
                {label}
              </button>
            )
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
              Email address
            </label>
            <input
              id="email" type="email" required autoComplete="email"
              placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
              Password
            </label>
            <input
              id="password" type="password" required minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="••••••••"
              value={password} onChange={e => setPassword(e.target.value)}
              className="input-field"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="text-sm px-4 py-3 rounded-xl"
              style={{ background: 'var(--rose-dim)', color: 'var(--rose)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className="btn-primary mt-5"
          >
            {loading ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
          Secured with MongoDB · Data encrypted at rest
        </p>
      </div>
    </div>
  )
}
