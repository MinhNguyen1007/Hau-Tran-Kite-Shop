-- Bỏ đoạn giới thiệu ở footer (yêu cầu user 2026-07-28).
--
-- Gỡ CẢ cột lẫn ô nhập trong /admin/cai-dat, không gỡ nửa vời: để lại ô nhập cho một cột
-- không hiện ở đâu là bẫy cho chính chủ shop, gõ vào rồi đi tìm xem chữ hiện chỗ nào.
-- Footer còn cụm thông tin liên hệ, vốn là thứ khách cần ở đó.

alter table public.site_settings drop column footer_about;
