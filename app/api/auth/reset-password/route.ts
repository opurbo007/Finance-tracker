import { createHash, randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/lib/mongodb'
import { UserModel } from '@/lib/models'
import { sendPasswordResetEmail } from '@/lib/mailer'

const RESET_TOKEN_TTL_MS = 30 * 60 * 1000
const RESET_MESSAGE = 'If that email exists, a reset link has been sent.'

interface ResetPasswordBody {
  action: 'request' | 'reset'
  email?: string
  password?: string
  token?: string
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

function appOrigin(req: Request): string {
  const configuredUrl = process.env.NEXTAUTH_URL
  if (configuredUrl) return configuredUrl.replace(/\/$/, '')
  return new URL(req.url).origin
}

async function requestReset(req: Request, email: string): Promise<NextResponse> {
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
  }

  await connectDB()

  const normalizedEmail = email.toLowerCase()
  const user = await (UserModel as any).findOne({ email: normalizedEmail })

  if (!user) {
    return NextResponse.json({ success: true, message: RESET_MESSAGE }, { status: 200 })
  }

  const token = randomBytes(32).toString('hex')
  user.resetPasswordToken = hashToken(token)
  user.resetPasswordExpires = Date.now() + RESET_TOKEN_TTL_MS
  await user.save()

  const resetUrl = `${appOrigin(req)}/auth?resetToken=${token}`
  await sendPasswordResetEmail(normalizedEmail, resetUrl)

  return NextResponse.json({ success: true, message: RESET_MESSAGE }, { status: 200 })
}

async function resetPassword(token: string, password: string): Promise<NextResponse> {
  if (password.length < 6) {
    return NextResponse.json(
      { error: 'Password must be at least 6 characters' },
      { status: 400 },
    )
  }

  await connectDB()

  const tokenHash = hashToken(token)
  const user = await (UserModel as any).findOne({
    resetPasswordToken: tokenHash,
    resetPasswordExpires: { $gt: Date.now() },
  })

  if (!user) {
    return NextResponse.json(
      { error: 'Reset link is invalid or expired' },
      { status: 400 },
    )
  }

  user.password = await bcrypt.hash(password, 12)
  user.resetPasswordToken = null
  user.resetPasswordExpires = null
  await user.save()

  return NextResponse.json(
    { success: true, message: 'Password updated. You can sign in now.' },
    { status: 200 },
  )
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = (await req.json()) as ResetPasswordBody

    if (body.action === 'request') {
      if (!body.email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 })
      }
      return requestReset(req, body.email)
    }

    if (body.action === 'reset') {
      if (!body.token || !body.password) {
        return NextResponse.json(
          { error: 'Reset token and new password required' },
          { status: 400 },
        )
      }
      return resetPassword(body.token, body.password)
    }

    return NextResponse.json({ error: 'Invalid reset action' }, { status: 400 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
