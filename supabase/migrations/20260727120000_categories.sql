-- Danh mục diều THẬT, gắn vào từng sản phẩm.
--
-- Trước migration này "danh mục" chỉ là ô trang trí trên trang chủ (content_blocks section
-- 'category') dẫn sang /san-pham?q=<từ khoá>, và nhóm sản phẩm được ĐOÁN từ slug trong
-- src/lib/kite-categories.ts. Cả hai đều sai khi tên mẫu không chứa từ khoá.
-- Giờ mỗi sản phẩm thuộc đúng một danh mục, admin thêm/sửa/xoá danh mục được.

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  slug        text not null unique,
  name        text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  -- Path trong bucket 'products' (dùng chung bucket với ảnh sản phẩm, khỏi tạo bucket thứ hai).
  image_path  text,
  sort_order  int  not null default 0,
  -- Xoá MỀM như products: danh mục đã gỡ vẫn còn để sản phẩm cũ không mất tham chiếu.
  archived_at timestamptz
);

alter table public.categories enable row level security;

-- Khách chỉ thấy danh mục còn dùng; admin thấy cả danh mục đã gỡ để khôi phục được.
create policy "categories_select" on public.categories
  for select using (archived_at is null or public.is_admin());

create policy "categories_write_admin" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create index categories_sort_idx on public.categories (sort_order, name);

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;  -- RLS thu hẹp còn admin

insert into public.categories (slug, name, sort_order) values
  ('dieu-canh-coc', 'Diều cánh cốc',  10),
  ('dieu-duoi-ca',  'Diều đuôi cá',   20),
  ('vai',           'Vải',            30),
  ('day-tha-dieu',  'Dây thả diều',   40),
  ('phu-kien',      'Phụ kiện khác',  50);

-- on delete set null chứ không cascade: gỡ danh mục không được làm bốc hơi sản phẩm.
-- null = chưa xếp danh mục; sản phẩm vẫn hiện bình thường ở /san-pham.
alter table public.products
  add column category_id uuid references public.categories on delete set null;

create index products_category_id_idx on public.products (category_id);

-- Xếp 5 sản phẩm seed vào danh mục theo slug hiện có. Mẫu nào không khớp thì để null,
-- admin tự chọn lại trong trang quản trị.
update public.products p
set category_id = c.id
from public.categories c
where c.slug = case
  when p.slug like '%sao%'    then 'phu-kien'
  when p.slug like '%duoi%'   then 'dieu-duoi-ca'
  when p.slug like '%day%'    then 'day-tha-dieu'
  else 'dieu-canh-coc'
end;

-- Ô danh mục trên trang chủ giờ đọc từ bảng categories, không phải content_blocks nữa.
-- Xoá các khối cũ để admin không sửa nhầm chỗ rồi thắc mắc sao trang không đổi.
delete from public.content_blocks where section = 'category';

-- Bỏ 'category' khỏi ràng buộc: thêm khối loại này nữa là sai chỗ.
alter table public.content_blocks drop constraint content_blocks_section_check;
alter table public.content_blocks
  add constraint content_blocks_section_check check (section in ('promo', 'guide', 'trust'));
