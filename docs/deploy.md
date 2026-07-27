# Deploy — Giai đoạn 2

> **Chưa mở file này.** Đang ở Giai đoạn 1 (local). Chỉ bắt đầu deploy khi
> checklist dưới xanh hết.

---

## Điều kiện mở Giai đoạn 2

- [ ] Đăng nhập Google chạy (Supabase Auth), tạo được user với role mặc định `user`.
- [ ] Có admin, và RLS + API chặn user thường khỏi thao tác admin (test thật bằng 2 tài khoản).
- [ ] Xem danh sách sản phẩm + chi tiết (ảnh Supabase Storage / mô tả / giá) từ DB.
- [ ] Thêm / sửa / xóa sản phẩm ở trang admin.
- [ ] Danh sách yêu thích: thêm / bỏ đúng, giữ được sau khi tải lại trang.
- [ ] Đăng nhập xong danh sách lưu lúc chưa đăng nhập được merge lên bảng `wishlists`,
      và đăng nhập lần hai KHÔNG nhân đôi dòng.
- [ ] Nút Zalo / gọi mở đúng số lấy từ `site_settings`.
- [ ] Admin sửa thông tin shop + khối nội dung trang chủ, đổi xong trang khách thấy ngay.
- [ ] Admin thêm/sửa danh mục, xếp sản phẩm vào danh mục, lọc `/san-pham?danh-muc=` ra ĐÚNG
      số sản phẩm của danh mục đó (không phải toàn bộ hàng).
- [ ] Admin ghi giá dạng chữ và mô tả kích thước; tắt "Hiện giá" thì trang khách chuyển sang
      "Liên hệ để biết giá" ở cả card lẫn trang chi tiết.
- [ ] Admin upload ảnh từ máy cho sản phẩm / danh mục / khối khuyến mãi, ảnh lên đúng bucket.
- [ ] Trang liên hệ + thông tin shop.
- [ ] Bảng `events` + RLS chạy; `logEvent` gọi ở đủ các chỗ trong taxonomy
      (`page_view`, `product_view`, `add_to_wishlist`, `remove_from_wishlist`,
      `contact_click`, `search`, `contact_submitted`).
- [ ] Đi một vòng như khách thật rồi query `events`: thấy đúng chuỗi sự kiện,
      `session_id` xuyên suốt cả trước và sau khi đăng nhập.
- [ ] `npm run lint && npm run typecheck && npm run test` xanh hết.

---

## Việc sẽ viết khi tới lúc

Để trống có chủ ý — viết khi thực sự deploy, không đoán trước. Sườn dự kiến:

1. Tạo project Supabase cloud, `supabase link` + `supabase db push` đẩy migrations lên.
2. Cấu hình Google OAuth cho domain thật (redirect URL đổi).
3. Deploy Vercel, khai env vars (đối chiếu `.env.example`).
4. Kiểm lại RLS trên cloud — dữ liệu thật, sai là lộ thật.
5. Vào /admin/cai-dat đổi email + địa chỉ thật (seed đang để giá trị mẫu).
