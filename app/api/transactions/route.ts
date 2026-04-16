import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { TransactionModel } from '@/lib/models'
import { getAuthUserId } from '@/lib/get-auth-user'
import type { Transaction } from '@/types'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

export async function GET(): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  await connectDB()
  const docs = await TransactionModel
    .find({ userId })
    .sort({ date: -1, createdAt: -1 })
    .lean()

  const transactions: Transaction[] = docs.map(d => ({
    _id:           d._id.toString(),
    userId:        d.userId as string,
    type:          d.type as 'expense' | 'income',
    amount:        d.amount as number,
    description:   d.description as string,
    category:      d.category as string,
    categoryEmoji: d.categoryEmoji as string,
    paymentMethod: d.paymentMethod as string,
    date:          d.date as string,
    createdAt:     d.createdAt as number,
  }))

  return NextResponse.json(transactions)
}

export async function POST(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  const body = await req.json() as Omit<Transaction, '_id' | 'userId' | 'createdAt'>
  await connectDB()
  const doc = await TransactionModel.create({ ...body, userId })

  const tx: Transaction = {
    _id:           doc._id.toString(),
    userId:        doc.userId as string,
    type:          doc.type as 'expense' | 'income',
    amount:        doc.amount as number,
    description:   doc.description as string,
    category:      doc.category as string,
    categoryEmoji: doc.categoryEmoji as string,
    paymentMethod: doc.paymentMethod as string,
    date:          doc.date as string,
    createdAt:     doc.createdAt as number,
  }

  return NextResponse.json(tx)
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  const { id } = await req.json() as { id: string }
  await connectDB()
  await TransactionModel.deleteOne({ _id: id, userId })
  return NextResponse.json({ success: true })
}
