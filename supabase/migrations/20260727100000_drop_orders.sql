-- Gỡ thanh toán online (quyết định 2026-07-26).
--
-- Shop chốt đơn qua Zalo/điện thoại chứ không qua web, nên orders/order_items không còn
-- nguồn ghi nào: /api/checkout và webhook Stripe đã bị xoá cùng lượt này.
-- Bỏ hẳn thay vì để bảng rỗng — bảng không ai ghi mà vẫn còn policy là bẫy cho người đọc sau.
--
-- order_items xoá trước vì nó reference orders (cascade lo được, nhưng viết rõ thứ tự cho dễ đọc).
drop table if exists public.order_items;
drop table if exists public.orders;
