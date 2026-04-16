'use client'
import { useEffect, useState } from 'react'

// BeforeInstallPromptEvent is not in lib.dom — extend it here
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showBanner,    setShowBanner]    = useState(false)
  const [swReady,       setSwReady]       = useState(false)

  // ── Register service worker ─────────────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // Register on load — avoids blocking interactive time
    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',   // always check for SW updates
        })
        setSwReady(true)

        // Check for waiting SW (new version available)
        if (reg.waiting) {
          notifyUpdate(reg)
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdate(reg)
            }
          })
        })
      } catch (err) {
        console.error('[SW] Registration failed:', err)
      }
    }

    if (document.readyState === 'complete') {
      void register()
    } else {
      window.addEventListener('load', () => { void register() }, { once: true })
    }
  }, [])

  // ── Capture install prompt (Chrome/Android) ─────────────────────────────
  useEffect(() => {
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()  // prevent default mini-infobar
      setInstallPrompt(e)

      // Only show banner if not already installed
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

      if (!isStandalone) {
        // Delay a few seconds so it doesn't interrupt page load
        setTimeout(() => setShowBanner(true), 3000)
      }
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  // ── Handle app installed ─────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => {
      setShowBanner(false)
      setInstallPrompt(null)
    }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  // ── Trigger install prompt ───────────────────────────────────────────────
  async function handleInstall() {
    if (!installPrompt) return
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') {
      setShowBanner(false)
      setInstallPrompt(null)
    }
  }

  if (!showBanner) return null

  return (
    <div
      role="banner"
      aria-label="Install Finance app"
      style={{
        position:   'fixed',
        bottom:     'calc(80px + env(safe-area-inset-bottom, 0px))',
        left:       '50%',
        transform:  'translateX(-50%)',
        width:      'calc(100% - 32px)',
        maxWidth:   448,
        zIndex:     100,
        background: 'linear-gradient(135deg, #1a1040 0%, #0d1628 100%)',
        border:     '1px solid rgba(108,99,255,0.35)',
        borderRadius: 18,
        padding:    '14px 16px',
        display:    'flex',
        alignItems: 'center',
        gap:        12,
        boxShadow:  '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,99,255,0.15)',
        animation:  'slideUpBanner 0.4s cubic-bezier(0.32,0.72,0,1)',
      }}
    >
      <style>{`
        @keyframes slideUpBanner {
          from { opacity: 0; transform: translateX(-50%) translateY(16px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Icon */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-96x96.png"
        alt=""
        width={40} height={40}
        style={{ borderRadius: 10, flexShrink: 0 }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#F1F1F5', margin: 0 }}>
          Install Finance
        </p>
        <p style={{ fontSize: 11, color: 'rgba(241,241,245,0.45)', margin: '2px 0 0', lineHeight: 1.4 }}>
          Add to home screen for the best experience
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setShowBanner(false)}
        aria-label="Dismiss"
        style={{
          width: 28, height: 28, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.08)', color: 'rgba(241,241,245,0.5)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}
      >
        ×
      </button>

      {/* Install CTA */}
      <button
        onClick={() => { void handleInstall() }}
        style={{
          padding: '8px 14px', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg, #6C63FF, #8B5CF6)',
          color: 'white', fontSize: 13, fontWeight: 600,
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 2px 12px rgba(108,99,255,0.4)',
        }}
      >
        Install
      </button>
    </div>
  )
}

// ── Update notification helper ───────────────────────────────────────────────
function notifyUpdate(reg: ServiceWorkerRegistration) {
  // Skip waiting → new SW takes over immediately on next navigation
  reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
  // Reload once the new SW controls the page
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  }, { once: true })
}
