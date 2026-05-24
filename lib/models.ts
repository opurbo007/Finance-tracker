import mongoose, { Schema, models } from 'mongoose'

const TransactionSchema = new Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, enum: ['expense', 'income', 'borrow'], required: true },
  amount: { type: Number, required: true },
  description: { type: String, required: true },
  category: { type: String, default: 'other' },
  categoryEmoji: { type: String, default: '📦' },
  paymentMethod: { type: String, default: 'Cash' },
  date: { type: String, required: true },
  createdAt: { type: Number, default: () => Date.now() },
  borrowDirection: { type: String, enum: ['lent', 'borrowed'], default: null },
  linkedWealthId: { type: String, default: null },
  wealthEffect: { type: String, enum: ['add', 'deduct', 'none'], default: 'none' },
})

TransactionSchema.index({ userId: 1, date: -1 })

const WealthAccountSchema = new Schema({
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  accountType: { type: String, required: true },
  typeLabel: { type: String, required: true },
  emoji: { type: String, default: '🏦' },
  badgeType: { type: String, default: 'liquid' },
  badgeLabel: { type: String, default: 'Liquid' },
  amount: { type: Number, required: true },
  isDebt: { type: Boolean, default: false },
  notes: { type: String, default: '' },
  createdAt: { type: Number, default: () => Date.now() },
})

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  resetPasswordToken: { type: String, default: null, index: true },
  resetPasswordExpires: { type: Number, default: null },
  createdAt: { type: Number, default: () => Date.now() },
})

export const TransactionModel = models['Transaction'] || mongoose.model('Transaction', TransactionSchema)
export const WealthAccountModel = models['WealthAccount'] || mongoose.model('WealthAccount', WealthAccountSchema)
export const UserModel = models['User'] || mongoose.model('User', UserSchema)
