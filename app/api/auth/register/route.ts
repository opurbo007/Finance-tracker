import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models'

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    if (password.length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })

    await connectDB()
    const existing = await UserModel.findOne({ email: email.toLowerCase() })
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 })

    const hashed = await bcrypt.hash(password, 12)
    await UserModel.create({ email: email.toLowerCase(), password: hashed })
    return NextResponse.json({ success: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
