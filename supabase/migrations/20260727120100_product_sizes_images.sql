-- Giá theo KÍCH THƯỚC + nhiều ảnh cho một sản phẩm + bỏ hẳn tồn kho.
-- Quyết định của user 2026-07-27.

-- ── Bảng giá theo cỡ ─────────────────────────────────────────────────────────────────────
-- Diều bán theo sải cánh (3m, 3.5m, 5m, 6m…), mỗi cỡ một giá. Khách chọn cỡ rồi nhắn Zalo.
-- Cỡ lớn hơn danh sách này thì liên hệ riêng — đó là chữ tĩnh trên trang, không cần cột.
--
-- Sản phẩm KHÔNG có cỡ nào (vải, dây, phụ kiện) thì rơi về products.price_vnd — vì thế
-- cột price_vnd vẫn giữ, nó là giá của mẫu bán một mức duy nhất.
create table public.product_sizes (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  -- Nhãn tự do thay vì số mét: shop còn bán thứ đo bằng đơn vị khác (cuộn dây, mét vải).
  label      text not null check (char_length(label) between 1 and 60),
  price_vnd  int  not null check (price_vnd >= 0),
  sort_order int  not null default 0,

  -- Một sản phẩm không được có hai dòng cùng nhãn — sửa giá phải sửa đúng một chỗ.
  unique (product_id, label)
);

alter table public.product_sizes enable row level security;

create policy "product_sizes_select_public" on public.product_sizes
  for select using (true);

create policy "product_sizes_write_admin" on public.product_sizes
  for all using (public.is_admin()) with check (public.is_admin());

create index product_sizes_product_id_idx on public.product_sizes (product_id, sort_order);

grant select on public.product_sizes to anon, authenticated;
grant insert, update, delete on public.product_sizes to authenticated;

-- ── Nhiều ảnh cho một sản phẩm ───────────────────────────────────────────────────────────
-- products.image_path VẪN GIỮ và vẫn là ẢNH ĐẠI DIỆN (hiện trên card trong lưới). Bảng này
-- là bộ ảnh phụ cho trang chi tiết. Cố ý không gộp làm một: card chỉ cần một ảnh, để nguyên
-- cột thì truy vấn lưới không phải join, và mọi chỗ đang dùng imagePath không phải viết lại.
create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  image_path text not null,
  -- Mô tả cho người dùng trình đọc màn hình. Trống thì UI lấy tên sản phẩm.
  alt        text not null default '',
  sort_order int  not null default 0
);

alter table public.product_images enable row level security;

create policy "product_images_select_public" on public.product_images
  for select using (true);

create policy "product_images_write_admin" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

create index product_images_product_id_idx on public.product_images (product_id, sort_order);

grant select on public.product_images to anon, authenticated;
grant insert, update, delete on public.product_images to authenticated;

-- ── Bỏ tồn kho ───────────────────────────────────────────────────────────────────────────
-- Diều làm thủ công theo đơn, không có kho. "Còn 5 chiếc" / "Hết hàng" là thông tin sai
-- và làm khách ngại hỏi. Bỏ cột luôn thay vì để đó không ai cập nhật.
alter table public.products drop column stock;
