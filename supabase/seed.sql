-- Seed sản phẩm mẫu cho GĐ1 (local). Tự chạy khi `supabase db reset`.
-- Giá là integer đồng (price_vnd). image_path để null vì chưa upload ảnh thật lên bucket 'products'
-- (ProductCard hiển thị placeholder khi thiếu ảnh). Có 1 sản phẩm stock=0 để test trạng thái hết hàng.
insert into public.products (slug, name, description, price_vnd, image_path, stock) values
  ('dieu-canh-coc-truyen-thong', 'Diều cánh cốc truyền thống', 'Khung tre vót tay, phất giấy dó, sải cánh 1m2. Bay ổn định trong gió nhẹ.', 350000, null, 12),
  ('dieu-canh-coc-co-lon', 'Diều cánh cốc cỡ lớn', 'Sải cánh 2m, khung tre già hun khói, chịu được gió mạnh. Dành cho người chơi có kinh nghiệm.', 650000, null, 5),
  ('dieu-sao-canh-coc', 'Diều sáo cánh cốc', 'Gắn bộ sáo trúc ba ống, phát tiếng vi vu khi bay. Âm trong, vang xa.', 480000, null, 0),
  ('dieu-canh-coc-mini', 'Diều cánh cốc mini cho trẻ em', 'Bản nhỏ gọn, nhẹ, dễ điều khiển. Phù hợp trẻ 6 đến 12 tuổi tập chơi.', 180000, null, 30),
  ('dieu-canh-coc-ve-tay', 'Diều cánh cốc vẽ tay nghệ thuật', 'Mặt diều vẽ tay thủ công theo yêu cầu, mỗi chiếc một hoạ tiết riêng.', 890000, null, 3);
