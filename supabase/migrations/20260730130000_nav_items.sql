-- Menu chính trên header vào DB.
--
-- Trước migration này 5 mục menu là mảng hằng NAV_ITEMS trong src/lib/shop.ts, tức là đổi tên
-- một mục cũng phải sửa code — trái luật dự án "cái gì hiện trên web thì admin sửa được".
-- Đây là chỗ hard-code cuối cùng còn sót trong phần nội dung hiển thị.
--
-- Mảng trong shop.ts KHÔNG xoá, nó thành FALLBACK_NAV_ITEMS: mất DB thì header vẫn có menu
-- thay vì trống hoác. Cùng lối với hằng SHOP.

create table public.nav_items (
  id         uuid primary key default gen_random_uuid(),
  label      text not null check (btrim(label) <> ''),
  -- Chỉ nhận đường dẫn nội bộ. Chặn ở DB chứ không chỉ ở zod: link ngoài trong menu chính là
  -- đường đưa khách rời web, và nếu ai đó ghi thẳng vào bảng thì zod không cứu được.
  href       text not null check (href like '/%'),
  sort_order integer not null default 0,
  -- Tắt tạm một mục mà không mất chữ đã ghi. Cùng ý với show_price của products.
  active     boolean not null default true,
  created_at timestamptz not null default now()
);

-- Thứ tự hiển thị phải xác định. Thiếu index này thì hai mục cùng sort_order xếp theo thứ tự
-- Postgres trả về, tức là menu tự đổi chỗ giữa hai lần tải mà không ai hiểu vì sao.
create index nav_items_order_idx on public.nav_items (sort_order, created_at);

alter table public.nav_items enable row level security;

-- Menu hiện trên mọi trang cho mọi người, kể cả khách chưa đăng nhập.
create policy "nav_items_select" on public.nav_items
  for select using (true);

create policy "nav_items_insert_admin" on public.nav_items
  for insert with check (public.is_admin());

create policy "nav_items_update_admin" on public.nav_items
  for update using (public.is_admin()) with check (public.is_admin());

create policy "nav_items_delete_admin" on public.nav_items
  for delete using (public.is_admin());

grant select on public.nav_items to anon, authenticated;
grant insert, update, delete on public.nav_items to authenticated;  -- RLS thu hẹp còn admin
grant all on public.nav_items to service_role;

-- Seed đúng 5 mục đang chạy, cách nhau 10 để chèn thêm không phải đánh số lại cả bảng.
-- 'Kinh nghiệm' và 'Khuyến mãi' đã gỡ 2026-07-28 cùng lúc với khối của chúng trên trang chủ,
-- nên không seed lại: mục nav trỏ vào khối không tồn tại thì bấm vào nhảy hụt.
insert into public.nav_items (label, href, sort_order) values
  ('Trang chủ',  '/',             10),
  ('Sản phẩm',   '/san-pham',     20),
  ('Danh mục',   '/#danh-muc',    30),
  ('Giới thiệu', '/#gioi-thieu',  40),
  ('Liên hệ',    '/lien-he',      50);
