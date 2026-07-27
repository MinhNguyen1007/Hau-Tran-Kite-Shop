---
name: api-route
description: Dùng khi tạo hoặc sửa một Next.js API route / Server Action trong dự án này — bất kỳ file nào trong src/app/api/ hoặc hàm "use server". Đưa ra thứ tự bắt buộc validate → auth → gọi lib → format lỗi.
---

# Khuôn API route

Mọi route trong `src/app/api/**/route.ts` phải theo ĐÚNG thứ tự này:

1. **Validate input bằng zod.** Parse `await req.json()` qua schema. Sai → 400.
   Không đọc field thẳng từ body.
2. **Xác thực user + kiểm role.** Lấy session từ Supabase server client.
   Thiếu session → 401. Sai role → 403.
   Route admin phải kiểm role Ở ĐÂY **kể cả khi** RLS đã chặn — kiểm CẢ HAI lớp.
3. **Gọi hàm trong `src/lib/`.** Không viết query DB thẳng trong route.
4. **Trả lỗi theo format thống nhất** `{ error: { code, message } }`.
   Không leak stack trace, không leak message của Postgres ra client.
5. **Gắn `logEvent`** nếu route ứng với một hành vi trong taxonomy (xem skill `event-logging`).

## Mẫu

```ts
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerClient, requireRole } from '@/lib/supabase'
import { createProduct } from '@/lib/products'

const BodySchema = z.object({
  name: z.string().min(1),
  priceVnd: z.number().int().positive(),
})

function fail(status: number, code: string, message: string) {
  return NextResponse.json({ error: { code, message } }, { status })
}

export async function POST(req: Request) {
  const parsed = BodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return fail(400, 'INVALID_INPUT', 'Dữ liệu không hợp lệ')

  const supabase = getServerClient()
  const auth = await requireRole(supabase, 'admin')
  if (!auth.ok) return fail(auth.status, auth.code, auth.message)

  try {
    const product = await createProduct(supabase, parsed.data)
    return NextResponse.json({ data: product }, { status: 201 })
  } catch {
    return fail(500, 'INTERNAL', 'Không tạo được sản phẩm')
  }
}
```

## Mã lỗi dùng chung

`INVALID_INPUT` (400) · `UNAUTHENTICATED` (401) · `FORBIDDEN` (403) ·
`NOT_FOUND` (404) · `CONFLICT` (409) · `INTERNAL` (500)

## Bẫy hay gặp

- Dùng `SUPABASE_SERVICE_ROLE_KEY` cho tiện → bỏ qua RLS luôn. Chỉ dùng service role
  khi thật sự cần vượt RLS (vd: webhook), và phải tự kiểm quyền tay.
- Tin dữ liệu client gửi lên. Giá, tồn kho, quyền — luôn đọc lại từ DB, đừng lấy từ body.
