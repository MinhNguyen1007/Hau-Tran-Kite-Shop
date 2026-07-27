// Mục kinh nghiệm chơi diều — thay cho khối "Tin tức mới" của thiết kế tham chiếu.
// Admin viết bài ở /admin/noi-dung (section 'guide'); để trống href thì thẻ không bấm được,
// điền vào thì thành link — khỏi phải sửa code khi sau này có trang bài viết riêng.
import Link from 'next/link'
import { ContentIcon } from '@/components/ui/ContentIcon'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { getBlocks } from '@/lib/content-blocks'

export async function GuideCards() {
  const guides = await getBlocks('guide')
  if (guides.length === 0) return null

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-6 md:py-8">
      <SectionHeading id="kinh-nghiem" title="Kinh nghiệm chơi diều" />

      <div className="grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4">
        {guides.map((guide) => {
          const card = (
            <>
              <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-ink-800 dark:text-brand-400">
                <ContentIcon name={guide.icon} size={22} />
              </span>
              <h3 className="text-base font-bold text-ink-900 dark:text-stone-50">{guide.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                {guide.body}
              </p>
            </>
          )

          const className =
            'block rounded-2xl border border-stone-200 bg-white p-5 dark:border-ink-700 dark:bg-ink-900'

          return guide.href ? (
            <Link
              key={guide.id}
              href={guide.href}
              className={`${className} transition-colors hover:border-brand-300 dark:hover:border-brand-700`}
            >
              {card}
            </Link>
          ) : (
            <article key={guide.id} className={className}>
              {card}
            </article>
          )
        })}
      </div>
    </section>
  )
}
