import { Plus } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { RowActionButton } from '@/components/admin/RowActionButton'
import { getCategoriesForAdmin } from '@/lib/categories'
import { getProductImageUrl } from '@/lib/storage'
import { requireAdmin } from '@/lib/supabase'

export default async function AdminCategoriesPage() {
  // Layout /admin đã chặn người lạ, nhưng kiểm lại ở đây: layout chỉ che giao diện,
  // trang này tự đọc dữ liệu nên tự chịu trách nhiệm về quyền (xem CLAUDE.md).
  await requireAdmin()

  const categories = await getCategoriesForAdmin()

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900">
            Danh mục diều ({categories.length})
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Mỗi sản phẩm thuộc một danh mục. Danh mục cũng là ô hiện trên trang chủ và tab lọc.
          </p>
        </div>

        <Link
          href="/admin/danh-muc/moi"
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Thêm danh mục
        </Link>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-600">
          Chưa có danh mục nào.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white">
          {categories.map((category) => (
            <li
              key={category.id}
              className={`flex items-center gap-3 p-3.5 ${category.archivedAt ? 'opacity-60' : ''}`}
            >
              <span className="relative block h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-brand-100">
                {category.imagePath && (
                  <Image
                    src={getProductImageUrl(category.imagePath)}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                )}
              </span>

              <span className="min-w-0 flex-1">
                <Link
                  href={`/admin/danh-muc/${category.id}`}
                  className="block truncate text-sm font-bold text-ink-900 hover:text-brand-700"
                >
                  {category.name}
                </Link>
                <span className="block truncate font-mono text-xs text-stone-500">
                  {category.slug}
                </span>
              </span>

              {category.archivedAt && (
                <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700">
                  Đã gỡ
                </span>
              )}

              <span className="shrink-0 text-xs tabular-nums text-stone-500">
                #{category.sortOrder}
              </span>

              {category.archivedAt ? (
                <RowActionButton
                  endpoint={`/api/admin/danh-muc/${category.id}?khoi-phuc=1`}
                  label={`Khôi phục ${category.name}`}
                  action="restore"
                />
              ) : (
                <RowActionButton
                  endpoint={`/api/admin/danh-muc/${category.id}`}
                  label={`Gỡ ${category.name}`}
                  confirmText={`Gỡ danh mục "${category.name}" khỏi trang web? Sản phẩm trong danh mục vẫn còn, chỉ mất phần phân loại.`}
                  action="archive"
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
