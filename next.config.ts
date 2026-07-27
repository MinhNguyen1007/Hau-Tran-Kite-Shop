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
  },
};

export default nextConfig;
