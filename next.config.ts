import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Cho next/image tải ảnh sản phẩm từ Supabase Storage local.
    // Cổng 55321 chứ không phải 54321 mặc định: dải 5432x nằm trong vùng cổng Windows trưng dụng
    // cho Hyper-V nên Docker không bind được (xem supabase/config.toml).
    // GĐ2 (cloud): thêm hostname project Supabase thật vào đây.
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "55321",
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
