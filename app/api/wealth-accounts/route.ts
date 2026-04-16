import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import { WealthAccountModel } from '@/lib/models'
import { getAuthUserId } from '@/lib/get-auth-user'
import type { WealthAccount } from '@/types'

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

function toWealthAccount(d: Record<string, unknown>): WealthAccount {
  return {
    _id:         (d._id as { toString(): string }).toString(),
    userId:      d.userId as string,
    name:        d.name as string,
    accountType: d.accountType as string,
    typeLabel:   d.typeLabel as string,
    emoji:       d.emoji as string,
    badgeType:   d.badgeType as WealthAccount['badgeType'],
    badgeLabel:  d.badgeLabel as string,
    amount:      d.amount as number,
    isDebt:      d.isDebt as boolean,
    notes:       (d.notes as string) ?? '',
    createdAt:   d.createdAt as number,
  }
}

export async function GET(): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  await connectDB()
  const docs = await WealthAccountModel.find({ userId }).sort({ createdAt: 1 }).lean()
  return NextResponse.json(docs.map(d => toWealthAccount(d as Record<string, unknown>)))
}

export async function POST(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  const body = await req.json() as Omit<WealthAccount, '_id' | 'userId' | 'createdAt'>
  await connectDB()
  const doc = await WealthAccountModel.create({ ...body, userId })
  return NextResponse.json(toWealthAccount(doc.toObject() as Record<string, unknown>))
}

export async function DELETE(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  const { id } = await req.json() as { id: string }
  await connectDB()
  await WealthAccountModel.deleteOne({ _id: id, userId })
  return NextResponse.json({ success: true })
}

export async function PATCH(req: Request): Promise<NextResponse> {
  const userId = await getAuthUserId()
  if (!userId) return unauthorized()

  const { id, amount } = await req.json() as { id: string; amount: number }
  await connectDB()
  await WealthAccountModel.updateOne({ _id: id, userId }, { $set: { amount } })
  return NextResponse.json({ success: true })
}
