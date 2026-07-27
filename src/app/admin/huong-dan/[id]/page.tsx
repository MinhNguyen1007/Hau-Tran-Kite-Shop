import { notFound } from 'next/navigation'
import { GuideVideoForm } from '@/components/admin/GuideVideoForm'
import { getGuideVideoById } from '@/lib/guide-videos'
import { requireAdmin } from '@/lib/supabase'

export default async function EditGuidePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()

  const { id } = await params
  const guide = await getGuideVideoById(id)
  if (!guide) notFound()

  return (
    <div>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Sửa bài hướng dẫn
      </h1>
      <GuideVideoForm guide={guide} />
    </div>
  )
}
