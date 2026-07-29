import Link from 'next/link'
import { ArchiveButton } from '@/components/admin/ArchiveButton'
import { CopyId } from '@/components/admin/CopyId'
import { DeleteProductButton } from '@/components/admin/DeleteProductButton'
import { PageHeader, Panel } from '@/components/admin/Panel'
import { SearchField } from '@/components/admin/SearchField'
import { getCategoriesForAdmin } from '@/lib/categories'
import { visiblePrice } from '@/lib/product-shared'
import { getProductsForAdmin } from '@/lib/products'

// Giá trị đặc biệt cho bộ lọc: không phải slug của danh mục nào, nghĩa là "chưa xếp nhóm".
const UNSORTED = 'chua-xep'

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ tim?: string; 'danh-muc'?: string }>
}) {
  // Layout /admin đã chặn người không phải admin; RLS là lớp thứ hai (admin thấy cả hàng đã gỡ).
  const [products, categories, params] = await Promise.all([
    getProductsForAdmin(),
    getCategoriesForAdmin(),
    searchParams,
  ])

  // Lọc trong bộ nhớ chứ không truy vấn lại: danh sách admin vốn đã tải hết và số mẫu diều
  // đếm trên đầu ngón tay. So bằng categoryId chứ KHÔNG phải .eq('categories.slug') trên
  // PostgREST — cách kia chỉ lọc bảng nhúng, dòng cha vẫn trả đủ (bug đã dính 2026-07-27).
  const keyword = (params.tim ?? '').trim().toLowerCase()
  const categorySlug = (params['danh-muc'] ?? '').trim()
  const activeCategory = categories.find((category) => category.slug === categorySlug) ?? null

  // Tìm theo TÊN hoặc MÃ, không theo slug: slug là thứ hiện trên URL, admin không nhớ nó.
  // Mã khớp cả khi gõ vài ký tự đầu — CopyId chỉ hiện 8 ký tự nên gõ đủ 36 là chuyện hiếm.
  const matchesKeyword = (name: string, id: string) =>
    keyword === '' || name.toLowerCase().includes(keyword) || id.toLowerCase().includes(keyword)

  const inCategory = (categoryId: string | null) => {
    if (categorySlug === '') return true
    if (categorySlug === UNSORTED) return categoryId === null
    return activeCategory !== null && categoryId === activeCategory.id
  }

  const rows = products.filter(
    (product) => matchesKeyword(product.name, product.id) && inCategory(product.categoryId),
  )

  const unsortedCount = products.filter((product) => product.categoryId === null).length
  const filterLabel =
    categorySlug === UNSORTED ? 'chưa xếp danh mục' : (activeCategory?.name.toLowerCase() ?? null)

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description={describe(products.length, rows.length, keyword, filterLabel)}
      >
        <Link
          href="/admin/san-pham/moi"
          className="rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98]"
        >
          Thêm sản phẩm
        </Link>
      </PageHeader>

      <div className="mb-4">
        <SearchField
          action="/admin/san-pham"
          name="tim"
          defaultValue={params.tim ?? ''}
          label="Tìm sản phẩm"
          placeholder="Tìm theo tên hoặc mã sản phẩm..."
          hidden={categorySlug === '' ? {} : { 'danh-muc': categorySlug }}
        />
      </div>

      {/* Lọc bằng link chứ không phải dropdown JS: trạng thái nằm trên URL nên bấm quay lại
          vẫn đúng, chia sẻ link được, và trang này vẫn là Server Component. */}
      <nav aria-label="Lọc theo danh mục" className="mb-4 flex flex-wrap gap-2">
        <FilterChip
          href={buildHref(keyword)}
          label="Tất cả"
          count={products.length}
          active={categorySlug === ''}
        />
        {categories.map((category) => (
          <FilterChip
            key={category.id}
            href={buildHref(keyword, category.slug)}
            label={category.name}
            count={products.filter((product) => product.categoryId === category.id).length}
            active={categorySlug === category.slug}
          />
        ))}
        {unsortedCount > 0 && (
          <FilterChip
            href={buildHref(keyword, UNSORTED)}
            label="Chưa xếp"
            count={unsortedCount}
            active={categorySlug === UNSORTED}
          />
        )}
      </nav>

      <Panel bodyClassName="">
        {rows.length === 0 ? (
          <div className="px-4 py-14 text-center">
            <p className="text-sm text-stone-600">
              {products.length === 0
                ? 'Chưa có sản phẩm nào.'
                : 'Không có mẫu nào khớp với bộ lọc đang chọn.'}
            </p>
            {products.length === 0 ? (
              <Link
                href="/admin/san-pham/moi"
                className="mt-3 inline-block rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800"
              >
                Thêm mẫu diều đầu tiên
              </Link>
            ) : (
              <Link
                href="/admin/san-pham"
                className="mt-3 inline-block rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold text-ink-950 transition-colors hover:bg-stone-100"
              >
                Bỏ lọc
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-600">
                <tr>
                  <th className="px-4 py-3 font-bold md:px-5">Tên</th>
                  <th className="px-4 py-3 font-bold">Mã</th>
                  <th className="px-4 py-3 font-bold">Danh mục</th>
                  <th className="px-4 py-3 font-bold">Giá</th>
                  <th className="px-4 py-3 font-bold">Trạng thái</th>
                  <th className="px-4 py-3 text-right font-bold md:px-5">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {rows.map((product) => (
                  <tr
                    key={product.id}
                    className={`transition-colors hover:bg-stone-50 ${
                      product.archivedAt ? 'opacity-60' : ''
                    }`}
                  >
                    <td className="px-4 py-3 md:px-5">
                      <span className="block font-semibold text-ink-950">{product.name}</span>
                      <span className="block font-mono text-xs text-stone-500">{product.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <CopyId id={product.id} />
                    </td>
                    <td className="px-4 py-3 text-stone-700">
                      {product.categoryName ?? <span className="text-stone-500">Chưa xếp</span>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink-950">
                      {visiblePrice(product) ?? (
                        <span className="font-normal text-stone-500">
                          {product.priceText.trim() === '' ? 'Chưa ghi giá' : 'Đang ẩn giá'}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Status archived={product.archivedAt !== null} />
                    </td>
                    <td className="px-4 py-3 md:px-5">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/san-pham/${product.id}`}
                          className="text-sm font-semibold text-ink-950 hover:underline"
                        >
                          Sửa
                        </Link>
                        <ArchiveButton
                          productId={product.id}
                          productName={product.name}
                          archived={product.archivedAt !== null}
                        />
                        {/* Xoá hẳn chỉ mở ra sau khi đã gỡ: hai bước cố ý cho một thao tác
                            không lùi lại được. */}
                        {product.archivedAt !== null && (
                          <DeleteProductButton productId={product.id} productName={product.name} />
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

// Đổi danh mục không được xoá từ khoá đang tìm, và ngược lại.
function buildHref(keyword: string, category?: string): string {
  const query = new URLSearchParams()
  if (keyword !== '') query.set('tim', keyword)
  if (category) query.set('danh-muc', category)
  const suffix = query.toString()
  return suffix === '' ? '/admin/san-pham' : `/admin/san-pham?${suffix}`
}

function describe(
  total: number,
  shown: number,
  keyword: string,
  categoryLabel: string | null,
): string {
  if (keyword === '' && categoryLabel === null) {
    return `${total} mẫu diều, kể cả mẫu đã gỡ khỏi web.`
  }

  const parts: string[] = []
  if (categoryLabel !== null) parts.push(`nhóm ${categoryLabel}`)
  if (keyword !== '') parts.push(`từ khoá “${keyword}”`)
  return `${shown} mẫu khớp ${parts.join(', ')}.`
}

function FilterChip({
  href,
  label,
  count,
  active,
}: {
  href: string
  label: string
  count: number
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors ${
        active
          ? 'bg-ink-950 font-semibold text-white'
          : 'border border-stone-300 font-medium text-stone-700 hover:bg-stone-100'
      }`}
    >
      {label}
      <span className={active ? 'text-white/70' : 'text-stone-500'}>{count}</span>
    </Link>
  )
}

// Không còn trạng thái "Hết hàng": bỏ tồn kho 2026-07-27, diều làm theo đơn.
function Status({ archived }: { archived: boolean }) {
  if (archived) {
    return (
      <span className="inline-block rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-600">
        Đã gỡ
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-ink-950">
      Đang hiện
    </span>
  )
}
