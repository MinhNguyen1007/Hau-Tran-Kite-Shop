// Xoá file ảnh đại diện khỏi Storage, phía TRÌNH DUYỆT.
//
// Không gộp vào storage.ts: client bên đó dựng bằng createClient + persistSession:false (chỉ để
// ghép URL công khai) nên không mang session — mà xoá thì RLS avatars_objects_delete_self đòi
// auth.uid() khớp thư mục. Phải đi bằng createBrowserSupabase().
//
// Vì sao cần dọn: AvatarUploader đẩy file lên Storage NGAY lúc chọn, còn profiles.avatar_path
// chỉ ghi lúc bấm Lưu. Mỗi lần đổi ý là một file nằm lại bucket không ai trỏ tới — đo trên
// production 2026-08-02, một khách có 3 file mà chỉ 1 được dùng.
import { AVATAR_BUCKET } from './storage'
import { createBrowserSupabase } from './supabase-browser'

// Nuốt mọi lỗi: đây là việc dọn dẹp, hỏng thì chỉ còn lại một file thừa vài trăm KB. Ném lỗi ra
// giữa lúc khách đang đổi ảnh hay đang rời trang thì đổi một phiền toái nhỏ lấy một phiền toái to.
export async function removeAvatarFile(path: string): Promise<void> {
  try {
    await createBrowserSupabase().storage.from(AVATAR_BUCKET).remove([path])
  } catch {
    // im lặng, đúng như trên
  }
}
