import { Plus } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { CopyId } from '@/components/admin/CopyId'
import { PageHeader, Panel } from '@/components/admin/Panel'
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
      <PageHeader
        title="Danh mục diều"
        description={`${categories.length} nhóm. Mỗi sản phẩm thuộc một danh mục; danh mục cũng là ô hiện trên trang chủ và tab lọc.`}
      >
        <Link
          href="/admin/danh-muc/moi"
          className="flex items-center gap-1.5 rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Thêm danh mục
        </Link>
      </PageHeader>

      <Panel bodyClassName="">
        {categories.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm text-stone-600">Chưa có danh mục nào.</p>
            <Link
              href="/admin/danh-muc/moi"
              className="mt-3 inline-block rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800"
            >
              Thêm danh mục đầu tiên
            </Link>
          </div>
        ) : (
          // Bảng ngang, mỗi thông tin một cột — giống trang Sản phẩm và trang Tài khoản.
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-bold md:px-5">Tên</th>
                  <th className="px-4 py-3 font-bold">Slug</th>
                  <th className="px-4 py-3 font-bold">Mã</th>
                  <th className="whitespace-nowrap px-4 py-3 font-bold">Thứ tự</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-bold md:px-5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className={`transition-colors hover:bg-stone-50 ${
                      category.archivedAt ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 md:px-5">
                      <div className="flex items-center gap-3">
                        <span className="relative block h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-stone-100 to-stone-200">
                          {category.imagePath && (
                            <Image
                              src={getProductImageUrl(category.imagePath)}
                              alt=""
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          )}
                        </span>
                        <Link
                          href={`/admin/danh-muc/${category.id}`}
                          className="truncate font-semibold text-ink-950 hover:underline"
                        >
                          {category.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">{category.slug}</td>
                    <td className="px-4 py-3">
                      <CopyId id={category.id} />
                    </td>
                    <td className="px-4 py-3 tabular-nums text-stone-600">{category.sortOrder}</td>
                    <td className="px-4 py-3">
                      {category.archivedAt ? (
                        <span className="inline-block whitespace-nowrap rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
                          Đã gỡ
                        </span>
                      ) : (
                        <span className="inline-block whitespace-nowrap rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-ink-950">
                          Đang hiện
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 md:px-5">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/danh-muc/${category.id}`}
                          className="text-sm font-semibold text-ink-950 hover:underline"
                        >
                          Sửa
                        </Link>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  )
}
