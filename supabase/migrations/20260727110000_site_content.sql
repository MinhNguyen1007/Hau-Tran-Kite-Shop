-- Nội dung trang do admin sửa được (yêu cầu 2026-07-26: "cái gì hiện trên web thì admin phải
-- thêm/sửa/xoá được hết", không chỉ sản phẩm).
--
-- HAI bảng chứ không phải bốn:
--   site_settings  — các giá trị ĐƠN LẺ (tên shop, hotline, đoạn giới thiệu). Đúng MỘT dòng.
--   content_blocks — các khối LẶP LẠI dạng thẻ (danh mục, khuyến mãi, kinh nghiệm, cam kết).
-- Bốn khối kia có cùng hình dạng (tiêu đề + mô tả + link + icon + thứ tự) nên gộp một bảng,
-- phân biệt bằng cột `section`. Đổi lại admin chỉ cần một màn quản lý thay vì bốn màn na ná nhau.

-- ── Cấu hình chung ───────────────────────────────────────────────────────────────────────
-- id cố định = 1: đây là bảng singleton. check ràng cứng để không ai lỡ insert dòng thứ hai
-- rồi cả trang đọc nhầm dòng.
create table public.site_settings (
  id          int primary key default 1 check (id = 1),
  updated_at  timestamptz not null default now(),

  shop_name   text not null,
  tagline     text not null,
  hotline     text not null,
  -- Số Zalo tách riêng khỏi hotline: nhiều shop dùng hai số khác nhau.
  zalo_phone  text not null,
  email       text not null,
  area        text not null,
  address     text not null default '',
  open_hours  text not null default '',

  -- Đoạn chữ dưới banner đầu trang.
  hero_note   text not null default '',
  about_title text not null default '',
  -- Nhiều đoạn văn ngăn nhau bằng DÒNG TRỐNG. Tách lúc render, không cần cột riêng cho từng đoạn.
  about_body  text not null default ''
);

alter table public.site_settings enable row level security;

-- Ai cũng đọc được: đây là thông tin hiện công khai trên mọi trang.
create policy "site_settings_select" on public.site_settings
  for select using (true);

-- Chỉ admin sửa. Không có policy insert/delete: dòng duy nhất đã seed sẵn ngay dưới,
-- vòng đời của nó chỉ có update.
create policy "site_settings_update_admin" on public.site_settings
  for update using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (
  id, shop_name, tagline, hotline, zalo_phone, email, area, hero_note, about_title, about_body
) values (
  1,
  'Diều Cánh Cốc Hậu Trần',
  'Diều cánh cốc thủ công, khung tre vót tay',
  '0387315341',
  '0387315341',
  'lienhe@dieucanhcochautran.vn',
  'Nhận đặt và giao diều toàn quốc',
  'Diều khung tre vót tay, cánh căng gió, sáo trúc cân bằng tai. Đặt riêng kích cỡ và hoạ tiết, giao toàn quốc.',
  'Diều làm hoàn toàn bằng tay, từ cây tre tới tiếng sáo.',
  E'Chẻ tre, vót nan, hơ lửa uốn khung, phất mặt diều rồi căng dây thử gió. Mỗi chiếc đều được thả thử trước khi đóng thùng gửi đi, để khách nhận về là bay được ngay.\n\nNhận đặt riêng kích cỡ, màu và hoạ tiết. Cần tư vấn chọn mẫu hợp với vùng gió nơi bạn ở thì gọi trực tiếp cho xưởng.'
);

-- ── Khối nội dung lặp lại ────────────────────────────────────────────────────────────────
create table public.content_blocks (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Khối nào trên trang chủ. Thêm loại mới thì sửa check này BẰNG MIGRATION MỚI.
  section    text not null check (section in ('category', 'promo', 'guide', 'trust')),
  -- Nhỏ hiện trước. Riêng 'promo': ô sort_order nhỏ nhất được render to gấp đôi (bố cục
  -- 1 ô lớn + 2 ô nhỏ), nên thứ tự ở đây quyết định cả kích thước — xem PromoBanners.tsx.
  sort_order int  not null default 0,

  title      text not null check (char_length(title) between 1 and 120),
  -- Dòng chữ to phía trên tiêu đề của khối khuyến mãi ("Giảm 20%", "Combo"). Khối khác bỏ trống.
  subtitle   text not null default '',
  body       text not null default '',
  -- Link khi bấm vào thẻ. Rỗng = thẻ không bấm được (khối 'guide' và 'trust' dùng kiểu này).
  href       text not null default '',
  -- TÊN icon Phosphor, không phải component. Danh sách hợp lệ nằm ở src/lib/content-icons.ts;
  -- tên lạ thì UI rơi về icon mặc định chứ không vỡ trang.
  icon       text not null default '',

  -- Ẩn tạm mà không mất nội dung. Cùng tinh thần xoá mềm của products.archived_at.
  active     boolean not null default true
);

alter table public.content_blocks enable row level security;

-- Khách chỉ thấy khối đang bật; admin thấy cả khối đã ẩn để bật lại được.
create policy "content_blocks_select" on public.content_blocks
  for select using (active or public.is_admin());

create policy "content_blocks_write_admin" on public.content_blocks
  for all using (public.is_admin()) with check (public.is_admin());

create index content_blocks_section_idx on public.content_blocks (section, sort_order);

-- GRANT bắt buộc cho bảng public mới, RLS đúng vẫn 42501 nếu thiếu (xem docs/architecture.md).
grant select on public.site_settings, public.content_blocks to anon, authenticated;
grant update on public.site_settings to authenticated;                    -- RLS thu hẹp còn admin
grant insert, update, delete on public.content_blocks to authenticated;   -- RLS thu hẹp còn admin

-- ── Seed: đúng nội dung đang hard-code trong src/components/home ─────────────────────────
insert into public.content_blocks (section, sort_order, title, subtitle, body, href, icon) values
  ('category', 10, 'Diều cánh cốc',   '', '', '/san-pham?q=c%C3%A1nh%20c%E1%BB%91c', 'Wind'),
  ('category', 20, 'Diều sáo',        '', '', '/san-pham?q=s%C3%A1o',                'MusicNotes'),
  ('category', 30, 'Diều cỡ lớn',     '', '', '/san-pham?q=l%E1%BB%9Bn',             'Ruler'),
  ('category', 40, 'Diều trẻ em',     '', '', '/san-pham?q=mini',                    'Baby'),
  ('category', 50, 'Diều vẽ tay',     '', '', '/san-pham?q=v%E1%BA%BD%20tay',        'PaintBrushBroad'),
  ('category', 60, 'Dây và lô cuốn',  '', '', '/san-pham?q=d%C3%A2y',                'Spiral'),
  ('category', 70, 'Đuôi diều',       '', '', '/san-pham?q=%C4%91u%C3%B4i',          'Feather'),
  ('category', 80, 'Phụ kiện',        '', '', '/san-pham?q=ph%E1%BB%A5%20ki%E1%BB%87n', 'Package'),

  ('promo', 10, 'Diều sáo trúc ba ống', 'Giảm 20%',      'Áp dụng cho mẫu sáo cân sẵn, hết tháng này.', '/san-pham?q=s%C3%A1o', ''),
  ('promo', 20, 'Diều + dây + lô cuốn', 'Combo',         'Bộ đủ đồ cho người mới, tiết kiệm hơn mua lẻ.', '/san-pham', ''),
  ('promo', 30, 'Đơn từ 800.000 ₫',     'Miễn phí ship', 'Áp dụng toàn quốc, đóng thùng cứng.',          '/san-pham', ''),

  ('guide', 10, 'Chọn diều theo sức gió', '', 'Gió nhẹ hợp diều sải 1m2 giấy dó. Gió mạnh ven biển thì chọn khung tre già, sải 2m trở lên.', '', 'CloudSun'),
  ('guide', 20, 'Thả diều lần đầu',       '', 'Đứng quay lưng vào gió, thả dây từng đoạn ngắn. Đừng chạy, để gió tự nâng cánh lên.',        '', 'Wind'),
  ('guide', 30, 'Cân bộ sáo cho tiếng vang', '', 'Sáo lệch thì tiếng rè. Nới dây buộc từng ống, nghe thử trên gió rồi mới siết chặt.',      '', 'MusicNoteSimple'),
  ('guide', 40, 'Thả diều an toàn',       '', 'Tránh xa đường dây điện và cột cao. Chọn bãi trống, không thả khi trời chuyển giông.',       '', 'Lightning'),

  ('trust', 10, 'Giao toàn quốc',     '', 'Đóng thùng cứng, giữ nguyên khung', '', 'Truck'),
  ('trust', 20, 'Tre tuyển, phất tay', '', 'Thử gió trước khi giao',           '', 'SealCheck'),
  ('trust', 30, 'Đổi trong 7 ngày',   '', 'Diều lỗi khung đổi chiếc mới',      '', 'HandHeart'),
  -- body để trống: TrustStrip tự ghép "Gọi <hotline>" từ site_settings, khỏi sửa hai nơi khi đổi số.
  ('trust', 40, 'Tư vấn chọn diều',   '', '',                                  '', 'Phone');
