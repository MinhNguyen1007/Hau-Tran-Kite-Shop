import { PlayCircle } from '@phosphor-icons/react/ssr'
import type { Metadata } from 'next'
import { getGuideVideos } from '@/lib/guide-videos'
import { getSiteSettings } from '@/lib/site-settings'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return {
    title: `Hướng dẫn chơi diều | ${settings.shopName}`,
    description:
      'Video hướng dẫn lắp diều, căng dây, cân sáo và thả diều an toàn từ xưởng diều thủ công.',
  }
}

export default async function GuidesPage() {
  const guides = await getGuideVideos()

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:py-14">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 md:text-3xl dark:text-stone-50">
        Hướng dẫn chơi diều
      </h1>
      <p className="mb-8 mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
        Cách lắp khung, căng dây, cân sáo và thả diều an toàn. Có gì chưa rõ thì nhắn Zalo cho
        xưởng, shop chỉ tận nơi.
      </p>

      {guides.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-600 dark:border-ink-700 dark:text-stone-400">
          Shop đang chuẩn bị các bài hướng dẫn, bạn quay lại sau nhé.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {guides.map((guide) => {
            const content = (
              <>
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700 dark:bg-ink-800 dark:text-brand-400">
                  <PlayCircle size={24} weight="fill" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold text-ink-900 dark:text-stone-50">
                    {guide.title}
                  </span>
                  {guide.description && (
                    <span className="mt-1 block text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                      {guide.description}
                    </span>
                  )}
                  {/* Chưa có link thì nói thẳng, đừng để khách bấm vào chỗ không đi đâu cả. */}
                  {!guide.youtubeUrl && (
                    <span className="mt-1 block text-xs text-stone-500 dark:text-stone-400">
                      Video đang được chuẩn bị
                    </span>
                  )}
                </span>
              </>
            )

            const boxClass =
              'flex items-start gap-4 rounded-xl border border-stone-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900'

            return (
              <li key={guide.id}>
                {guide.youtubeUrl ? (
                  <a
                    href={guide.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${boxClass} transition-colors hover:border-brand-600 dark:hover:border-brand-400`}
                  >
                    {content}
                  </a>
                ) : (
                  <div className={boxClass}>{content}</div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
