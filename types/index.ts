export interface Transaction {
  _id: string
  userId: string
  type: 'expense' | 'income'
  amount: number
  description: string
  category: string
  categoryEmoji: string
  paymentMethod: string
  date: string          // YYYY-MM-DD
  createdAt: number
}

export interface WealthAccount {
  _id: string
  userId: string
  name: string
  accountType: string
  typeLabel: string
  emoji: string
  badgeType: 'liquid' | 'secure' | 'invest' | 'cash' | 'debt'
  badgeLabel: string
  amount: number
  isDebt: boolean
  notes: string
  createdAt: number
}

export interface Category {
  id: string
  label: string
  emoji: string
  color: string
}

export interface WealthType {
  id: string
  label: string
  emoji: string
  badge: string
  badgeLabel: string
  isDebt: boolean
}

export const ALL_CATEGORIES: Category[] = [
  { id: 'food',      label: 'Food',      emoji: '🍛', color: '#E24B4A' },
  { id: 'transport', label: 'Transport', emoji: '🚌', color: '#BA7517' },
  { id: 'house',     label: 'House',     emoji: '🏠', color: '#185FA5' },
  { id: 'health',    label: 'Health',    emoji: '💊', color: '#0F6E56' },
  { id: 'education', label: 'Education', emoji: '📚', color: '#534AB7' },
  { id: 'shopping',  label: 'Shopping',  emoji: '🛍️', color: '#D4537E' },
  { id: 'utility',   label: 'Utility',   emoji: '💡', color: '#639922' },
  { id: 'other',     label: 'Other',     emoji: '📦', color: '#888780' },
]

export const ALL_WEALTH_TYPES: WealthType[] = [
  { id: 'bank',     label: 'Bank',           emoji: '🏦', badge: 'liquid', badgeLabel: 'Liquid',      isDebt: false },
  { id: 'mobile',   label: 'Mobile Banking', emoji: '📱', badge: 'liquid', badgeLabel: 'Liquid',      isDebt: false },
  { id: 'savings',  label: 'Savings / FDR',  emoji: '🏛️', badge: 'secure', badgeLabel: 'Secure',      isDebt: false },
  { id: 'sanchay',  label: 'Sanchay Patra',  emoji: '📜', badge: 'secure', badgeLabel: 'Gov. Secure', isDebt: false },
  { id: 'invest',   label: 'Investment',     emoji: '📈', badge: 'invest', badgeLabel: 'Investment',  isDebt: false },
  { id: 'cash',     label: 'Cash',           emoji: '💵', badge: 'cash',   badgeLabel: 'Cash',        isDebt: false },
  { id: 'property', label: 'Property',       emoji: '🏡', badge: 'invest', badgeLabel: 'Asset',       isDebt: false },
  { id: 'gold',     label: 'Gold / Jewel',   emoji: '✨', badge: 'invest', badgeLabel: 'Asset',       isDebt: false },
  { id: 'debt',     label: 'Debt / Loan',    emoji: '⚠️', badge: 'debt',   badgeLabel: 'Liability',   isDebt: true  },
]

export const CAT_COLORS: Record<string, string> = {
  food: '#E24B4A', transport: '#BA7517', house: '#185FA5',
  health: '#0F6E56', education: '#534AB7', shopping: '#D4537E',
  utility: '#639922', other: '#888780',
}

export const PAYMENT_METHODS = ['Cash', 'Bank transfer', 'Mobile banking', 'Card', 'bKash', 'Nagad']
