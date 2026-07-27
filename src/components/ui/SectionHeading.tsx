// Tiêu đề mục căn giữa + gạch chân cam, dùng lại cho mọi section ở trang chủ
// (theo đúng nhịp của thiết kế tham chiếu).
export function SectionHeading({ id, title }: { id?: string; title: string }) {
  return (
    <div className="mb-6 text-center md:mb-8">
      <h2
        id={id}
        className="scroll-mt-20 text-xl font-extrabold uppercase tracking-wide text-brand-600 md:text-2xl dark:text-brand-400"
      >
        {title}
      </h2>
      <span className="mx-auto mt-2.5 block h-1 w-14 rounded-full bg-brand-500" aria-hidden />
    </div>
  )
}
