-- Bỏ khối "Kinh nghiệm chơi diều" khỏi trang chủ (yêu cầu user 2026-07-27).
--
-- Đây là content_blocks section 'guide' — KHÁC với bảng guide_videos đã gỡ trước đó
-- (trang /huong-dan). Giờ cả hai đều không còn, phần hướng dẫn biến mất khỏi web.

delete from public.content_blocks where section = 'guide';

alter table public.content_blocks drop constraint content_blocks_section_check;
alter table public.content_blocks
  add constraint content_blocks_section_check check (section in ('promo', 'trust'));

-- Tiêu đề của khối đó không còn chỗ hiển thị.
alter table public.site_settings drop column guide_title;
