import { Resend } from 'resend'

// Lazy-init so we don't crash at build time if RESEND_API_KEY isn't set yet.
let _resend: Resend | null = null
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
      throw new Error('RESEND_API_KEY is not set')
    }
    _resend = new Resend(key)
  }
  return _resend
}

const FROM = process.env.EMAIL_FROM || 'Montessori Family Alliance <hello@montessori.org>'
const REPLY_TO = process.env.EMAIL_REPLY_TO || undefined

interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

// Low-level send. Returns { data, error } from Resend.
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  return getResend().emails.send({
    from: FROM,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
    text,
    ...(REPLY_TO ? { replyTo: REPLY_TO } : {}),
  })
}

// ============================================================
// Brand chrome shared by all templates
// ============================================================

const COLORS = {
  deepPlum: '#1a0e2e',
  royalPurple: '#4a2c82',
  softPurple: '#7b5ea7',
  lavender: '#c4b1e0',
  paleLavender: '#ede7f6',
  text: '#1a0e2e',
  muted: '#5c4a7e',
  bg: '#fafaf8',
  white: '#ffffff',
  border: '#e5e7eb',
  blueAccent: '#4a6cf7',
} as const

function emailLayout({ heading, body, ctaLabel, ctaUrl, footnote }: {
  heading: string
  body: string
  ctaLabel?: string
  ctaUrl?: string
  footnote?: string
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${heading}</title>
</head>
<body style="margin:0; padding:0; background:${COLORS.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color:${COLORS.text};">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${COLORS.bg}; padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background:${COLORS.white}; border-radius:16px; border:1px solid ${COLORS.border};">
          <tr>
            <td style="padding:32px 40px 0; text-align:center;">
              <div style="font-family: Georgia, serif; font-size:20px; font-weight:600; color:${COLORS.royalPurple};">
                Montessori <span style="color:${COLORS.deepPlum}; font-weight:700; letter-spacing:0.05em;">FAMILY ALLIANCE</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px 8px;">
              <h1 style="margin:0 0 16px; font-family: Georgia, serif; font-weight:500; color:${COLORS.deepPlum}; font-size:26px; line-height:1.25;">
                ${heading}
              </h1>
              <div style="color:${COLORS.muted}; font-size:15px; line-height:1.6;">
                ${body}
              </div>
              ${ctaLabel && ctaUrl ? `
                <div style="text-align:center; margin:28px 0 8px;">
                  <a href="${ctaUrl}" style="display:inline-block; padding:14px 28px; background:linear-gradient(135deg, ${COLORS.blueAccent} 0%, ${COLORS.royalPurple} 100%); color:${COLORS.white}; text-decoration:none; border-radius:999px; font-weight:600; font-size:15px;">
                    ${ctaLabel}
                  </a>
                </div>
                <p style="font-size:12px; color:${COLORS.muted}; text-align:center; margin:8px 0 0;">
                  Or paste this link into your browser:<br />
                  <span style="color:${COLORS.softPurple}; word-break:break-all;">${ctaUrl}</span>
                </p>
              ` : ''}
            </td>
          </tr>
          ${footnote ? `
            <tr>
              <td style="padding:16px 40px 32px;">
                <div style="border-top:1px solid ${COLORS.border}; padding-top:16px; font-size:13px; color:${COLORS.muted}; line-height:1.5;">
                  ${footnote}
                </div>
              </td>
            </tr>
          ` : `<tr><td style="padding:16px 40px 32px;"></td></tr>`}
        </table>
        <p style="font-size:12px; color:${COLORS.muted}; opacity:0.6; margin:24px 0 0;">
          A product of Tim Seldin and The Montessori Foundation.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ============================================================
// Email helpers — high-level, one per use case
// ============================================================

interface SchoolFamilyInviteParams {
  to: string
  schoolName: string
  inviteUrl: string
}

export async function sendSchoolFamilyInvite({ to, schoolName, inviteUrl }: SchoolFamilyInviteParams) {
  const heading = `${schoolName} invited you to Montessori Family Alliance`
  const body = `
    <p style="margin:0 0 12px;"><strong>${schoolName}</strong> has added you to the Montessori Family Alliance — a trusted resource for Montessori parenting created in partnership with The Montessori Foundation.</p>
    <p style="margin:0 0 12px;">Your school is covering the cost. Click below to set up your free account and start exploring.</p>
  `
  const footnote = `
    <strong>What you'll get:</strong> Abigail (an AI Montessori guide), the Foundation's library of articles and webinars, child development tracking, and at-home learning plans aligned with what your child does at school.
    <br /><br />
    Questions? Just reply to this email — we'd love to help.
  `

  return sendEmail({
    to,
    subject: heading,
    html: emailLayout({ heading, body, ctaLabel: 'Accept Invitation', ctaUrl: inviteUrl, footnote }),
    text: `${schoolName} has invited you to Montessori Family Alliance.\n\nYour school is covering the cost. Visit this link to set up your free account:\n${inviteUrl}\n\nQuestions? Reply to this email.`,
  })
}

// -----------------------------------------------------------
// Parent welcome (after Stripe trial starts + account created)
// -----------------------------------------------------------

interface ParentWelcomeParams {
  to: string
  name?: string | null
  trialEndDate?: string  // formatted human-readable date
  appUrl?: string
}

export async function sendParentWelcome({ to, name, trialEndDate, appUrl }: ParentWelcomeParams) {
  const greeting = name ? `Welcome, ${name}` : 'Welcome to Montessori Family Alliance'
  const trialLine = trialEndDate
    ? `<p style="margin:0 0 12px;">Your 7-day free trial is active until <strong>${trialEndDate}</strong>. You won't be charged until then — cancel anytime from Settings.</p>`
    : `<p style="margin:0 0 12px;">Your 7-day free trial is active. You won't be charged until it ends — cancel anytime from Settings.</p>`

  const body = `
    ${trialLine}
    <p style="margin:0 0 12px;"><strong>What to do first:</strong></p>
    <ol style="margin:0 0 12px; padding-left:20px; color:#5c4a7e;">
      <li style="margin-bottom:6px;">Add your child's profile and current age</li>
      <li style="margin-bottom:6px;">Ask Abigail (your AI Montessori guide) anything that's on your mind</li>
      <li style="margin-bottom:6px;">Browse the Foundation's article library to start grounding your understanding</li>
    </ol>
  `
  const footnote = `Replies to this email come straight to us — anything you want to ask, we're listening.`

  return sendEmail({
    to,
    subject: `Welcome to Montessori Family Alliance${name ? `, ${name}` : ''}`,
    html: emailLayout({ heading: greeting, body, ctaLabel: 'Open Your Dashboard', ctaUrl: `${appUrl || 'https://familyalliance.montessori.org'}/dashboard`, footnote }),
    text: `${greeting}\n\nYour 7-day free trial is active${trialEndDate ? ` until ${trialEndDate}` : ''}. Visit your dashboard to get started:\n${appUrl || 'https://familyalliance.montessori.org'}/dashboard\n\nQuestions? Just reply to this email.`,
  })
}

// -----------------------------------------------------------
// School admin welcome (after Stripe trial starts + admin signup)
// -----------------------------------------------------------

interface SchoolWelcomeParams {
  to: string
  schoolName: string
  trialEndDate?: string
  appUrl?: string
}

export async function sendSchoolAdminWelcome({ to, schoolName, trialEndDate, appUrl }: SchoolWelcomeParams) {
  const heading = `Welcome to Montessori Family Alliance`
  const trialLine = trialEndDate
    ? `<p style="margin:0 0 12px;">Your 14-day free trial for <strong>${schoolName}</strong> runs until <strong>${trialEndDate}</strong>. You won't be charged until then.</p>`
    : `<p style="margin:0 0 12px;">Your 14-day free trial for <strong>${schoolName}</strong> is now active.</p>`
  const body = `
    ${trialLine}
    <p style="margin:0 0 12px;"><strong>Get the most out of your trial:</strong></p>
    <ol style="margin:0 0 12px; padding-left:20px; color:#5c4a7e;">
      <li style="margin-bottom:6px;">Invite your families — they get free access while your subscription is active</li>
      <li style="margin-bottom:6px;">Customize your school profile (credentials, address, photo) so families recognize you</li>
      <li style="margin-bottom:6px;">Add other admins on your team so they can help manage</li>
    </ol>
  `
  const footnote = `Need help getting set up? Reply to this email — we offer free 30-minute walkthroughs for new schools.`

  return sendEmail({
    to,
    subject: `Welcome to Montessori Family Alliance — ${schoolName}`,
    html: emailLayout({ heading, body, ctaLabel: 'Open School Dashboard', ctaUrl: `${appUrl || 'https://familyalliance.montessori.org'}/school`, footnote }),
    text: `Welcome to Montessori Family Alliance!\n\nYour 14-day trial for ${schoolName} is active${trialEndDate ? ` until ${trialEndDate}` : ''}.\n\nOpen your school dashboard:\n${appUrl || 'https://familyalliance.montessori.org'}/school\n\nNeed help? Reply to this email.`,
  })
}

// -----------------------------------------------------------
// Co-parent invitation (one parent invites a partner/guardian)
// -----------------------------------------------------------

interface CoParentInviteParams {
  to: string
  inviterName?: string | null
  inviteUrl: string
}

export async function sendCoParentInvite({ to, inviterName, inviteUrl }: CoParentInviteParams) {
  const heading = inviterName
    ? `${inviterName} invited you to share their family on Montessori Family Alliance`
    : `You've been invited to a family on Montessori Family Alliance`
  const body = `
    <p style="margin:0 0 12px;">${inviterName ? `<strong>${inviterName}</strong>` : 'Someone'} added you as a co-parent on Montessori Family Alliance — a trusted resource for Montessori parenting from The Montessori Foundation.</p>
    <p style="margin:0 0 12px;">When you accept, you'll see the same children, observations, and journey notes — both of you can track progress and ask Abigail (your AI Montessori guide) questions about your kids.</p>
  `
  const footnote = `If you don't recognize the inviter, you can safely ignore this email — no account is created until you accept.`

  return sendEmail({
    to,
    subject: heading,
    html: emailLayout({ heading, body, ctaLabel: 'Accept Invitation', ctaUrl: inviteUrl, footnote }),
    text: `${heading}\n\nAccept the invitation: ${inviteUrl}\n\nIf you don't recognize the inviter, you can ignore this email.`,
  })
}

// -----------------------------------------------------------
// School staff (admin) invitation
// -----------------------------------------------------------

interface SchoolStaffInviteParams {
  to: string
  schoolName: string
  inviteUrl: string
}

export async function sendSchoolStaffInvite({ to, schoolName, inviteUrl }: SchoolStaffInviteParams) {
  const heading = `${schoolName} invited you to be an admin on Montessori Family Alliance`
  const body = `
    <p style="margin:0 0 12px;"><strong>${schoolName}</strong> added you as an admin on their Montessori Family Alliance account.</p>
    <p style="margin:0 0 12px;">As an admin you'll be able to invite families, manage staff, and view enrollment activity. The school's subscription covers your access — no payment needed.</p>
  `
  const footnote = `If you weren't expecting this, you can safely ignore this email.`

  return sendEmail({
    to,
    subject: heading,
    html: emailLayout({ heading, body, ctaLabel: 'Accept Admin Invitation', ctaUrl: inviteUrl, footnote }),
    text: `${schoolName} has invited you to be an admin on Montessori Family Alliance.\n\nAccept: ${inviteUrl}`,
  })
}

// -----------------------------------------------------------
// Password reset
// -----------------------------------------------------------

interface PasswordResetParams {
  to: string
  resetUrl: string
}

export async function sendPasswordReset({ to, resetUrl }: PasswordResetParams) {
  const heading = `Reset your password`
  const body = `
    <p style="margin:0 0 12px;">We received a request to reset the password for your Montessori Family Alliance account.</p>
    <p style="margin:0 0 12px;">Click the button below to choose a new password. This link expires in 1 hour.</p>
  `
  const footnote = `If you didn't request a password reset, you can safely ignore this email — your password won't change.`

  return sendEmail({
    to,
    subject: 'Reset your Montessori Family Alliance password',
    html: emailLayout({ heading, body, ctaLabel: 'Reset Password', ctaUrl: resetUrl, footnote }),
    text: `Reset your password by visiting this link (expires in 1 hour):\n${resetUrl}\n\nIf you didn't request this, you can ignore the email.`,
  })
}
