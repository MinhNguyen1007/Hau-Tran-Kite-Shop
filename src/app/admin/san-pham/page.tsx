import Link from 'next/link'
import { ArchiveButton } from '@/components/admin/ArchiveButton'
import { visiblePrice } from '@/lib/product-shared'
import { getProductsForAdmin } from '@/lib/products'

export default async function AdminProductsPage() {
  // Layout /admin đã chặn người không phải admin; RLS là lớp thứ hai (admin thấy cả hàng đã gỡ).
  const products = await getProductsForAdmin()

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
          Sản phẩm ({products.length})
        </h1>
        <Link
          href="/admin/san-pham/moi"
          className="rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
        >
          Thêm sản phẩm
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-600">
          Chưa có sản phẩm nào. Bấm “Thêm sản phẩm” để tạo mẫu diều đầu tiên.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-stone-200">
          <table className="w-full min-w-[42rem] border-collapse bg-white text-left text-sm">
            <thead className="border-b border-stone-200 text-xs uppercase tracking-wide text-stone-600">
              <tr>
                <th className="px-4 py-3 font-bold">Tên</th>
                <th className="px-4 py-3 font-bold">Danh mục</th>
                <th className="px-4 py-3 font-bold">Giá</th>
                <th className="px-4 py-3 font-bold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-bold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {products.map((product) => (
                <tr key={product.id} className={product.archivedAt ? 'opacity-60' : undefined}>
                  <td className="px-4 py-3">
                    <span className="block font-semibold text-ink-900">
                      {product.name}
                    </span>
                    <span className="block font-mono text-xs text-stone-500">
                      {product.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-stone-700">
                    {product.categoryName ?? (
                      <span className="text-stone-500">— chưa xếp —</span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-semibold text-ink-900">
                    {visiblePrice(product) ?? (
                      <span className="font-normal text-stone-500">
                        {product.priceText.trim() === '' ? '— chưa ghi giá —' : '— đang ẩn giá —'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Status archived={product.archivedAt !== null} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/admin/san-pham/${product.id}`}
                        className="text-sm font-semibold text-brand-700 hover:underline"
                      >
                        Sửa
                      </Link>
                      <ArchiveButton
                        productId={product.id}
                        productName={product.name}
                        archived={product.archivedAt !== null}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// Không còn trạng thái "Hết hàng": bỏ tồn kho 2026-07-27, diều làm theo đơn.
function Status({ archived }: { archived: boolean }) {
  if (archived) {
    return <span className="text-xs font-bold text-stone-500">Đã gỡ</span>
  }
  return <span className="text-xs font-bold text-stone-600">Đang hiện</span>
}
