// Content Studio constants + validation shared by the browser form and the
// API routes. No server imports here — this file ships to the client.

export const CONTENT_INTAKE_BUCKET = 'content-intake'
export const MAX_UPLOAD_BYTES = 250 * 1024 * 1024 // must match the bucket's file_size_limit

export const SUBMISSION_TYPES = ['article', 'video', 'idea'] as const
export type SubmissionType = (typeof SUBMISSION_TYPES)[number]

export const SUBMISSION_STATUSES = [
  'submitted', 'processing', 'ready_for_review', 'approved', 'scheduled', 'published', 'failed',
] as const
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number]

export const ALLOWED_EXTENSIONS = [
  'doc', 'docx', 'pdf', 'txt', 'md', 'rtf',
  'mp4', 'mov', 'm4v', 'webm',
  'mp3', 'm4a', 'wav',
] as const
export const FILE_ACCEPT = ALLOWED_EXTENSIONS.map(e => `.${e}`).join(',')

export function isSubmissionType(v: unknown): v is SubmissionType {
  return typeof v === 'string' && (SUBMISSION_TYPES as readonly string[]).includes(v)
}

export function fileExtension(name: string): string {
  const i = name.lastIndexOf('.')
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ''
}

export function isAllowedFile(name: string): boolean {
  return (ALLOWED_EXTENSIONS as readonly string[]).includes(fileExtension(name))
}

export function cleanFilename(filename: string): string {
  return filename
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(-120)
}

export function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function prettyStatus(status: string): string {
  return status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function formatBytes(n: number): string {
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`
  return `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`
}
