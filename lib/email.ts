import { Resend } from 'resend'

let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'DM Companion <onboarding@resend.dev>'
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`

  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: 'Verify your email — DM Companion',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #12142A; color: #F1F5F9; border-radius: 12px;">
        <h1 style="color: #A855F7; margin-bottom: 8px;">DM Companion</h1>
        <p>Welcome! Click the button below to verify your email address.</p>
        <a href="${verifyUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #7C3AED; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Verify Email
        </a>
        <p style="color: #94A3B8; font-size: 14px;">Or copy this link: <a href="${verifyUrl}" style="color: #A855F7;">${verifyUrl}</a></p>
        <p style="color: #64748B; font-size: 12px; margin-top: 32px;">This link expires in 24 hours. If you didn't create an account, you can ignore this email.</p>
      </div>
    `,
  })
}

export async function sendPasswordResetEmail(email: string, token: string, baseUrl: string) {
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`

  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: 'Reset your password — DM Companion',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #12142A; color: #F1F5F9; border-radius: 12px;">
        <h1 style="color: #A855F7; margin-bottom: 8px;">DM Companion</h1>
        <p>You requested a password reset. Click the button below to choose a new password.</p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #7C3AED; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Reset Password
        </a>
        <p style="color: #94A3B8; font-size: 14px;">Or copy this link: <a href="${resetUrl}" style="color: #A855F7;">${resetUrl}</a></p>
        <p style="color: #64748B; font-size: 12px; margin-top: 32px;">This link expires in 1 hour. If you didn't request a reset, you can ignore this email.</p>
      </div>
    `,
  })
}

export async function sendCampaignInviteEmail(
  email: string,
  campaignName: string,
  dmName: string,
  baseUrl: string
) {
  const signInUrl = `${baseUrl}/signin`

  await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: `You've been invited to "${campaignName}" — DM Companion`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #12142A; color: #F1F5F9; border-radius: 12px;">
        <h1 style="color: #A855F7; margin-bottom: 8px;">DM Companion</h1>
        <p><strong>${dmName}</strong> has invited you to join the campaign <strong>"${campaignName}"</strong> as a player.</p>
        <a href="${signInUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background: #7C3AED; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
          Sign In to Join
        </a>
        <p style="color: #94A3B8; font-size: 14px;">Sign in or create an account with this email address (<strong>${email}</strong>) and the campaign will appear automatically.</p>
      </div>
    `,
  })
}
