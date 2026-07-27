import { Plus } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { ContentIcon } from '@/components/ui/ContentIcon'
import { DeleteBlockButton } from '@/components/admin/DeleteBlockButton'
import { getBlocksForAdmin } from '@/lib/content-blocks'
import { SECTIONS, SECTION_HINT, SECTION_LABEL } from '@/lib/content-blocks-shared'
import { requireAdmin } from '@/lib/supabase'

export default async function AdminContentPage() {
  // Layout /admin đã chặn người lạ, nhưng kiểm lại ở đây: layout chỉ che giao diện,
  // trang này tự đọc dữ liệu nên tự chịu trách nhiệm về quyền (xem CLAUDE.md).
  await requireAdmin()

  const blocks = await getBlocksForAdmin()

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
            Nội dung trang chủ
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Các khối hiện trên trang chủ, xếp theo đúng thứ tự khách nhìn thấy.
          </p>
        </div>

        <Link
          href="/admin/noi-dung/moi"
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Thêm khối
        </Link>
      </div>

      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => {
          const items = blocks.filter((block) => block.section === section)

          return (
            <section key={section}>
              <h2 className="text-base font-extrabold text-ink-900 dark:text-stone-50">
                {SECTION_LABEL[section]}
              </h2>
              <p className="mb-3 mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {SECTION_HINT[section]}
              </p>

              {items.length === 0 ? (
                <p className="rounded-xl border border-dashed border-stone-300 px-5 py-6 text-center text-sm text-stone-600 dark:border-ink-700 dark:text-stone-400">
                  Chưa có khối nào — phần này đang không hiện trên trang chủ.
                </p>
              ) : (
                <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-900">
                  {items.map((block) => (
                    <li key={block.id} className="flex items-center gap-3 p-3.5">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-ink-800 dark:text-brand-400">
                        <ContentIcon name={block.icon} size={18} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <Link
                          href={`/admin/noi-dung/${block.id}`}
                          className="block truncate text-sm font-bold text-ink-900 hover:text-brand-700 dark:text-stone-50 dark:hover:text-brand-400"
                        >
                          {block.subtitle && (
                            <span className="text-brand-700 dark:text-brand-400">
                              {block.subtitle}{' '}
                            </span>
                          )}
                          {block.title}
                        </Link>
                        {block.body && (
                          <span className="mt-0.5 block truncate text-xs text-stone-600 dark:text-stone-400">
                            {block.body}
                          </span>
                        )}
                      </span>

                      {!block.active && (
                        <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700 dark:bg-ink-800 dark:text-stone-300">
                          Đang ẩn
                        </span>
                      )}

                      <span className="shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                        #{block.sortOrder}
                      </span>

                      <DeleteBlockButton id={block.id} title={block.title} />
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
