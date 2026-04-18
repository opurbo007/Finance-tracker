import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { TransactionModel } from '@/lib/models'
import { getAuthUserId } from '@/lib/get-auth-user'
import type { Transaction } from '@/types'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function toTransaction(d: unknown): Transaction {
  const doc = d as Record<string, unknown>
  return {
    _id:           (doc['_id'] as { toString(): string }).toString(),
    userId:        doc['userId'] as string,
    type:          doc['type'] as 'expense' | 'income',
    amount:        doc['amount'] as number,
    description:   doc['description'] as string,
    category:      doc['category'] as string,
    categoryEmoji: doc['categoryEmoji'] as string,
    paymentMethod: doc['paymentMethod'] as string,
    date:          doc['date'] as string,
    createdAt:     doc['createdAt'] as number,
  }
}

export async function GET(): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()
  await connectDB()
  const docs = await TransactionModel.find({ userId }).sort({ date: -1, createdAt: -1 }).lean()
  return NextResponse.json(docs.map(d => toTransaction(d)))
}

export async function POST(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()
  const body = await req.json() as Omit<Transaction, '_id' | 'userId' | 'createdAt'>
  await connectDB()
  const doc = await TransactionModel.create({ ...body, userId })
  return NextResponse.json(toTransaction(doc.toObject() as unknown))
}

export async function PATCH(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()
  const { id, ...fields } = await req.json() as { id: string } & Partial<Omit<Transaction, '_id' | 'userId' | 'createdAt'>>
  await connectDB()
  const doc = await TransactionModel.findOneAndUpdate(
    { _id: id, userId },
    { $set: fields },
    { new: true }
  ).lean()
  if (!doc) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(toTransaction(doc))
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()
  const { id } = await req.json() as { id: string }
  await connectDB()
  await TransactionModel.deleteOne({ _id: id, userId })
  return NextResponse.json({ success: true })
}
