-- Dữ liệu mẫu cho LOCAL. Chạy sau toàn bộ migration, lúc `supabase db reset` hoặc lần
-- `supabase start` đầu tiên trên DB trắng. KHÔNG chạy trên cloud (`db push` chỉ mang schema) —
-- ngoài đó nhập hàng thật ở /admin/san-pham.
--
-- Giá và kích thước là CHỮ TỰ DO (`price_text`, `size_note`), không phải số: shop báo khoảng
-- chứ không có bảng giá cố định. Không có cột `stock` — diều làm thủ công theo đơn, mẫu nào
-- cũng đặt được. Xem CLAUDE.md trước khi thêm cột vào đây.
--
-- `image_path` để null: ảnh phải upload thật lên bucket 'products', ProductCard tự hiện ảnh
-- thay thế khi thiếu. Trỏ vào path không tồn tại thì trang khách hiện ô ảnh vỡ.

insert into public.products
  (slug, name, description, price_text, size_note, image_path, category_id)
select
  m.slug, m.name, m.description, m.price_text, m.size_note, null, c.id
from (values
  ('dieu-canh-coc-truyen-thong',
   'Diều cánh cốc truyền thống',
   'Khung tre vót tay, phất giấy dó, sải cánh 1m2. Bay ổn định trong gió nhẹ.',
   '350.000 ₫', 'Sải cánh 1m2', 'dieu-canh-coc'),
  ('dieu-canh-coc-co-lon',
   'Diều cánh cốc cỡ lớn',
   'Sải cánh 2m, khung tre già hun khói, chịu được gió mạnh. Dành cho người chơi có kinh nghiệm.',
   '650.000 ₫', 'Sải cánh 2m', 'dieu-canh-coc'),
  ('dieu-sao-canh-coc',
   'Diều sáo cánh cốc',
   'Gắn bộ sáo trúc ba ống, phát tiếng vi vu khi bay. Âm trong, vang xa.',
   '480.000 ₫', 'Bộ sáo trúc ba ống', 'sao'),
  ('dieu-canh-coc-mini',
   'Diều cánh cốc mini cho trẻ em',
   'Bản nhỏ gọn, nhẹ, dễ điều khiển. Phù hợp trẻ 6 đến 12 tuổi tập chơi.',
   '180.000 ₫', 'Bản nhỏ, nhẹ cho trẻ tập chơi', 'dieu-canh-coc'),
  ('dieu-canh-coc-ve-tay',
   'Diều cánh cốc vẽ tay nghệ thuật',
   'Mặt diều vẽ tay thủ công theo yêu cầu, mỗi chiếc một hoạ tiết riêng.',
   '890.000 ₫', 'Làm theo cỡ khách yêu cầu', 'dieu-canh-coc')
) as m (slug, name, description, price_text, size_note, category_slug)
left join public.categories c on c.slug = m.category_slug
-- Chạy lại nhiều lần không nhân đôi, và không ghi đè chữ admin đã sửa tay ở /admin.
on conflict (slug) do nothing;
