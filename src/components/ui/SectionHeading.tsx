// Tiêu đề mục dùng chung cho trang chủ.
//
// Bản 2026-07-28 bỏ vạch cam và kiểu chữ in hoa: storefront chuyển sang tông trung tính,
// tiêu đề chỉ cần đậm và tracking chặt là đủ tách khỏi nội dung.
export function SectionHeading({ id, title }: { id?: string; title: string }) {
  return (
    // scroll-mt: header dính trên đầu, không chừa chỗ thì nhảy neo (#danh-muc, #khuyen-mai,
    // #gioi-thieu) sẽ bị header che mất dòng tiêu đề.
    <h2
      id={id}
      className="mb-6 scroll-mt-28 text-2xl font-bold tracking-tighter text-ink-950 md:mb-8 md:text-3xl"
    >
      {title}
    </h2>
  )
}
