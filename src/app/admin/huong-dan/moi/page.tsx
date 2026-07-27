import { GuideVideoForm } from '@/components/admin/GuideVideoForm'
import { requireAdmin } from '@/lib/supabase'

export default async function NewGuidePage() {
  await requireAdmin()

  return (
    <div>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Thêm bài hướng dẫn
      </h1>
      <GuideVideoForm />
    </div>
  )
}
