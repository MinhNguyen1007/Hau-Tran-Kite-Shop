// POST /api/lien-he — nhận tin nhắn từ form liên hệ.
// Thứ tự bắt buộc (skill api-route): validate → auth → gọi lib → format lỗi.
// Route này KHÔNG cần đăng nhập (khách vãng lai phải liên hệ được), nên bước auth chỉ là
// đọc session để gắn user_id — việc đó nằm trong lib/contact.ts.
import { z } from 'zod'
import { fail } from '@/lib/api'
import { createContactMessage } from '@/lib/contact'

// Số điện thoại VN nhập tay đủ kiểu: '0387 315 341', '+84387315341', '038-731-5341'.
// Chỉ chặn ký tự lạ, không ép đúng một định dạng — ép chặt quá thì khách thật gõ không lọt.
const PHONE_PATTERN = /^[0-9+\-.\s()]+$/

const BodySchema = z.object({
  name: z.string().trim().min(1, 'Chưa nhập tên').max(100),
  phone: z
    .string()
    .trim()
    .min(8, 'Số điện thoại quá ngắn')
    .max(20)
    .regex(PHONE_PATTERN, 'Số điện thoại không hợp lệ'),
  // Email không bắt buộc: nhiều khách chỉ để lại số điện thoại.
  email: z.union([z.literal(''), z.email('Email không hợp lệ').max(200)]).optional(),
  message: z.string().trim().min(1, 'Chưa nhập nội dung').max(2000),
})

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = BodySchema.safeParse(body)
  if (!parsed.success) {
    // Lấy câu đầu tiên để hiện thẳng dưới form; phần còn lại không cần thiết cho khách.
    const message = parsed.error.issues[0]?.message ?? 'Dữ liệu không hợp lệ'
    return fail(400, 'INVALID_INPUT', message)
  }

  try {
    await createContactMessage({
      name: parsed.data.name,
      phone: parsed.data.phone,
      email: parsed.data.email ? parsed.data.email : null,
      message: parsed.data.message,
    })
  } catch {
    return fail(500, 'INTERNAL', 'Không gửi được tin nhắn, thử lại giúp shop nhé')
  }

  // logEvent('contact_submitted') bắn ở phía client sau khi nhận 201 (analytics.ts là adapter
  // client, cần session_id trong cookie trình duyệt).
  return Response.json({ data: { ok: true } }, { status: 201 })
}
