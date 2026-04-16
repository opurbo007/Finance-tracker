import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: { default: 'Finance Tracker', template: '%s · Finance' },
  description: 'Track your daily expenses, income, and wealth — beautifully.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, title: 'Finance', statusBarStyle: 'black-translucent' },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png',   sizes: '32x32',   type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/icon.svg',                           type: 'image/svg+xml' },
    ],
    apple: '/icons/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: { title: 'Finance Tracker', description: 'Track your money, grow your wealth.', type: 'website' },
}

export const viewport: Viewport = {
  width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0A0A0F' },
    { media: '(prefers-color-scheme: dark)',  color: '#0A0A0F' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Syne (display) + Outfit (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
