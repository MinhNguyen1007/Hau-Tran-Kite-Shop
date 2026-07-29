-- Xoá hẳn bảng khối nội dung trang chủ (yêu cầu user 2026-07-28).
--
-- Vòng đời của nó: sinh ra với 4 loại khối (category / promo / guide / trust), rồi lần lượt bỏ
-- từng loại — 'category' thành bảng categories thật, 'guide' và 'promo' bị gỡ khỏi trang chủ.
-- Còn mỗi 'trust' (dải cam kết dưới banner) và bảng không còn dòng nào, nên màn quản trị của
-- nó rỗng: không sửa được gì vì chẳng có gì để sửa.
--
-- Chữ hiện trên trang chủ giờ nằm hết trong site_settings. ĐỪNG dựng lại bảng này.

drop table if exists public.content_blocks;
