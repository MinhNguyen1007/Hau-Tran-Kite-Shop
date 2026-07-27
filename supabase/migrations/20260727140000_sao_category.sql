-- Thêm danh mục "Sáo" và đổi tiêu đề khối sản phẩm trên trang chủ (yêu cầu user 2026-07-27).
--
-- Khối này giờ có cả phụ kiện không phải diều (vải, dây, sáo) nên "Các mẫu diều" là tên hẹp.

-- sort_order 25: chen giữa "Diều đuôi cá" (20) và "Vải" (30) — sáo đi với diều hơn là với
-- vật tư. Khoảng cách 10 giữa các mốc chính là để chen được thế này mà không đánh số lại.
insert into public.categories (slug, name, sort_order) values ('sao', 'Sáo', 25)
on conflict (slug) do nothing;

update public.site_settings set products_title = 'Các mẫu sản phẩm' where id = 1;

-- Đổi cả DEFAULT của cột: dựng lại DB từ đầu phải ra đúng tên này, không quay về tên cũ.
alter table public.site_settings alter column products_title set default 'Các mẫu sản phẩm';
