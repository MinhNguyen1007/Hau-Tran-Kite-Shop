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

export function getProductImageUrl(path: string): string {
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl
}
