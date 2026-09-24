import { ContentIntakeForm } from '@/components/content-studio/ContentIntakeForm'
import { requireStudioUser } from '@/lib/content-studio/server'
import { isSubmissionType } from '@/lib/content-studio/shared'

export const dynamic = 'force-dynamic'

export default async function NewContentPage({ searchParams }: { searchParams: { type?: string } }) {
  await requireStudioUser('/content-studio/new')
  const initialType = isSubmissionType(searchParams.type) ? searchParams.type : 'article'

  return (
    <div className="mx-auto max-w-3xl">
      <ContentIntakeForm initialType={initialType} />
    </div>
  )
}
