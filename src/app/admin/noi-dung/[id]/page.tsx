import { notFound } from 'next/navigation'
import { ContentBlockForm } from '@/components/admin/ContentBlockForm'
import { getBlockById } from '@/lib/content-blocks'
import { requireAdmin } from '@/lib/supabase'

export default async function EditContentBlockPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()

  const { id } = await params
  const block = await getBlockById(id)
  if (!block) notFound()

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold tracking-tight text-ink-900">
        Sửa khối nội dung
      </h1>
      <ContentBlockForm block={block} />
    </div>
  )
}
