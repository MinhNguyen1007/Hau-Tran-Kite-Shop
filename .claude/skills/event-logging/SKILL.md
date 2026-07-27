---
name: event-logging
description: Dùng khi code BẤT KỲ tính năng nào khách chạm vào — trang mới, nút yêu thích, nút Zalo/gọi, tìm kiếm, form liên hệ. Chốt taxonomy event_type, schema bảng events, và luật gọi logEvent. Đọc trước khi coi một tính năng là xong.
---

# Event logging

## Vì sao không hoãn được

RAG, semantic search, gợi ý sản phẩm, ELT → warehouse → dbt: tất cả chỉ **đọc dữ liệu đã có**,
áp vào lúc nào cũng được. Clickstream thì không — hành vi khách không ghi hôm nay là **mất
vĩnh viễn**. Tới lúc làm phần DE mới phát hiện không có gì để phân tích thì đã muộn.

Nên: mỗi tính năng gắn `logEvent` **ngay lúc viết**, không quay lại vá.

## Bảng `public.events`

Append-only. Không ai được `update` / `delete`.

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `id` | `bigint generated always as identity` | PK |
| `occurred_at` | `timestamptz not null default now()` | |
| `session_id` | `text not null` | id ẩn danh trong cookie |
| `user_id` | `uuid references auth.users on delete set null` | null = khách vãng lai |
| `event_type` | `text not null` | theo taxonomy dưới |
| `product_id` | `uuid references public.products on delete set null` | |
| `properties` | `jsonb not null default '{}'` | field phát sinh, khỏi migration lại |

`session_id` là **bắt buộc**, không được để null. Không có nó thì không nối được chuỗi hành vi
của khách chưa đăng nhập → không dựng được funnel, dữ liệu gần như vô dụng.
Sinh một uuid lưu cookie ở lần ghé đầu, giữ nguyên qua các phiên.

RLS:
```sql
alter table public.events enable row level security;

create policy "events_insert" on public.events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "events_select_admin" on public.events
  for select using (public.is_admin());
```

Index: `(occurred_at)`, `(event_type, occurred_at)`, `(session_id)`.

## Taxonomy — CHỐT, không đổi tên

Đổi tên `event_type` giữa chừng làm lệch toàn bộ dữ liệu lịch sử, không sửa được.
Cần loại mới thì **thêm**, đừng sửa cái cũ.

### Đang dùng

| `event_type` | Bắn ở đâu | `properties` |
|---|---|---|
| `page_view` | mọi trang | `{ path }` |
| `product_view` | trang chi tiết sản phẩm | — |
| `add_to_wishlist` | bấm tim (`wishlist-store.ts`) | — |
| `remove_from_wishlist` | bỏ tim | — |
| `contact_click` | nút Zalo / gọi (`ContactCta`) | `{ channel: 'zalo' \| 'phone', source }` |
| `search` | ô tìm kiếm | `{ query, resultCount }` |
| `contact_submitted` | form liên hệ | — |

`contact_click` là **chuyển đổi** của web này — web không nhận đơn nên đây là tín hiệu gần
nhất với "khách muốn mua". `source` cho biết bấm từ đâu (`product_detail`, `wishlist`…) để
sau này tách được tỉ lệ chuyển đổi theo vị trí đặt nút.

### Ngừng bắn từ 2026-07-27 — KHÔNG xoá khỏi union

`add_to_cart`, `remove_from_cart`, `checkout_started`, `order_paid`.

Bỏ thanh toán online nên không còn chỗ bắn, nhưng dữ liệu cũ trong bảng `events` vẫn mang
các giá trị này. Giữ trong `EventType` để đọc lại được bằng đúng kiểu; đừng đổi tên chúng
thành loại mới, dữ liệu lịch sử sẽ lệch không sửa được.

## `src/lib/analytics.ts`

```ts
export type EventType =
  // đang dùng
  | 'page_view' | 'product_view' | 'add_to_wishlist' | 'remove_from_wishlist'
  | 'contact_click' | 'search' | 'contact_submitted'
  // ngừng bắn, giữ để đọc dữ liệu cũ
  | 'add_to_cart' | 'remove_from_cart' | 'checkout_started' | 'order_paid'

export async function logEvent(
  type: EventType,
  payload?: { productId?: string; properties?: Record<string, unknown> },
): Promise<void>
```

Ràng buộc hành vi — không thương lượng:

- **Fire-and-forget.** Không `await` chặn đường đi của user. Bấm tim thì danh sách phải cập
  nhật ngay, không đợi log xong. Nút Zalo/gọi là `<a>` thật, tuyệt đối không `preventDefault`
  để chờ log — chặn đúng cú bấm quan trọng nhất trang.
- **Không bao giờ throw.** Bọc toàn bộ trong `try/catch` nuốt lỗi. Analytics chết thì im lặng
  chết; tuyệt đối không để nó làm sập luồng bán hàng.
- **Không chặn UI**, không hiện toast lỗi khi log hỏng.

GĐ1 implement = insert thẳng qua Supabase client + RLS ở trên. Vì đã bọc trong `src/lib/`,
sau này đổi sang API route / queue / warehouse chỉ thay adapter, không sửa chỗ gọi.

**Đặt lời gọi ở STORE, đừng rải ra từng nút.** `add_to_wishlist` / `remove_from_wishlist` bắn
trong `src/lib/wishlist-store.ts` chứ không trong `WishlistButton`: mọi đường vào/ra danh sách
đều đi qua store, đặt ở đó thì không có cửa nào thêm/bớt mà quên log.

## Trước khi coi một tính năng là xong

- [ ] Tính năng này ứng với `event_type` nào trong bảng trên? Đã gắn chưa?
- [ ] `session_id` có được truyền vào không (kể cả khi user chưa login)?
- [ ] Log hỏng thì tính năng vẫn chạy bình thường?
- [ ] Nếu cần loại event MỚI: đã THÊM vào union chứ không sửa tên loại cũ?
