# Kiến trúc — Kite Shop

Tài liệu dài của dự án. `CLAUDE.md` giữ ngắn và link ra đây.

---

## 1. Chiến lược: local trước, online sau

- **Giai đoạn 1 (đang làm):** code + test toàn bộ MVP trên máy bằng Supabase local
  chạy trong Docker qua Supabase CLI. Không tốn tiền, sai thoải mái.
- **Giai đoạn 2:** khi MVP ổn → Vercel + Supabase cloud. Xem [deploy.md](deploy.md).
- **AWS để dành cho lớp DE về sau** (warehouse + pipeline), KHÔNG dùng để host shop.

**Vì sao Supabase:** là Postgres thật (SQL) → map thẳng sang warehouse + dbt cho câu chuyện
Data Engineer; có **pgvector** sẵn trong DB → sau này làm RAG / semantic search ngay trong
cùng database, khỏi dựng vector DB riêng; auth Google + storage dựng sẵn.

| Lớp | GĐ1 (local) | GĐ2 (online) |
|---|---|---|
| Frontend / Backend | Next.js App Router + TS + Tailwind | Vercel |
| Auth | Supabase Auth + Google | Supabase cloud |
| DB | Supabase Postgres (Docker) | Supabase cloud |
| Vector | pgvector cùng DB | y hệt |
| Ảnh | Supabase Storage | y hệt |
| Payment | **không có** — chốt đơn qua Zalo/điện thoại | y hệt |

---

## 2. Lớp adapter `src/lib/` — nguyên tắc xuyên suốt

**Mọi call ra dịch vụ ngoài đi qua `src/lib/`.** Component và route không bao giờ gọi thẳng
Supabase. Đổi hạ tầng về sau chỉ thay adapter, không viết lại tính năng.

| File | Trách nhiệm |
|---|---|
| `src/lib/supabase.ts` | Client server + `requireAdmin()`; `supabase-browser.ts` cho client |
| `src/lib/storage.ts` | Bọc Supabase Storage — upload, `getPublicUrl(path)` |
| `src/lib/wishlist.ts` | Danh sách yêu thích, phần THUẦN (test được). DB: `wishlist-remote.ts` |
| `src/lib/site-settings.ts` | Cấu hình shop; `content-blocks.ts` cho khối trang chủ |
| `src/lib/analytics.ts` | `logEvent()` — xem [§5](#5-event-logging) |

**Bẫy client/server.** File nào import `next/headers` (`supabase.ts`, `site-settings.ts`,
`content-blocks.ts`, `products.ts`) thì Client Component KHÔNG được import — gãy build, và
lỗi chỉ lộ lúc `npm run build`, `npm run dev` vẫn chạy bình thường. Vì thế phần thuần được
tách ra file `-shared` / `shop.ts` để cả hai phía dùng chung: `content-blocks-shared.ts`,
`content-schema.ts`, `content-icons.ts`, `wishlist.ts`.

DB chỉ lưu **path** ảnh (`kites/canh-coc-01.webp`), không lưu full URL — lưu full URL là
khóa chặt vào hạ tầng hiện tại.

---

## 3. Phân quyền

Hai lớp, không lớp nào thay được lớp kia:

1. **RLS trong Postgres** — lớp cuối, chặn cả khi code sai.
2. **Kiểm role ở API / Server Action** — vì RLS không cứu được khi code lỡ dùng
   service role key (key đó vượt RLS).

Role lưu ở `public.profiles.role` (`'user' | 'admin'`, default `'user'`), tạo tự động bằng
trigger khi có user mới. Frontend chỉ ẩn UI — ẩn UI không phải là phân quyền.

Chi tiết policy: skill `auth-rls`.

---

## 4. Đặt hàng — KHÔNG qua web

Quyết định 2026-07-26: bỏ hẳn thanh toán online. Web chỉ trưng bày; khách lưu mẫu ưng vào
**danh sách yêu thích** rồi tự nhắn Zalo / gọi cho shop. Đây là ràng buộc nghiệp vụ (chủ shop
phải trao đổi trực tiếp mới chốt được đơn, và để chặn đơn ảo), không phải việc còn dở.

Stripe, bảng `orders`/`order_items`, `/api/checkout`, `/thanh-toan` đã bị **gỡ hẳn**
ngày 2026-07-27 (migration `20260727100000_drop_orders.sql`). Đừng dựng lại.

Danh sách yêu thích lưu **hai nơi**:

```
khách vãng lai   → localStorage 'kite_wishlist_v1'   (wishlist.ts)
khách đăng nhập  → bảng public.wishlists             (wishlist-remote.ts)
đăng nhập        → merge hai bên (mergeWishlists), đẩy phần local thiếu lên DB
```

Merge phải **idempotent**: khoá chính kép `(user_id, product_id)` + `ignoreDuplicates`,
nên đăng nhập lại nhiều lần không nhân bản dòng. Trùng thì giữ `addedAt` sớm hơn.

Nút chốt đơn (`ContactCta`) bắn `contact_click` kèm `{ channel, source }` — đây là "chuyển
đổi" của web này, thay chỗ `order_paid` ngày trước.

---

## 4b. Nội dung do admin sửa

Yêu cầu 2026-07-26: cái gì hiện trên web thì admin phải sửa được, không chỉ sản phẩm.

| Bảng | Chứa gì | Admin sửa ở |
|---|---|---|
| `site_settings` | Tên shop, hotline, Zalo, email, địa chỉ, đoạn hero/giới thiệu/footer, **tiêu đề các khối**. Đúng 1 dòng. | `/admin/cai-dat` |
| `content_blocks` | Khối lặp trên trang chủ: khuyến mãi, kinh nghiệm, cam kết | `/admin/noi-dung` |
| `categories` | Danh mục diều — vừa là ô trên trang chủ, vừa là phân loại thật của sản phẩm | `/admin/danh-muc` |

Từng có bảng `guide_videos` + trang `/huong-dan` (bài hướng dẫn kèm link YouTube), dựng và gỡ
cùng ngày 2026-07-27 theo yêu cầu user. Khối "Kinh nghiệm chơi diều" trên trang chủ là thứ
KHÁC — nó là `content_blocks` section `'guide'` và vẫn còn.

Ba loại khối trong `content_blocks` có cùng hình dạng (tiêu đề + mô tả + link + icon + ảnh +
thứ tự) nên gộp một bảng, phân biệt bằng cột `section` — admin chỉ cần một màn quản lý thay vì
ba màn na ná nhau. `icon` lưu **tên** Phosphor (whitelist ở `content-icons.ts`), tên lạ rơi về
icon mặc định chứ không vỡ trang.

`section` từng có giá trị `'category'`; đã bỏ 2026-07-27 khi danh mục thành bảng thật.

**Upload ảnh** (`ImageUploader`): trình duyệt đẩy file THẲNG lên Storage bucket `products`,
không qua API route. Quyền do RLS của `storage.objects` lo (chỉ `is_admin()` được insert).
Gỡ ảnh khỏi form CỐ Ý không xoá file trong bucket — sản phẩm khác có thể dùng lại đúng path đó.

---

## 4c. Giá và kích thước — CHỮ TỰ DO

```
products.price_text   "3 triệu – 5 triệu", "350.000 ₫", "Liên hệ"…
products.show_price   admin tạm ẩn giá mà vẫn GIỮ chữ đã ghi
products.size_note    "Nhận làm từ 3m đến 5m, cỡ lớn hơn liên hệ shop"
```

Sáng 2026-07-27 từng dựng bảng `product_sizes` (mỗi cỡ một giá, khách chọn cỡ) rồi **gỡ ngay
chiều cùng ngày**. Lý do: diều làm thủ công theo yêu cầu, shop không có bảng giá cố định theo
cỡ — ép vào bảng cỡ×giá là bắt admin bịa ra những con số shop không có, và cho khách "chọn cỡ"
là hứa những thứ chưa chắc làm được. Kích thước giờ là **mô tả**, không phải danh sách chọn.

Đọc giá qua `visiblePrice()` trong `product-shared.ts`, đừng đọc thẳng `priceText` — hàm đó lo
luôn hai đường ẩn giá (`show_price = false` và chuỗi rỗng), rải tay ra là chỗ hiện chỗ không.

**KHÔNG có tồn kho** (bỏ 2026-07-27): diều làm thủ công theo đơn, "còn 5 chiếc" là thông tin
sai và làm khách ngại hỏi.

### Bẫy lọc theo danh mục

`getProducts({ categorySlug })` tra slug ra id rồi lọc `.eq('category_id', id)`.
**KHÔNG** viết `.eq('categories.slug', …)`: trong PostgREST, filter trên bảng nhúng chỉ lọc
phần nhúng, dòng cha vẫn trả về đủ (kèm `categories = null`). Trông đúng nhưng lọc không ăn gì
cả — đã dính đúng lỗi này một lần, lọc "Vải" ra đủ 5 sản phẩm.

---

## 5. Event logging

**Phần duy nhất không hoãn được sang giai đoạn sau.** RAG, semantic search, gợi ý, ELT →
warehouse → dbt đều chỉ đọc dữ liệu đã có nên áp vào lúc nào cũng được. Clickstream thì không:
hành vi khách không ghi hôm nay là mất vĩnh viễn, không backfill được.

Nhẹ thôi — một bảng `events` + một hàm `logEvent()` gọi ở ~6 chỗ. Không cần pipeline,
không cần warehouse lúc này. Cứ để nó âm thầm tích dữ liệu trong lúc làm phần khác;
tới lúc làm DE đã có sẵn dữ liệu thật để dựng dashboard.

Schema, taxonomy `event_type`, RLS, ràng buộc "không bao giờ throw": xem skill `event-logging`.
Đó là nguồn duy nhất, đừng chép lại ở đây kẻo lệch nhau.

---

## 6. Dựng dự án từ đầu — ĐÃ XONG, giữ lại làm sử liệu

> Mục này viết ngày đầu, khi repo mới chỉ có file governance. Toàn bộ đã làm xong;
> đọc để hiểu vì sao cấu trúc ra như hiện tại, đừng chạy lại các lệnh bên dưới.

1. **Cài CLI còn thiếu** (đã kiểm: chưa có cái nào):
   ```
   npm i -g supabase
   ```
   Stripe CLI: tải từ https://github.com/stripe/stripe-cli/releases hoặc `scoop install stripe`.
   Đã có sẵn: Node v22.15.0, npm 11.16.0, git 2.43.0, Docker.

2. **Scaffold Next.js mà KHÔNG đè lên file governance.**
   Chạy thẳng `npx create-next-app .` tại root sẽ **bị từ chối** — nó chỉ chấp nhận thư mục
   trống hoặc chứa vài file trong allowlist (`.git`, `.gitignore`, `LICENSE`, `docs`, …),
   mà root đang có `CLAUDE.md`, `.claude/`, `.env.example`, `.claudeignore`.
   Cách làm:
   ```
   npx create-next-app@latest kite-tmp --ts --tailwind --app --src-dir --eslint --import-alias "@/*"
   ```
   rồi move nội dung `kite-tmp/` vào root (giữ `.gitignore` hiện có, merge nếu cần), xóa `kite-tmp/`.

3. **Supabase local:**
   ```
   supabase init
   supabase start          # cần Docker Desktop đang chạy
   ```
   Copy URL + anon key + service role key từ output vào `.env.local` (mẫu ở `.env.example`).

4. **Dựng `src/lib/`:** `supabase.ts`, `storage.ts`, `analytics.ts` theo §2.
   (`payment.ts` từng có ở đây, đã gỡ ngày 2026-07-27 — xem §4.)

5. **Migration `events` TRƯỚC khi code tính năng:**
   ```
   supabase migration new events
   ```
   Có bảng sẵn thì mỗi tính năng gắn `logEvent` ngay lúc viết, không phải quay lại vá.

6. **Thêm script vào `package.json`** cho khớp Key Commands trong `CLAUDE.md`:
   `typecheck` (`tsc --noEmit`) và `test` (Vitest). Thiếu là hook lint + lệnh trong CLAUDE.md
   nói dối.

---

## 7. Giai đoạn sau (chưa làm)

- **AI:** RAG chatbot + semantic search bằng pgvector ngay trong Supabase Postgres;
  gợi ý sản phẩm. Input cho semantic search lấy từ event `search` đã log từ GĐ1.
- **DE:** clickstream (bảng `events`) → ELT sang warehouse → dbt → dashboard.
  Đây là chỗ AWS lên tiếng.
- Skill sẽ thêm: `rag-pgvector/`, `recommendation/`, `dbt-model/`.
