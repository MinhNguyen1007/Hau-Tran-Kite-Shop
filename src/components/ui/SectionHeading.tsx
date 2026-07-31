// Tiêu đề mục dùng chung cho trang chủ.
//
// Bản 2026-07-28 bỏ vạch cam và kiểu chữ in hoa: storefront chuyển sang tông trung tính,
// tiêu đề chỉ cần đậm và tracking chặt là đủ tách khỏi nội dung.
//
// KHÔNG nhận `id` nữa: neo (#danh-muc, #gioi-thieu) chuyển lên thẻ <section> bao ngoài, vì
// scroll-spy trong MainNav cần một element CAO BẰNG CẢ KHỐI để biết khách đang xem phần nào.
// Đặt neo trên dòng tiêu đề thì cuộn qua nó vài trăm pixel là mục nav tắt ngay.
// `reveal-on-scroll` đặt ngay trong đây (không nhận qua prop): cả ba mục trang chủ đều dùng
// component này, tiêu đề nào cũng phải hiện dần khi cuộn tới thì nhịp mới đều.
export function SectionHeading({ title }: { title: string }) {
  return (
    <h2 className="reveal-on-scroll mb-6 text-2xl font-bold tracking-tighter text-ink-950 md:mb-8 md:text-3xl">
      {title}
    </h2>
  )
}
