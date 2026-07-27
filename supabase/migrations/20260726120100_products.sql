-- Sản phẩm. Giá lưu integer đồng (price_vnd), KHÔNG float, KHÔNG chuỗi. Xem skill product-card.
-- Ảnh chỉ lưu PATH trong Storage bucket 'products' (vd 'kites/canh-coc-01.webp'), không lưu full URL.

create table public.products (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  description text,
  price_vnd   int  not null check (price_vnd >= 0),
  image_path  text,
  stock       int  not null default 0 check (stock >= 0),
  created_at  timestamptz not null default now()
);

alter table public.products enable row level security;

-- Đọc công khai (khách vãng lai vẫn xem được hàng).
create policy "products_select_public" on public.products
  for select using (true);

-- Ghi chỉ dành cho admin. RLS là lớp cuối; route admin còn phải kiểm role ở API nữa.
create policy "products_insert_admin" on public.products
  for insert with check (public.is_admin());

create policy "products_update_admin" on public.products
  for update using (public.is_admin()) with check (public.is_admin());

create policy "products_delete_admin" on public.products
  for delete using (public.is_admin());
