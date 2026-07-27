-- Giá và kích thước thành CHỮ TỰ DO (yêu cầu user 2026-07-27, đổi so với bảng cỡ dựng sáng nay).
--
-- Vì sao đổi: diều làm thủ công theo yêu cầu, không có bảng giá cố định theo cỡ. Thực tế shop
-- nói "con này làm từ 3m đến 5m, khoảng 3–5 triệu tuỳ hoạ tiết" — ép vào bảng cỡ×giá là bắt
-- admin bịa ra những con số chính xác mà shop không có.
--
-- show_price tách riêng khỏi price_text: admin muốn GIỮ giá đã ghi nhưng tạm ẩn đi (mùa cao
-- điểm, giá đang thay đổi) mà không phải xoá rồi gõ lại.

alter table public.products
  add column price_text text    not null default '',
  add column size_note  text    not null default '',
  add column show_price boolean not null default true;

-- Giữ lại giá đang có dưới dạng chữ, đừng để trống rồi mất thông tin.
-- to_char với 'FM999,999,999' rồi đổi , thành . cho đúng lối viết số Việt Nam.
update public.products
set price_text = replace(to_char(price_vnd, 'FM999,999,999'), ',', '.') || ' ₫'
where price_vnd > 0;

-- Bảng cỡ và cột giá số không còn nguồn ghi nào. Bỏ hẳn thay vì để đó không ai cập nhật.
drop table if exists public.product_sizes;
alter table public.products drop column price_vnd;
