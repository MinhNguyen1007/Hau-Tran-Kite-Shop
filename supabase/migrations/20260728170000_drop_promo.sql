-- Bỏ khối khuyến mãi khỏi trang chủ (yêu cầu user 2026-07-28).
--
-- Cùng cách đã làm với section 'category' (20260727120000) và 'guide' (20260727150100):
-- xoá dòng, rồi siết luôn check constraint để không ai chèn lại loại đã bỏ.
-- content_blocks giờ chỉ còn MỘT loại: 'trust' (dải cam kết trong hero).

delete from public.content_blocks where section = 'promo';

alter table public.content_blocks drop constraint content_blocks_section_check;
alter table public.content_blocks
  add constraint content_blocks_section_check check (section in ('trust'));

-- Tiêu đề của khối vừa bỏ, không còn chỗ nào hiện.
alter table public.site_settings drop column promo_title;
