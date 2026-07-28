import { ContentBlockForm } from '@/components/admin/ContentBlockForm'
import { requireAdmin } from '@/lib/supabase'

export default async function NewContentBlockPage() {
  await requireAdmin()

  return (
    <div>
      <h1 className="mb-6 text-xl font-extrabold tracking-tight text-ink-900">
        Thêm khối nội dung
      </h1>
      <ContentBlockForm />
    </div>
  )
}
