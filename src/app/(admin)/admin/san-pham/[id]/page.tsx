import { notFound } from 'next/navigation'
import { PageHeader, Panel } from '@/components/admin/Panel'
import { ProductForm } from '@/components/admin/ProductForm'
import { getCategories } from '@/lib/categories'
import { getProductById } from '@/lib/products'
import { requireAdmin } from '@/lib/supabase'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin()

  const { id } = await params
  const [product, categories] = await Promise.all([getProductById(id), getCategories()])
  if (!product) notFound()

  return (
    <div>
      <PageHeader
        title={product.name}
        description={
          product.archivedAt
            ? 'Mẫu này đang bị gỡ khỏi trang web, khách không thấy.'
            : 'Đang hiển thị trên trang web.'
        }
        backHref="/admin/san-pham"
        backLabel="Danh sách sản phẩm"
      />
      <Panel>
        <ProductForm product={product} categories={categories} />
      </Panel>
    </div>
  )
}
