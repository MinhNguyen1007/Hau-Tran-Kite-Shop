import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { getProductById } from '@/lib/products'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const product = await getProductById(id)
  if (!product) notFound()

  return (
    <div>
      <h1 className="mb-1 text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Sửa sản phẩm
      </h1>
      <p className="mb-5 text-sm text-stone-600 dark:text-stone-400">
        {product.archivedAt
          ? 'Sản phẩm này đang bị gỡ khỏi trang bán hàng.'
          : 'Đang hiển thị trên trang bán hàng.'}
      </p>
      <ProductForm product={product} />
    </div>
  )
}
