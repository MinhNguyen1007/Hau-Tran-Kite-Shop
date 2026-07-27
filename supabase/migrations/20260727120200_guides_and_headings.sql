-- Trang hướng dẫn (link YouTube), ảnh cho khối nội dung, và các tiêu đề khối do admin sửa.

-- ── Bài hướng dẫn có link YouTube ────────────────────────────────────────────────────────
-- Khác với content_blocks section 'guide' (thẻ "Kinh nghiệm chơi diều" trên trang chủ, chỉ
-- có chữ). Bảng này là danh sách video ở trang /huong-dan, và cụm link cuối footer trỏ vào đó.
create table public.guide_videos (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  title       text not null check (char_length(title) between 1 and 200),
  description text not null default '',
  -- Để TRỐNG được: user sẽ đưa link sau. Mục chưa có link thì trang vẫn hiện tiêu đề +
  -- mô tả, chỉ không bấm được — thà vậy còn hơn link chết.
  youtube_url text not null default '',
  sort_order  int  not null default 0,
  active      boolean not null default true
);

alter table public.guide_videos enable row level security;

create policy "guide_videos_select" on public.guide_videos
  for select using (active or public.is_admin());

create policy "guide_videos_write_admin" on public.guide_videos
  for all using (public.is_admin()) with check (public.is_admin());

create index guide_videos_sort_idx on public.guide_videos (sort_order);

grant select on public.guide_videos to anon, authenticated;
grant insert, update, delete on public.guide_videos to authenticated;

-- Seed đúng 5 mục đang hard-code ở footer, link để trống chờ user đưa.
insert into public.guide_videos (title, sort_order) values
  ('Chọn diều theo sức gió nơi bạn ở',        10),
  ('Cách lắp khung và căng dây lần đầu',      20),
  ('Cân bộ sáo cho tiếng vang, tiếng trong',  30),
  ('Bảo quản diều qua mùa mưa',               40),
  ('Thả diều an toàn, tránh xa đường điện',   50);

-- ── Ảnh cho khối nội dung ────────────────────────────────────────────────────────────────
-- Khối khuyến mãi được đặt ảnh nền thật thay vì chỉ dải màu gradient.
alter table public.content_blocks add column image_path text;

-- ── Tiêu đề các khối + đoạn giới thiệu footer ────────────────────────────────────────────
-- Trước đây nằm cứng trong component nên admin không đụng được.
alter table public.site_settings
  add column products_title text not null default 'Các mẫu diều',
  add column promo_title    text not null default 'Đang khuyến mãi',
  add column category_title text not null default 'Danh mục diều',
  add column about_heading  text not null default 'Xưởng diều Hậu Trần',
  add column guide_title    text not null default 'Kinh nghiệm chơi diều',
  add column footer_about   text not null default '';

-- Đoạn giới thiệu ở footer: chép đúng chữ đang hard-code trong SiteFooter.tsx.
update public.site_settings set footer_about =
  E'Xưởng diều làm thủ công theo lối truyền thống: khung tre vót tay, phất giấy dó, cân sáo bằng tai. Mỗi chiếc diều đều được thử gió trước khi giao.\n\nNhận đặt diều theo kích cỡ và hoạ tiết riêng, làm trong 5 đến 10 ngày tuỳ mẫu.'
where id = 1;
