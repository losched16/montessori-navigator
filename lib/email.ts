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
