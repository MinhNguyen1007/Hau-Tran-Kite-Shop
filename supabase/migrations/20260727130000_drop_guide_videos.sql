-- Bỏ trang hướng dẫn (quyết định user 2026-07-27, ngay sau khi dựng xong).
--
-- Lý do: user gỡ cụm link hướng dẫn khỏi footer, khiến /huong-dan không còn đường nào dẫn tới.
-- Thay vì gắn nó vào menu chính, user chọn bỏ hẳn.
--
-- Khối "Kinh nghiệm chơi diều" trên TRANG CHỦ vẫn còn — đó là content_blocks section 'guide',
-- một thứ khác, đừng nhầm rồi xoá theo.
drop table if exists public.guide_videos;
