import { CategoryForm } from '@/components/admin/CategoryForm'
import { PageHeader, Panel } from '@/components/admin/Panel'
import { requireAdmin } from '@/lib/supabase'

export default async function NewCategoryPage() {
  await requireAdmin()

  return (
    <div>
      <PageHeader title="Thêm danh mục" backHref="/admin/danh-muc" backLabel="Danh sách danh mục" />
      <Panel>
        <CategoryForm />
      </Panel>
    </div>
  )
}
