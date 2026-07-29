-- Cho phép Realtime đẩy thông báo khi có event mới, để trang tổng quan /admin tự cập nhật
-- mà không phải bấm F5.
--
-- Chỉ THÊM bảng vào publication, không đụng RLS: policy events_select_admin vẫn là thứ quyết
-- định ai nhận được gì. Supabase lọc bản tin Postgres Changes theo đúng RLS của người đang
-- nghe, nên khách thường không nhận được dòng nào.
--
-- Bọc trong DO: chạy lại migration hoặc bảng đã nằm sẵn trong publication thì bỏ qua, không
-- làm gãy cả lượt migrate.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'events'
    ) then
      alter publication supabase_realtime add table public.events;
    end if;
  end if;
end
$$;

-- Realtime cần đủ dữ liệu cũ trong bản tin để lọc theo RLS. Mặc định Postgres chỉ gửi khoá
-- chính; events là bảng chỉ-ghi-thêm nên bật full không tốn gì đáng kể.
alter table public.events replica identity full;
