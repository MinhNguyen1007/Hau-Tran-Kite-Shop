// Lớp truy cập dữ liệu cho form liên hệ. Ghi qua client anon/authenticated (KHÔNG service role)
// để RLS vẫn là lớp chặn cuối; policy contact_messages_insert cho phép cả khách vãng lai.
import { createServerSupabase } from './supabase'

export type ContactInput = {
  name: string
  phone: string
  email: string | null
  message: string
}

export type ContactMessage = ContactInput & {
  id: string
  createdAt: string
  handled: boolean
}

export async function createContactMessage(input: ContactInput): Promise<void> {
  const supabase = await createServerSupabase()

  // Gắn user_id nếu khách đang đăng nhập — sau này nối tin nhắn với đơn hàng của họ.
  // getUser (không phải getSession) vì cookie suông không đáng tin.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { error } = await supabase.from('contact_messages').insert({
    user_id: user?.id ?? null,
    name: input.name,
    phone: input.phone,
    email: input.email,
    message: input.message,
  })
  if (error) throw error
}

// Dùng ở trang admin. RLS chỉ trả về dòng nào khi is_admin() đúng, nhưng route gọi hàm này
// vẫn phải requireAdmin() ở tầng API — kiểm CẢ HAI lớp.
export async function getContactMessages(): Promise<ContactMessage[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('contact_messages')
    .select('id, created_at, name, phone, email, message, handled')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error

  return (data ?? []).map((row) => ({
    id: row.id as string,
    createdAt: row.created_at as string,
    name: row.name as string,
    phone: row.phone as string,
    email: row.email as string | null,
    message: row.message as string,
    handled: row.handled as boolean,
  }))
}
