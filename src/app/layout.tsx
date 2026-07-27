import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import { PageView } from "@/components/analytics/PageView";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SHOP } from "@/lib/shop";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

// Be Vietnam Pro: font thiết kế riêng cho dấu tiếng Việt (Geist thiếu subset vietnamese,
// chữ có dấu bị rơi sang font hệ thống).
const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: `${SHOP.name} | Diều cánh cốc thủ công`,
  description:
    "Diều cánh cốc khung tre vót tay, phất giấy dó, cân sáo bằng tai. Nhận đặt riêng kích cỡ và hoạ tiết, giao toàn quốc.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: script dưới đây gắn class .dark vào <html> trước khi React
    // hydrate, nên markup client cố ý khác server ở đúng thuộc tính class này.
    <html
      lang="vi"
      className={`${beVietnamPro.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="flex min-h-full flex-col">
        <PageView />
        <SiteHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
