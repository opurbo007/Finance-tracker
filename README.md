# 💰 Finance Tracker — Next.js App

A mobile-first personal finance web app built with **Next.js 14**, **MongoDB**, and **Tailwind CSS**.
Same great UI as the Android app — fully responsive, works beautifully on phones.

---

## ✨ Features

| Screen     | What you get |
|------------|-------------|
| **Dashboard** | Greeting, monthly income/expense summary, budget progress bar, today's transactions |
| **Expenses**  | All transactions grouped by date with daily net totals |
| **Wealth**    | Net worth hero card, bank accounts, savings, FDR, Sanchay Patra, investments, debts |
| **Analytics** | Monthly totals, daily average spend, spending by category bar chart |

**Auth:** Email + password registration & login via NextAuth.js  
**Database:** MongoDB (Atlas or self-hosted) via Mongoose  
**Mobile-first:** Bottom nav, FAB button, bottom sheets — feels like a native app

---

## 🚀 Quick Start

### 1. Install dependencies
```bash
cd finance-nextjs
npm install
```

### 2. Set up MongoDB Atlas (free)
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Create free cluster
2. **Database Access** → Add user with read/write access
3. **Network Access** → Add `0.0.0.0/0` (allow all) or your IP
4. **Connect** → Drivers → Copy connection string

### 3. Configure environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/financeapp
NEXTAUTH_SECRET=run-openssl-rand-base64-32-and-paste-here
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret:
```bash
openssl rand -base64 32
```

### 4. Run
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📁 Project Structure

```
finance-nextjs/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/  ← NextAuth handler
│   │   ├── auth/register/       ← User registration
│   │   ├── transactions/        ← CRUD for transactions
│   │   └── wealth-accounts/     ← CRUD for wealth accounts
│   ├── auth/                    ← Login / Register page
│   ├── dashboard/               ← Dashboard page
│   ├── expenses/                ← All transactions page
│   ├── wealth/                  ← Wealth overview page
│   ├── analytics/               ← Analytics & charts page
│   ├── globals.css              ← Design tokens + Tailwind
│   ├── layout.tsx               ← Root layout
│   └── providers.tsx            ← Session + Data providers
├── components/
│   ├── DataProvider.tsx         ← Global data context (CRUD + state)
│   ├── AddTransactionSheet.tsx  ← Bottom sheet for adding transactions
│   ├── AddWealthSheet.tsx       ← Bottom sheet for adding wealth accounts
│   ├── layout/AppShell.tsx      ← Bottom nav + FAB shell
│   └── ui/index.tsx             ← Reusable UI components
├── lib/
│   ├── mongodb.ts               ← DB connection
│   ├── models.ts                ← Mongoose schemas
│   ├── auth.ts                  ← NextAuth config
│   └── utils.ts                 ← Formatting helpers
└── types/index.ts               ← TypeScript types + constants
```

---

## 🚢 Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard:
- `MONGODB_URI`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` → your Vercel URL (e.g. `https://finance.vercel.app`)

---

## 🛠️ Tech Stack

| Layer       | Tech |
|-------------|------|
| Framework   | Next.js 14 (App Router) |
| Database    | MongoDB + Mongoose |
| Auth        | NextAuth.js (credentials) |
| Styling     | Tailwind CSS + CSS variables |
| Font        | DM Sans (Google Fonts) |
| Icons       | Lucide React |
| Language    | TypeScript |

---

## 📱 Mobile Usage

The app is designed mobile-first:
- Add to home screen on iOS: Share → "Add to Home Screen"
- Add to home screen on Android: Menu → "Add to Home Screen"
- Works offline for viewing (add PWA support for full offline)
# Finance-tracker
