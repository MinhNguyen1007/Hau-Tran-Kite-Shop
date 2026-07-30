# Kite Shop — Diều Cánh Cốc E-commerce

## Project Overview
Web **TRƯNG BÀY** diều cánh cốc — KHÔNG phải web bán hàng có thanh toán.
Đang ở GIAI ĐOẠN 1: build + test LOCAL (Supabase local), chưa deploy.

Luồng của khách: xem mẫu diều → bấm tim lưu vào **danh sách yêu thích** → **tự nhắn Zalo /
gọi điện** cho shop để chốt đơn. Web không nhận đơn, không nhận tiền.
Lý do (nghiệp vụ thật, không phải giới hạn kỹ thuật): chủ shop còn nhận nhiều đơn khác nên
phải trao đổi trực tiếp mới chốt được, và để chặn đơn ảo.

MVP: auth (admin/user + Google), sản phẩm, danh sách yêu thích, trang cá nhân khách,
**event logging**, **admin quản lý được mọi thứ hiện trên web** (sản phẩm, danh mục, nội dung
trang chủ, thông tin shop).

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind
- Supabase: Auth (Google), Postgres, Storage — chạy local qua Supabase CLI (Docker)
- Phân quyền: Postgres RLS (Row Level Security) + field role. pgvector để dành cho AI sau.
- KHÔNG có cổng thanh toán. Stripe đã bị gỡ hẳn ngày 2026-07-27, đừng thêm lại.

## Architecture Decisions
- LOCAL-FIRST bằng `supabase start`. Chi tiết: docs/architecture.md
- Mọi call ra ngoài (db/auth/storage/analytics) gói trong src/lib/ để đổi hạ tầng
  chỉ thay adapter, không sửa tính năng.
- Phân quyền CHECK Ở BACKEND (RLS + kiểm ở API/Server Action); frontend chỉ ẩn UI.
- BA BẬC quyền: `owner` (chủ shop, DUY NHẤT một tài khoản) > `admin` (admin phụ do owner
  nâng lên) > `user`. Admin phụ toàn quyền nội dung nhưng KHÔNG quản lý tài khoản. Chủ shop
  đăng nhập bằng tên tài khoản + mật khẩu (`npm run tao-chu-shop -- <tên> <mật khẩu>`);
  tên tài khoản ghép thành email nội bộ trong `src/lib/login-identifier.ts`.
- Danh sách yêu thích lưu HAI NƠI: localStorage cho khách vãng lai, bảng `wishlists` cho
  khách đã đăng nhập; merge lúc đăng nhập. Thao tác thêm phải idempotent.
- Nội dung trang nằm trong DB, KHÔNG hard-code trong component. Admin sửa ở /admin:
  `site_settings` + `nav_items` (menu chính) gộp chung trong **/admin/cai-dat**,
  `categories` ở /admin/danh-muc. Màn "Nội dung trang chủ" riêng đã bỏ 2026-07-28,
  bảng `content_blocks` xoá hẳn 2026-07-28. Đường dẫn menu kiểm qua
  `checkNavHref()` trong `src/lib/nav-destinations.ts` — chặn link ngoài và neo không tồn tại.
- Hai route group: `src/app/(shop)` (có SiteHeader/SiteFooter) và `src/app/(admin)` (vỏ riêng:
  sidebar tối + topbar). Route group KHÔNG đổi URL. **Trang khách mới phải đặt trong `(shop)/`**,
  không thì mất header.
- Trang cá nhân khách `/tai-khoan`: họ tên, số điện thoại, địa chỉ, ảnh đại diện (bucket
  `avatars`, mỗi khách ghi vào đúng thư mục `<uid>/`). Mấy trường này để chủ shop có sẵn thông
  tin lúc khách nhắn Zalo, KHÔNG phải để giao hàng tự động.
- KHÔNG có tồn kho. Diều làm thủ công theo đơn, mẫu nào cũng đặt được.
- Giá và kích thước là CHỮ TỰ DO (`price_text`, `size_note`), không phải số, không phải
  danh sách chọn. Shop báo khoảng ("3 triệu – 5 triệu", "làm từ 3m đến 5m") chứ không có
  bảng giá cố định. `show_price` cho admin tạm ẩn giá mà vẫn giữ chữ đã ghi.
- Ảnh: admin upload thẳng từ trình duyệt lên Storage (`ImageUploader`), RLS lo quyền.
  `products.image_path` là ảnh bìa, `product_images` là bộ ảnh trang chi tiết.
- Event logging nằm trong GIAI ĐOẠN 1, không hoãn sang giai đoạn DE — hành vi khách
  không ghi hôm nay là mất vĩnh viễn, không backfill được. Xem skill `event-logging`.

## Coding Standards
- TypeScript strict. Component: PascalCase (.tsx). Util: kebab-case (.ts).
- Không any trừ khi có // TODO giải thích.
- Mọi truy cập DB qua client trong src/lib/supabase.ts, không rải rác trong component.

## Key Commands
- Supabase local:  supabase start   (dừng: supabase stop)
- Migration mới:   supabase migration new <ten>
- Áp migration:    supabase migration up --local
- Dev:             npm run dev
- Lint:            npm run lint
- Typecheck:       npm run typecheck
- Test:            npm run test

> `supabase db reset` bị CHẶN CÓ CHỦ Ý trong .claude/settings.json (nó xóa sạch DB local).
> Claude không được chạy lệnh này — user tự chạy tay khi thực sự muốn reset.

## How To Test
- Unit: Vitest — npm run test
- Trước khi commit: npm run lint && npm run typecheck && npm run test
- Smoke test tay: đăng nhập (tài khoản + mật khẩu) → bấm tim một mẫu diều → mở /yeu-thich thấy nó →
  đăng nhập ở tab ẩn danh và kiểm danh sách local được merge lên DB.

## NEVER DO (bất biến)
- KHÔNG thêm lại cổng thanh toán / giỏ hàng / bảng orders. Shop chốt đơn qua Zalo, đó là
  quyết định nghiệp vụ (2026-07-26), không phải việc còn dở.
- KHÔNG tự nhận/lưu số thẻ, CVV trong bất kỳ hoàn cảnh nào.
- KHÔNG commit secret (.env, Google/Supabase keys). Dùng .env + .gitignore.
- KHÔNG dựa RLS rồi bỏ kiểm quyền ở API — kiểm CẢ HAI cho route admin.
- KHÔNG viết `role === 'admin'` trong component hay route. Dùng `hasAdminAccess()` /
  `hasOwnerAccess()` trong `src/lib/roles.ts` — so sánh thẳng là sót `owner` ở đâu đó rồi
  khoá chính chủ shop ra khỏi khu quản trị.
- KHÔNG hard-delete dữ liệu thật trong lúc dev.
- KHÔNG code tính năng mới (trang, nút, form) mà quên gắn logEvent — xem `event-logging`.
- KHÔNG để logEvent throw hoặc block UI. Analytics hỏng thì im lặng, không làm sập trang.
- KHÔNG đổi tên event_type đã dùng — dữ liệu lịch sử sẽ lệch không sửa được. Cần loại mới
  thì THÊM, để loại cũ chết tự nhiên.
- KHÔNG hard-code nội dung hiện trên trang hay số điện thoại vào component — nó thuộc
  `site_settings` / `nav_items` / `categories` để admin sửa được. `FALLBACK_NAV_ITEMS` trong
  `shop.ts` chỉ là lưới an toàn khi DB hỏng, KHÔNG phải nguồn sự thật của menu.
- KHÔNG thêm lại tồn kho, nút "Hết hàng", hay trạng thái còn/hết. Đã bỏ có chủ ý.
- KHÔNG dựng lại form liên hệ / bảng `contact_messages` / màn đọc tin nhắn. Bỏ hẳn
  2026-07-28: mọi liên hệ đi qua Zalo và gọi điện, ô nhập chỉ là chỗ khách gõ rồi chờ hồi
  âm không tới. Loại event `contact_submitted` vẫn giữ trong taxonomy cho dữ liệu cũ.
- KHÔNG dùng cam `brand-*` trong khu /admin. Từ 2026-07-28 admin đi CÙNG TONE storefront
  (trắng - xám - đen, nút `ink-950`); thang brand chỉ còn cho nút tim và badge yêu thích.
- KHÔNG import src/lib/site-settings.ts (hay file nào chạm next/headers) vào Client
  Component — gãy build, và lỗi CHỈ lộ ra lúc `npm run build`, dev server vẫn chạy.

## Commit Conventions
- Conventional Commits: feat:, fix:, chore:, docs:, refactor:
- Commit nhỏ, một mục đích mỗi commit.
