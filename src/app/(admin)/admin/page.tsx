// Kiểu `Icon` chỉ có ở entry gốc, bản /ssr không xuất. `import type` bị xoá sạch lúc biên
// dịch nên lấy kiểu từ đó KHÔNG kéo bản client vào Server Component.
import type { Icon } from '@phosphor-icons/react'
import { CursorClick, Eye, Heart, MagnifyingGlass, Package } from '@phosphor-icons/react/ssr'
import Image from 'next/image'
import Link from 'next/link'
import { DonutChart, RankedBars, ViewsAreaChart } from '@/components/admin/Charts'
import { LiveRefresh } from '@/components/admin/LiveRefresh'
import { PageHeader, Panel } from '@/components/admin/Panel'
import type { ActivityItem } from '@/lib/admin-stats'
import { getAdminInsights, getAdminOverview } from '@/lib/admin-stats'
import type { Product } from '@/lib/products'
import { getProductsForAdmin } from '@/lib/products'
import type { ActorProfile } from '@/lib/profiles'
import { getActorProfiles } from '@/lib/profiles'
import { getProductImageUrl } from '@/lib/storage'

export default async function AdminHomePage() {
  const [overview, insights, products] = await Promise.all([
    getAdminOverview(),
    getAdminInsights(),
    getProductsForAdmin(),
  ])

  // Phải chờ insights xong mới biết cần tra danh tính của ai, nên truy vấn này đứng riêng
  // chứ không gộp vào Promise.all ở trên.
  const actors = await getActorProfiles(
    insights.recent.map((item) => item.userId).filter((id) => id !== null),
  )

  const byId = new Map(products.map((product) => [product.id, product]))
  // Nhật ký page_view chỉ ghi đường dẫn, nên cần bảng tra slug ngược về tên mẫu.
  const bySlug = new Map(products.map((product) => [product.slug, product.name]))
  const name = (productId: string | null) =>
    productId ? (byId.get(productId)?.name ?? 'Mẫu đã xoá') : null

  // Gộp lượt xem mẫu về theo danh mục cho biểu đồ tròn. Nhiều hơn 6 nhóm thì dồn phần đuôi
  // vào "Nhóm khác": bảng màu phân loại có 6 sắc đã kiểm, cái thứ 7 KHÔNG được sinh thêm màu.
  const viewsByCategory = new Map<string, number>()
  for (const row of insights.productViews) {
    const label = byId.get(row.productId)?.categoryName ?? 'Chưa xếp danh mục'
    viewsByCategory.set(label, (viewsByCategory.get(label) ?? 0) + row.count)
  }
  const ranked = [...viewsByCategory.entries()].sort((a, b) => b[1] - a[1])
  const categoryShare = [
    ...ranked.slice(0, 5).map(([label, count]) => ({ id: label, label, count })),
    ...(ranked.length > 5
      ? [
          {
            id: 'khac',
            label: 'Nhóm khác',
            count: ranked.slice(5).reduce((sum, [, count]) => sum + count, 0),
          },
        ]
      : []),
  ]

  return (
    <div>
      <PageHeader
        title="Tổng quan"
        description="Số liệu lấy thẳng từ nhật ký hành vi khách. Không có con số nào được bịa ra để trang trí."
      >
        <LiveRefresh />
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Eye}
          label="Lượt xem hôm nay"
          value={insights.viewsToday}
          note={`${overview.pageViews} lượt trong bảy ngày`}
        />
        <StatCard
          icon={Heart}
          label="Yêu thích mới hôm nay"
          value={insights.wishlistToday}
          note={`${overview.wishlistAdds} lượt trong bảy ngày`}
        />
        <StatCard
          icon={CursorClick}
          label="Bấm Zalo / gọi"
          value={overview.contactClicks}
          note="Bảy ngày gần nhất"
        />
        <StatCard
          icon={Package}
          label="Sản phẩm đang hiện"
          value={overview.visibleProducts}
          note={
            overview.archivedProducts > 0
              ? `${overview.archivedProducts} mẫu đã gỡ khỏi web`
              : 'Chưa gỡ mẫu nào'
          }
          href="/admin/san-pham"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Lượt xem trang, 14 ngày gần nhất">
            <ViewsAreaChart data={insights.dailyViews} />
          </Panel>
        </div>

        <Panel title="Lượt xem theo danh mục">
          <DonutChart
            unit="lượt xem"
            emptyLabel="Chưa có ai mở trang chi tiết mẫu nào trong 30 ngày."
            slices={categoryShare}
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Mẫu được xem nhiều nhất">
          <RankedBars
            unit="lượt xem"
            emptyLabel="Chưa có ai mở trang chi tiết mẫu nào trong 30 ngày."
            rows={insights.productViews.slice(0, 5).map((row) => ({
              id: row.productId,
              label: name(row.productId) ?? 'Mẫu đã xoá',
              count: row.count,
            }))}
          />
        </Panel>

        <Panel title="Mẫu được thả tim nhiều nhất">
          <RankedBars
            unit="lượt thích"
            emptyLabel="Chưa có ai thả tim mẫu nào trong 30 ngày."
            rows={insights.topWishlisted.map((row) => ({
              id: row.productId,
              label: name(row.productId) ?? 'Mẫu đã xoá',
              count: row.count,
            }))}
          />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Panel title="Hoạt động gần đây" bodyClassName="">
            {insights.recent.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-stone-600 md:px-5">
                Chưa có hoạt động nào được ghi lại.
              </p>
            ) : (
              <ul className="divide-y divide-stone-200">
                {insights.recent.map((item) => (
                  <ActivityRow
                    key={item.id}
                    type={item.type}
                    actor={describeActor(item, actors)}
                    target={describeTarget(item, name(item.productId), bySlug)}
                    occurredAt={item.occurredAt}
                  />
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <Panel
          title="Sản phẩm mới nhất"
          action={
            <Link
              href="/admin/san-pham"
              className="text-sm font-semibold text-ink-950 hover:underline"
            >
              Xem tất cả
            </Link>
          }
          bodyClassName=""
        >
          {products.length === 0 ? (
            <div className="px-4 py-10 text-center md:px-5">
              <p className="text-sm text-stone-600">Chưa có mẫu diều nào.</p>
              <Link
                href="/admin/san-pham/moi"
                className="mt-3 inline-block rounded-full bg-ink-950 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800"
              >
                Thêm sản phẩm đầu tiên
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-stone-200">
              {products.slice(0, 5).map((product) => (
                <ProductRow key={product.id} product={product} />
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  )
}

// Nhãn tiếng Việt cho từng loại event. Loại nào chưa khai thì hiện thẳng mã — thà thấy
// 'checkout_started' còn hơn nuốt mất một dòng lịch sử.
// Chữ thường vì nhãn đứng SAU tên người: "Nguyễn Minh · xem mẫu".
const EVENT_LABEL: Record<string, { label: string; icon: Icon }> = {
  page_view: { label: 'xem một trang', icon: Eye },
  product_view: { label: 'xem mẫu', icon: Package },
  add_to_wishlist: { label: 'thả tim mẫu', icon: Heart },
  remove_from_wishlist: { label: 'bỏ tim mẫu', icon: Heart },
  contact_click: { label: 'bấm Zalo / gọi', icon: CursorClick },
  search: { label: 'tìm kiếm', icon: MagnifyingGlass },
}

// Đường dẫn quen thuộc đổi thành tên người đọc hiểu. Đường dẫn lạ thì hiện nguyên si chứ
// không bịa nhãn — thấy '/khuyen-mai' còn biết là trang cũ nào đó còn sót link.
const PAGE_LABEL: Record<string, string> = {
  '/': 'Trang chủ',
  '/san-pham': 'Danh sách sản phẩm',
  '/yeu-thich': 'Danh sách yêu thích',
  '/lien-he': 'Trang liên hệ',
  '/tai-khoan': 'Trang cá nhân',
  '/dang-nhap': 'Trang đăng nhập',
  '/dang-ky': 'Trang đăng ký',
}

const CHANNEL_LABEL: Record<string, string> = { zalo: 'Qua Zalo', phone: 'Gọi điện' }

const PRODUCT_PATH = '/san-pham/'

// properties là jsonb tự do nên mọi thứ lấy ra đều phải kiểm kiểu, không tin sẵn.
function readText(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

// Ai làm: tên thật > tên tài khoản > nhãn chung. Khách chưa đăng nhập KHÔNG cố đoán ra
// danh tính — sáu ký tự đầu của session chỉ để hai khách vãng lai cùng lúc không lẫn vào nhau.
function describeActor(item: ActivityItem, actors: Map<string, ActorProfile>): string {
  if (!item.userId) return `Khách vãng lai #${item.sessionId.slice(0, 6)}`

  const actor = actors.get(item.userId)
  // Không tra được nghĩa là RLS chặn (admin phụ chỉ đọc được dòng của chính mình), không
  // phải tài khoản đã xoá. Xem getActorProfiles.
  if (!actor) return 'Khách đã đăng nhập'

  const fullName = actor.fullName?.trim()
  return fullName ? fullName : (actor.email ?? '(chưa có email)')
}

// Làm gì với cái gì: mẫu diều nào, trang nào, tìm từ khoá gì, bấm kênh nào.
function describeTarget(
  item: ActivityItem,
  productName: string | null,
  bySlug: Map<string, string>,
): string | null {
  if (productName) return productName

  const path = readText(item.properties.path)
  if (path) {
    const known = PAGE_LABEL[path]
    if (known) return known
    if (path.startsWith(PRODUCT_PATH)) {
      const slug = path.slice(PRODUCT_PATH.length)
      return bySlug.get(slug) ?? `Mẫu ${slug}`
    }
    return path
  }

  const query = readText(item.properties.query)
  if (query) {
    const count = item.properties.resultCount
    return typeof count === 'number' ? `“${query}” · ${count} kết quả` : `“${query}”`
  }

  const channel = readText(item.properties.channel)
  if (channel) return CHANNEL_LABEL[channel] ?? channel

  return null
}

const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
  timeZone: 'Asia/Ho_Chi_Minh',
})

function ActivityRow({
  type,
  actor,
  target,
  occurredAt,
}: {
  type: string
  actor: string
  target: string | null
  occurredAt: string
}) {
  const entry = EVENT_LABEL[type]
  const RowIcon = entry?.icon ?? Eye

  return (
    <li className="flex items-start gap-3 px-4 py-2.5 md:px-5">
      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-stone-100 text-ink-950">
        <RowIcon size={15} weight="bold" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm text-ink-950">
          <span className="font-semibold">{actor}</span>
          <span className="text-stone-600"> · {entry?.label ?? type}</span>
        </span>
        {target && <span className="block truncate text-xs text-stone-600">{target}</span>}
      </span>
      <time dateTime={occurredAt} className="mt-0.5 shrink-0 text-xs tabular-nums text-stone-500">
        {timeFormatter.format(new Date(occurredAt))}
      </time>
    </li>
  )
}

function StatCard({
  icon: StatIcon,
  label,
  value,
  note,
  href,
}: {
  icon: Icon
  label: string
  value: number
  note: string
  href?: string
}) {
  const body = (
    <>
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-stone-100 text-ink-950">
        <StatIcon size={21} weight="bold" />
      </span>
      <span className="mt-4 block text-3xl font-bold tabular-nums tracking-tight text-ink-950">
        {value}
      </span>
      <span className="mt-0.5 block text-sm font-semibold text-ink-950">{label}</span>
      <span className="mt-1 block text-xs text-stone-600">{note}</span>
    </>
  )

  const className = 'block rounded-2xl border border-stone-200 bg-white p-5'

  if (!href) return <div className={className}>{body}</div>

  return (
    <Link href={href} className={`${className} transition-colors hover:border-stone-400`}>
      {body}
    </Link>
  )
}

function ProductRow({ product }: { product: Product }) {
  return (
    <li className="flex items-center gap-3 px-4 py-3 md:px-5">
      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-stone-100">
        {product.imagePath && (
          <Image
            src={getProductImageUrl(product.imagePath)}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-ink-950">{product.name}</span>
        <span className="block truncate text-xs text-stone-600">
          {product.categoryName ?? 'Chưa xếp danh mục'}
        </span>
      </span>
      <Link
        href={`/admin/san-pham/${product.id}`}
        className="shrink-0 text-sm font-semibold text-ink-950 hover:underline"
      >
        Sửa
      </Link>
    </li>
  )
}
