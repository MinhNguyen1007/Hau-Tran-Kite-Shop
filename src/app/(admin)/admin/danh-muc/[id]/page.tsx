import { notFound } from 'next/navigation'
import { CategoryForm } from '@/components/admin/CategoryForm'
import { PageHeader, Panel } from '@/components/admin/Panel'
import { getCategoryById } from '@/lib/categories'
import { requireAdmin } from '@/lib/supabase'

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()

  const { id } = await params
  const category = await getCategoryById(id)
  if (!category) notFound()

  return (
    <div>
      <PageHeader
        title={category.name}
        description={
          category.archivedAt
            ? 'Danh mục này đang bị gỡ khỏi trang web.'
            : 'Đang hiện trên trang web.'
        }
        backHref="/admin/danh-muc"
        backLabel="Danh sách danh mục"
      />
      <Panel>
        <CategoryForm category={category} />
      </Panel>
    </div>
  )
}
