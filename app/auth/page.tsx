'use client'
import { useEffect, useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { BadgeDollarSign, ChevronLeft, ShieldCheck, TrendingUp } from 'lucide-react'

interface AuthResponse {
  success?: boolean
  error?: string
  message?: string
}

type AuthMode = 'login' | 'register' | 'forgot'

export default function AuthPage() {
  const router = useRouter()

  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'
  const hasResetToken = isForgot && Boolean(resetToken)

  useEffect(() => {
    function applyResetTokenFromUrl() {
      const token = new URLSearchParams(window.location.search).get('resetToken')
      if (!token) return
      setMode('forgot')
      setResetToken(token)
      setError('')
      setNotice('')
    }

    applyResetTokenFromUrl()
    window.addEventListener('popstate', applyResetTokenFromUrl)
    window.addEventListener('focus', applyResetTokenFromUrl)
    return () => {
      window.removeEventListener('popstate', applyResetTokenFromUrl)
      window.removeEventListener('focus', applyResetTokenFromUrl)
    }
  }, [])

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('resetToken')
    if (!token || (mode === 'forgot' && resetToken === token)) return
    setMode('forgot')
    setResetToken(token)
    setError('')
    setNotice('')
  }, [mode, resetToken])

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    setNotice('')
    setPassword('')
    setConfirmPassword('')
    if (nextMode !== 'forgot') setResetToken('')
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setNotice('')

    if (hasResetToken && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      if (isForgot) {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            hasResetToken
              ? { action: 'reset', token: resetToken, password }
              : { action: 'request', email },
          ),
        })
        const data = await res.json() as AuthResponse
        if (!res.ok) { setError(data.error ?? 'Password reset failed'); return }
        setNotice(data.message ?? (hasResetToken ? 'Password updated. You can sign in now.' : 'Reset link sent. Check your email.'))
        if (!hasResetToken) return
        window.history.replaceState(null, '', '/auth')
        setMode('login')
        setResetToken('')
        setPassword('')
        setConfirmPassword('')
        return
      }

      if (isRegister) {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json() as AuthResponse
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
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.95), transparent 32rem)',
        }}
      />

      <div className="w-full max-w-sm relative z-10 animate-fade-up">
        <div className="text-center mb-10">
          <div
            className="w-24 h-24 rounded-[30px] mx-auto mb-5 flex items-center justify-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(145deg, #f8f8f8, #e7e7e7)',
              border: '1px solid rgba(255,255,255,0.9)',
              boxShadow: 'var(--shadow-raised)',
            }}
          >
            <div
              className="absolute inset-3 rounded-[24px]"
              style={{ boxShadow: 'var(--shadow-pressed)' }}
            />
            <div
              className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(145deg, #ff6971, #ec4651)',
                color: '#ffffff',
                boxShadow: '5px 5px 12px rgba(205,72,79,0.28), -5px -5px 12px rgba(255,255,255,0.84)',
              }}
            >
              <BadgeDollarSign size={28} strokeWidth={2.2} />
            </div>
            <div
              className="absolute right-4 top-4 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', color: 'var(--emerald)', boxShadow: 'var(--shadow-soft)' }}
            >
              <TrendingUp size={15} strokeWidth={2.2} />
            </div>
            <div
              className="absolute left-4 bottom-4 w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--surface)', color: 'var(--accent)', boxShadow: 'var(--shadow-soft)' }}
            >
              <ShieldCheck size={14} strokeWidth={2.2} />
            </div>
          </div>

          <h1
            className="text-3xl font-bold font-display mb-2"
            style={{ color: 'var(--text)' }}
          >
            {isForgot ? 'Reset Password' : 'Finance'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {hasResetToken ? 'Create a new password for your account' : isForgot ? 'We will email you a secure reset link' : 'Your money, beautifully tracked'}
          </p>
        </div>

        {isForgot ? (
          <button
            type="button"
            onClick={() => switchMode('login')}
            className="secondary-action mb-6"
          >
            <ChevronLeft size={16} />
            <span>Back to sign in</span>
          </button>
        ) : (
          <div
            className="flex rounded-2xl overflow-hidden mb-6 p-1"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-pressed)' }}
          >
            {(['Login', 'Register'] as const).map((label) => {
              const nextMode: AuthMode = label === 'Login' ? 'login' : 'register'
              const active = mode === nextMode
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => switchMode(nextMode)}
                  className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all"
                  style={
                    active
                      ? {
                          background: 'linear-gradient(145deg, #ff6971, #ec4651)',
                          color: '#ffffff',
                          boxShadow: 'var(--shadow-soft)',
                        }
                      : { color: 'var(--text-3)' }
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3" noValidate>
          <div>
            <label htmlFor="email" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              required={!hasResetToken}
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="input-field"
              disabled={hasResetToken}
            />
          </div>

          {(!isForgot || hasResetToken) && (
            <div>
              <label htmlFor="password" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
                {hasResetToken ? 'New password' : 'Password'}
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {hasResetToken && (
            <div>
              <label htmlFor="confirm-password" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-3)' }}>
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="********"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="input-field"
              />
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => switchMode('forgot')}
                className="text-xs font-semibold transition-colors"
                style={{ color: 'var(--accent-strong)' }}
              >
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="text-sm px-4 py-3 rounded-xl"
              style={{ background: 'var(--rose-dim)', color: 'var(--rose)', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              {error}
            </div>
          )}

          {notice && (
            <div
              role="status"
              className="text-sm px-4 py-3 rounded-xl"
              style={{ background: 'var(--emerald-dim)', color: 'var(--emerald)', border: '1px solid rgba(50,184,121,0.2)' }}
            >
              {notice}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (hasResetToken ? !password || !confirmPassword : !email || (!isForgot && !password))}
            className="btn-primary mt-5"
          >
            {loading ? 'Please wait...' : hasResetToken ? 'Update password' : isForgot ? 'Email reset link' : isLogin ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--text-3)' }}>
          Secured with MongoDB - Data encrypted at rest
        </p>
      </div>
    </div>
  )
}
