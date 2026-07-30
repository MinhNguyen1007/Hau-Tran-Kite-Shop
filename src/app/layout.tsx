import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { PageView } from "@/components/analytics/PageView";
import { getSiteSettings } from "@/lib/site-settings";
import "./globals.css";

// Be Vietnam Pro: font thiết kế riêng cho dấu tiếng Việt (Geist thiếu subset vietnamese,
// chữ có dấu bị rơi sang font hệ thống).
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// generateMetadata chứ không phải hằng `metadata`: tên shop và câu mô tả nằm trong
// site_settings để admin sửa được, y như mọi chữ khác hiện ra ngoài. Trước 2026-07-30 hai thứ
// này viết cứng ở đây, nên ô "Câu mô tả ngắn" trong /admin/cai-dat gõ vào không đổi được gì.
//
// `title.template` áp cho MỌI trang con: trang con chỉ khai phần riêng của nó ('Đăng nhập'),
// Next tự ghép ' | <tên shop>'. Trước đây mỗi trang tự nối tên shop bằng tay theo ba kiểu khác
// nhau (chuỗi literal, hằng SHOP.name, settings.shopName) nên đổi tên shop trong admin chỉ ăn
// vào một phần các trang.
//
// getSiteSettings đã bọc cache() nên gọi ở đây KHÔNG tốn thêm truy vấn: cùng một request,
// SiteHeader và SiteFooter dùng chung kết quả.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: settings.tagline
        ? `${settings.shopName} | ${settings.tagline}`
        : settings.shopName,
      template: `%s | ${settings.shopName}`,
    },
    // Bỏ hẳn thẻ description khi admin để trống, thay vì gắn thẻ rỗng — thẻ rỗng là tín hiệu
    // xấu với công cụ tìm kiếm, còn không có thẻ thì chúng tự trích từ nội dung trang.
    description: settings.tagline || undefined,
  };
}

// Root layout CỐ Ý không có SiteHeader/SiteFooter: khu /admin có vỏ riêng (sidebar tối +
// topbar) và không được đội thêm header storefront. Header/footer nằm ở (shop)/layout.tsx.
// Root chỉ giữ những thứ mọi route đều cần: html, font, css, PageView.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // data-scroll-behavior: Next 16 tự cuộn về đầu trang khi đổi route. Trang này khai
    // `scroll-behavior: smooth` trong globals.css, nên phải báo cho Next biết là cố ý —
    // thiếu thuộc tính này thì console cảnh báo và cú cuộn lúc đổi route bị bỏ qua.
    <html
      lang="vi"
      data-scroll-behavior="smooth"
      className={`${beVietnamPro.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <PageView />
        {children}
      </body>
    </html>
  );
}
