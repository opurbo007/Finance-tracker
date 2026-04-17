'use client'
import { useEffect, useState, useRef } from 'react'

// ── Type augmentation ────────────────────────────────────────────────────────
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent
  }
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

// ── Inline script — must run synchronously before React ──────────────────────
// This is injected into <head> as a raw string (see layout.tsx).
// It captures beforeinstallprompt the moment Chrome fires it,
// which can happen before any React code runs.
export const PWA_INLINE_SCRIPT = `
(function(){
  window.__pwaInstallPrompt = undefined;
  window.addEventListener('beforeinstallprompt', function(e) {
    e.preventDefault();
    window.__pwaInstallPrompt = e;
  });
})();
`

// ── React component ──────────────────────────────────────────────────────────
export function PwaRegister() {
  const [showBanner, setShowBanner] = useState(false)
  const promptRef   = useRef<BeforeInstallPromptEvent | null>(null)

  // ── Register service worker ────────────────────────────────────────────────
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    const doRegister = async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', {
          scope:          '/',
          updateViaCache: 'none',
        })
      } catch (err) {
        console.error('[SW] Registration failed:', err)
      }
    }

    // Register immediately — do not wait for 'load' event.
    // Waiting causes the SW to miss the current navigation,
    // which means Chrome won't count this visit toward installability.
    void doRegister()
  }, [])

  // ── Pick up the install prompt (may already be on window) ─────────────────
  useEffect(() => {
    function pickUpPrompt() {
      // Case 1: event already fired before React mounted
      if (window.__pwaInstallPrompt) {
        promptRef.current = window.__pwaInstallPrompt
        window.__pwaInstallPrompt = undefined
        showInstallBanner()
        return
      }
      // Case 2: event fires after React mounted (rare — slow devices)
      const handler = (e: BeforeInstallPromptEvent) => {
        e.preventDefault()
        promptRef.current = e
        showInstallBanner()
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    const cleanup = pickUpPrompt()
    return cleanup
  }, [])

  // ── Hide banner once installed ─────────────────────────────────────────────
  useEffect(() => {
    const handler = () => { setShowBanner(false); promptRef.current = null }
    window.addEventListener('appinstalled', handler)
    return () => window.removeEventListener('appinstalled', handler)
  }, [])

  function showInstallBanner() {
    // Don't show if already running in standalone/TWA
    const isInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

    if (!isInstalled) setShowBanner(true)
  }

  async function handleInstall() {
    const prompt = promptRef.current
    if (!prompt) return
    try {
      await prompt.prompt()
      const { outcome } = await prompt.userChoice
      if (outcome === 'accepted') {
        setShowBanner(false)
        promptRef.current = null
      }
    } catch {
      // User dismissed or prompt already used — ignore
    }
  }

  if (!showBanner) return null

  return (
    <div
      role="complementary"
      aria-label="Install Finance app"
      style={{
        position:     'fixed',
        bottom:       'calc(88px + env(safe-area-inset-bottom, 0px))',
        left:         '50%',
        transform:    'translateX(-50%)',
        width:        'calc(100% - 32px)',
        maxWidth:     448,
        zIndex:       9999,
        background:   'linear-gradient(135deg, #1a1040 0%, #0d1628 100%)',
        border:       '1px solid rgba(108,99,255,0.4)',
        borderRadius: 18,
        padding:      '13px 14px',
        display:      'flex',
        alignItems:   'center',
        gap:          11,
        boxShadow:    '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(108,99,255,0.15)',
        animation:    'pwaBannerIn 0.4s cubic-bezier(0.32,0.72,0,1) both',
      }}
    >
      <style>{`
        @keyframes pwaBannerIn {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-96x96.png" alt=""
        width={40} height={40}
        style={{ borderRadius: 10, flexShrink: 0 }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#F1F1F5', margin: 0, fontFamily: "'Syne', sans-serif" }}>
          Install Finance
        </p>
        <p style={{ fontSize: 11, color: 'rgba(241,241,245,0.4)', margin: '1px 0 0', lineHeight: 1.4 }}>
          Add to home screen — works offline too
        </p>
      </div>

      <button
        onClick={() => setShowBanner(false)}
        aria-label="Dismiss install banner"
        style={{
          width: 26, height: 26, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.07)', color: 'rgba(241,241,245,0.4)',
          cursor: 'pointer', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: 18, flexShrink: 0, lineHeight: 1,
        }}
      >
        ×
      </button>

      <button
        onClick={() => { void handleInstall() }}
        style={{
          padding:      '9px 16px',
          borderRadius: 10,
          border:       'none',
          background:   'linear-gradient(135deg, #6C63FF, #8B5CF6)',
          color:        'white',
          fontSize:     13,
          fontWeight:   600,
          cursor:       'pointer',
          flexShrink:   0,
          fontFamily:   "'Outfit', sans-serif",
          boxShadow:    '0 2px 12px rgba(108,99,255,0.45)',
          whiteSpace:   'nowrap',
        }}
      >
        Install
      </button>
    </div>
  )
}

// ── SW update notifier ───────────────────────────────────────────────────────
export function notifySwUpdate(reg: ServiceWorkerRegistration) {
  reg.waiting?.postMessage({ type: 'SKIP_WAITING' })
  navigator.serviceWorker.addEventListener(
    'controllerchange',
    () => window.location.reload(),
    { once: true }
  )
}
