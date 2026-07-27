-- Xoá sản phẩm = LƯU TRỮ (archived_at), không xoá cứng.
--
-- Lý do không dùng `delete`: products được order_items và events.product_id tham chiếu.
-- Xoá cứng một mẫu diều đã bán là làm hỏng lịch sử đơn hàng và lệch số liệu clickstream —
-- hai thứ không dựng lại được. Trùng luôn với luật "KHÔNG hard-delete dữ liệu thật" trong CLAUDE.md.

alter table public.products add column archived_at timestamptz;

-- Khách chỉ thấy hàng chưa lưu trữ; admin thấy tất để còn khôi phục.
-- Lọc Ở TẦNG RLS chứ không phải ở câu query trong app: quên .is('archived_at', null) một chỗ
-- là lộ hàng đã gỡ, còn ở đây thì không có cửa nào lọt.
drop policy "products_select_public" on public.products;

create policy "products_select_public" on public.products
  for select using (archived_at is null or public.is_admin());

create index products_archived_at_idx on public.products (archived_at);
