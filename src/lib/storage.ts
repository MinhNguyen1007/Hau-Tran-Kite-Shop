// Adapter Supabase Storage. DB chỉ lưu PATH ảnh (vd 'kites/canh-coc-01.webp'),
// dựng URL công khai qua đây — không gọi Storage thẳng trong component, không lưu full URL trong DB.
// getPublicUrl chỉ dựng chuỗi (không gọi mạng) nên client thường này chạy cả server lẫn client.
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } },
)

const BUCKET = 'products'
// Bucket riêng cho ảnh đại diện: quyền ghi khác hẳn bucket 'products' (mỗi khách chỉ ghi vào
// thư mục mang uid của mình) nên không dùng chung được — xem migration 20260728160000.
// Xuất ra vì đường XOÁ file (dọn ảnh cũ) nằm ở nơi khác và phải nhắm đúng bucket này:
// client trong file này cố ý không giữ session nên không xoá được gì.
export const AVATAR_BUCKET = 'avatars'

export function getProductImageUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}

export function getAvatarUrl(path: string): string {
  return supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path).data.publicUrl
}
