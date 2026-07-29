-- Bỏ hẳn form liên hệ: mọi liên hệ đi qua Zalo / gọi điện (quyết định user 2026-07-28).
--
-- Trước đó khách gửi form ở /lien-he, tin rơi vào bảng này và admin đọc ở /admin/lien-he.
-- Cả hai màn hình đã gỡ, giữ lại bảng chỉ là chỗ chứa dữ liệu không ai đọc.
--
-- Loại event `contact_submitted` KHÔNG gỡ khỏi taxonomy: dữ liệu lịch sử trong bảng events
-- vẫn còn, đổi/xoá tên loại là làm lệch số cũ không sửa lại được (xem CLAUDE.md).

drop table if exists public.contact_messages;
