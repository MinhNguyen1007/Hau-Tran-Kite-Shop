import type { NextConfig } from "next";

// Host ảnh suy ra TỪ NEXT_PUBLIC_SUPABASE_URL chứ không viết cứng. Local là
// 127.0.0.1:55321, cloud là <project-ref>.supabase.co — cùng một biến env đã quyết định chỗ
// đọc dữ liệu thì để nó quyết định luôn chỗ tải ảnh, khỏi phải nhớ sửa hai nơi khi đổi project.
// Cổng 55321 chứ không phải 54321 mặc định: dải 5432x nằm trong vùng cổng Windows trưng dụng
// cho Hyper-V nên Docker không bind được (xem supabase/config.toml).
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!rawSupabaseUrl) {
  // Ném ngay lúc build thay vì âm thầm rơi về localhost: thiếu biến này trên Vercel mà vẫn
  // build được thì web lên sóng với TOÀN BỘ ảnh sản phẩm hỏng, và lỗi 400 đó không chỉ về
  // nguyên nhân thật. Thà gãy build với câu báo rõ ràng.
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL chưa cấu hình — next.config.ts cần nó để cho phép next/image tải ảnh từ Supabase Storage.",
  );
}
const supabaseUrl = new URL(rawSupabaseUrl);

const nextConfig: NextConfig = {
  images: {
    // Chỉ đúng host Supabase đang dùng, không mở `**.supabase.co`: mở rộng ra cả wildcard là
    // cho người lạ mượn optimizer của mình tải ảnh từ project Supabase bất kỳ.
    remotePatterns: [
      {
        protocol: supabaseUrl.protocol === "https:" ? "https" : "http",
        hostname: supabaseUrl.hostname,
        port: supabaseUrl.port,
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Next 16 chặn optimizer fetch ảnh từ IP nội bộ (chống SSRF) — Supabase local nằm ở
    // 127.0.0.1 nên MỌI ảnh sản phẩm trả 400 "resolved to private ip", dù remotePatterns đúng.
    // Chỉ mở ở dev; production ảnh nằm trên host Supabase công khai nên không cần, và bật
    // ngoài đó là tự mở đường cho SSRF.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
