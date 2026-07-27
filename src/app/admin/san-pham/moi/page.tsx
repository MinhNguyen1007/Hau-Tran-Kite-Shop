import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
        Thêm sản phẩm
      </h1>
      <ProductForm />
    </div>
  )
}
