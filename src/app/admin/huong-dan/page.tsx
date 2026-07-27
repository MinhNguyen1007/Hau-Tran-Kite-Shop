import { Plus, WarningCircle } from '@phosphor-icons/react/ssr'
import Link from 'next/link'
import { RowActionButton } from '@/components/admin/RowActionButton'
import { getGuideVideosForAdmin } from '@/lib/guide-videos'
import { requireAdmin } from '@/lib/supabase'

export default async function AdminGuidesPage() {
  await requireAdmin()

  const guides = await getGuideVideosForAdmin()
  const missingLink = guides.filter((guide) => guide.youtubeUrl === '').length

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-ink-900 dark:text-stone-50">
            Hướng dẫn chơi diều ({guides.length})
          </h1>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
            Hiện ở trang /huong-dan và cụm link cuối trang.
          </p>
        </div>

        <Link
          href="/admin/huong-dan/moi"
          className="flex items-center gap-1.5 rounded-full bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-700 active:scale-[0.98]"
        >
          <Plus size={16} weight="bold" />
          Thêm bài
        </Link>
      </div>

      {missingLink > 0 && (
        <p className="mb-4 flex items-start gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800 dark:border-brand-800 dark:bg-ink-900 dark:text-brand-400">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {missingLink} bài chưa có link YouTube. Khách vẫn thấy tiêu đề nhưng chưa bấm vào được.
        </p>
      )}

      {guides.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-600 dark:border-ink-700 dark:text-stone-400">
          Chưa có bài hướng dẫn nào.
        </p>
      ) : (
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-xl border border-stone-200 bg-white dark:divide-ink-700 dark:border-ink-700 dark:bg-ink-900">
          {guides.map((guide) => (
            <li key={guide.id} className="flex items-center gap-3 p-3.5">
              <span className="min-w-0 flex-1">
                <Link
                  href={`/admin/huong-dan/${guide.id}`}
                  className="block truncate text-sm font-bold text-ink-900 hover:text-brand-700 dark:text-stone-50 dark:hover:text-brand-400"
                >
                  {guide.title}
                </Link>
                <span className="block truncate text-xs text-stone-500 dark:text-stone-400">
                  {guide.youtubeUrl || 'chưa có link'}
                </span>
              </span>

              {!guide.active && (
                <span className="shrink-0 rounded-full bg-stone-200 px-2.5 py-1 text-[11px] font-bold text-stone-700 dark:bg-ink-800 dark:text-stone-300">
                  Đang ẩn
                </span>
              )}

              <span className="shrink-0 text-xs tabular-nums text-stone-500 dark:text-stone-400">
                #{guide.sortOrder}
              </span>

              <RowActionButton
                endpoint={`/api/admin/huong-dan/${guide.id}`}
                label={`Xoá ${guide.title}`}
                confirmText={`Xoá hẳn bài "${guide.title}"? Không khôi phục lại được.`}
                action="delete"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
