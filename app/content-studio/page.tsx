import Link from 'next/link'
import { requireStudioUser } from '@/lib/content-studio/server'
import { prettyStatus, formatBytes, type SubmissionStatus } from '@/lib/content-studio/shared'

export const dynamic = 'force-dynamic'

const STATUS_STYLE: Record<SubmissionStatus, string> = {
  submitted: 'bg-navy-50 text-navy-700',
  processing: 'bg-warm-50 text-warm-700',
  ready_for_review: 'bg-amber-50 text-amber-800',
  approved: 'bg-emerald-50 text-emerald-700',
  scheduled: 'bg-sky-50 text-sky-700',
  published: 'bg-emerald-600 text-white',
  failed: 'bg-red-50 text-red-700',
}
const TYPE_ICON: Record<string, string> = { article: '✍️', video: '🎥', idea: '💡' }

const CARDS = [
  { type: 'article', icon: '✍️', title: 'Submit an article', body: 'Paste a draft or notes, or upload a document.' },
  { type: 'video', icon: '🎥', title: 'Submit a video', body: 'Paste a YouTube or Vimeo link, or upload the file.' },
  { type: 'idea', icon: '💡', title: 'Submit an idea', body: 'A rough thought, question, or topic is enough.' },
]

export default async function ContentStudioPage({ searchParams }: { searchParams: { submitted?: string } }) {
  const { user, supabase } = await requireStudioUser('/content-studio')

  // RLS limits this to super admins; the team sees each other's submissions.
  const { data: submissions, error } = await supabase
    .from('content_submissions')
    .select('id, title, submission_type, status, created_at, submitted_by, source_url, file_name, file_size, error_message')
    .order('created_at', { ascending: false })
    .limit(25)

  const notMigrated = error?.code === 'PGRST205' || error?.code === '42P01'
  if (error && !notMigrated) console.error('[content-studio] load failed:', error)

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-warm-600">The Montessori Foundation</p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-navy-800">Content Studio</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Send in the source material. The content pipeline takes it from there.</p>
        </div>
        <Link href="/content-studio/new" className="w-fit rounded-xl bg-navy-700 px-5 py-3 font-semibold text-white shadow-sm hover:bg-navy-800 transition">
          New content
        </Link>
      </div>

      {searchParams.submitted === '1' && (
        <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Got it — your submission is in. It’ll appear below as it moves through the pipeline.
        </div>
      )}

      {notMigrated && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Content Studio isn’t set up in the database yet. Run <code className="font-mono">supabase-migration-content-studio.sql</code> in the Supabase SQL Editor.
        </div>
      )}

      <section className="mb-10 grid gap-4 md:grid-cols-3">
        {CARDS.map(c => (
          <Link key={c.type} href={`/content-studio/new?type=${c.type}`}
            className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-navy-200">
            <div className="mb-3 text-3xl">{c.icon}</div>
            <h2 className="text-lg font-bold text-navy-800">{c.title}</h2>
            <p className="mt-1.5 text-sm leading-6 text-gray-600">{c.body}</p>
          </Link>
        ))}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold text-navy-800">Recent submissions</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {!submissions?.length ? (
            <div className="p-10 text-center text-gray-500">
              {notMigrated ? 'Submissions will show here once the database is set up.' : 'Nothing submitted yet. Start with one of the options above.'}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {submissions.map(item => (
                <li key={item.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 font-semibold uppercase tracking-wide text-gray-600">
                        {TYPE_ICON[item.submission_type]} {item.submission_type}
                      </span>
                      <span>{new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {item.submitted_by !== user.id && <span>· by a teammate</span>}
                      {item.file_name && <span>· 📎 {item.file_name}{item.file_size ? ` (${formatBytes(item.file_size)})` : ''}</span>}
                      {item.source_url && <span>· 🔗 link</span>}
                    </div>
                    <h3 className="mt-1.5 font-semibold text-navy-800 break-words">{item.title}</h3>
                    {item.status === 'failed' && item.error_message && (
                      <p className="mt-1 text-sm text-red-700">{item.error_message}</p>
                    )}
                  </div>
                  <span className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${STATUS_STYLE[item.status as SubmissionStatus] || 'bg-gray-100 text-gray-700'}`}>
                    {prettyStatus(item.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}
