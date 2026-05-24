import nodemailer from 'nodemailer'

const SMTP_HOST = process.env.SMTP_HOST
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587)
const SMTP_USER = process.env.SMTP_USER
const SMTP_PASS = process.env.SMTP_PASS
const SMTP_FROM = process.env.SMTP_FROM ?? SMTP_USER

export function hasMailerConfig(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS && SMTP_FROM)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
  if (!hasMailerConfig()) {
    throw new Error('SMTP email settings are not configured')
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  })

  await transporter.sendMail({
    from: SMTP_FROM,
    to: email,
    subject: 'Reset your Finance password',
    text: [
      'You requested a password reset for your Finance account.',
      '',
      `Open this link to set a new password: ${resetUrl}`,
      '',
      'This link expires in 30 minutes. If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.55;color:#3c4148;max-width:520px">
        <h2 style="margin:0 0 12px;color:#3c4148">Reset your Finance password</h2>
        <p>You requested a password reset for your Finance account.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#f04f59;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px;font-weight:700">
            Set new password
          </a>
        </p>
        <p style="color:#767b82;font-size:13px">This link expires in 30 minutes. If you did not request this, you can ignore this email.</p>
      </div>
    `,
  })
}
