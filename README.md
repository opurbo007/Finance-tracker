# 💰 Finance Tracker — Next.js App

A mobile-first personal finance PWA built with **Next.js 14 App Router**, **MongoDB**, **NextAuth.js**, and **Tailwind CSS**.

---

## ✨ Features

| Screen | What you get |
|--------|-------------|
| **Dashboard** | Greeting, monthly summary, budget bar, today's transactions |
| **Expenses** | All transactions grouped by date with daily net totals |
| **Wealth** | Net worth card, banks, savings, FDR, Sanchay Patra, investments, debts |
| **Analytics** | Monthly totals, daily average, category bar chart |

**PWA** — installable on iOS and Android ("Add to Home Screen")  
**Middleware auth** — single `middleware.ts` protects all routes, no per-page redirects  
**Fully type-safe** — zero `as any`, strict tsconfig, typed NextAuth session  
**MongoDB** — Mongoose schemas with indexes, connection pooling  

---

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure
cp .env.local.example .env.local
# → Fill in MONGODB_URI, NEXTAUTH_SECRET, NEXTAUTH_URL

# 3. Dev server
npm run dev
# → Open http://localhost:3000
```

### Environment variables

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB connection string (Atlas or local) |
| `NEXTAUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` | App URL (`http://localhost:3000` in dev) |

---

## 🏗 Architecture

```
finance-nextjs/
├── middleware.ts              ← Single auth guard for all routes
├── types/
│   ├── index.ts              ← Transaction, WealthAccount, categories
│   ├── next-auth.d.ts        ← Session type augmentation (no as any)
│   └── env.d.ts              ← process.env types
├── lib/
│   ├── auth.ts               ← NextAuthOptions (typed)
│   ├── get-auth-user.ts      ← getAuthUserId() helper
│   ├── models.ts             ← Mongoose schemas
│   ├── mongodb.ts            ← Typed global connection cache
│   └── utils.ts              ← formatBdt, formatDate, greeting
├── app/
│   ├── manifest.ts           ← PWA manifest (MetadataRoute.Manifest)
│   ├── layout.tsx            ← Root layout + full icon metadata
│   ├── api/
│   │   ├── auth/[...nextauth]/  ← NextAuth handler
│   │   ├── auth/register/       ← User registration
│   │   ├── transactions/        ← GET | POST | DELETE
│   │   └── wealth-accounts/     ← GET | POST | DELETE | PATCH
│   ├── auth/page.tsx         ← Login / Register
│   ├── dashboard/            ← Dashboard screen
│   ├── expenses/             ← All transactions screen
│   ├── wealth/               ← Wealth overview screen
│   └── analytics/            ← Analytics + chart screen
├── components/
│   ├── DataProvider.tsx      ← Global typed data context
│   ├── AddTransactionSheet.tsx
│   ├── AddWealthSheet.tsx    ← toBadgeType() — no unsafe cast
│   ├── layout/AppShell.tsx   ← Bottom nav + FAB
│   └── ui/index.tsx          ← Cards, chips, bars, spinner
└── public/
    ├── favicon.ico
    └── icons/                ← 10 PNG sizes + SVG + apple-touch-icon
```

---

## 🔒 Auth Flow (middleware)

```
Request
  └─ middleware.ts (runs on every non-static path)
       ├─ Public path? (/auth, /api/auth/**, /icons/**)  → allow
       ├─ Has valid JWT token + hitting /auth or /?      → redirect /dashboard
       └─ No token + protected path?                     → redirect /auth
```

No `getServerSession()` calls in layouts — all handled centrally.

---

## 📱 Install as PWA

**iOS Safari:** Share button → "Add to Home Screen"  
**Android Chrome:** Menu (⋮) → "Add to Home Screen" or "Install app"

The app will launch in standalone mode (no browser chrome) with the correct splash icon.

---

## 🚢 Deploy to Vercel

```bash
npx vercel
```

Add these env vars in the Vercel dashboard:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`  
- `NEXTAUTH_URL` → your production URL

---

## 🛠 Tech Stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | MongoDB + Mongoose |
| Auth | NextAuth.js v4 (credentials, JWT) |
| Styling | Tailwind CSS + CSS custom properties |
| Font | DM Sans (Google Fonts) |
| Icons | Lucide React |
| Language | TypeScript (strict + noUncheckedIndexedAccess) |
