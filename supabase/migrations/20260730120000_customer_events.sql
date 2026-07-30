-- Số liệu trang tổng quan phải là hành vi KHÁCH, không phải hành vi của chính shop.
-- Trước migration này PageView bắn cả khi admin duyệt khu /admin, nên ô "Lượt xem trang"
-- cộng luôn lượt tự xem của ban quản trị: càng chăm vào /admin số càng đẹp, tức là vô nghĩa.
--
-- Cách xử lý (user chốt 2026-07-30): LỌC LÚC ĐỌC, vẫn ghi đủ mọi event.
--   - Không xoá, không ngưng ghi dòng nào: dữ liệu đã ghi là dữ liệu, và dấu vết "admin nào
--     mở trang nào lúc nào" sau này còn dùng để audit được.
--   - Lọc ở tầng DB trong MỘT view, thay vì lọc trong TypeScript ở hai chỗ (ô đếm 7 ngày và
--     biểu đồ 30 ngày). Hai chỗ là hai định nghĩa "thế nào là một lượt khách", rồi chúng lệch nhau.
--   - Số 7 ngày / 30 ngày sạch NGAY với cả dòng đã ghi từ trước, không phải chờ dữ liệu cũ
--     rơi khỏi cửa sổ thời gian.

-- Danh sách tài khoản admin/owner.
--
-- PHẢI security definer: policy profiles_select_self_or_owner chặn admin phụ đọc hồ sơ người
-- khác, nên nếu tra profiles bằng quyền người gọi thì admin phụ chỉ thấy chính mình → cùng
-- một dashboard cho ra số KHÁC NHAU tuỳ ai đang đăng nhập. Thống kê không được phụ thuộc
-- người xem.
--
-- Guard trong thân hàm: khách đã đăng nhập gọi được hàm cũng chỉ nhận tập rỗng, không moi ra
-- được danh sách uuid của ban quản trị.
--
-- `auth.uid() is null` PHẢI cho qua, cùng lý do với trigger prevent_role_change: đường
-- service_role / psql không có auth.uid(), mà chặn nó thì hàm trả tập rỗng và view lặng lẽ
-- NGƯNG lọc theo tài khoản — cùng một view cho ra số khác nhau tuỳ đường vào, đúng thứ
-- migration này sinh ra để tránh. An toàn vì anon đã bị revoke execute ở dưới, nên chỉ còn
-- service_role và postgres đi vào được nhánh này.
create or replace function public.staff_user_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id from public.profiles p
  where p.role in ('admin', 'owner')
    and (public.is_admin() or auth.uid() is null);
$$;

revoke all on function public.staff_user_ids() from public, anon;
grant execute on function public.staff_user_ids() to authenticated, service_role;

-- Chỉ những event tính là "của khách".
--
-- security_invoker = on để RLS của events VẪN áp theo quyền người gọi: policy
-- events_select_admin là lớp bảo vệ thứ hai sau requireAdmin ở layout, mà view mặc định chạy
-- bằng quyền chủ sở hữu — để mặc định là lặng lẽ tháo lớp đó ra, và bất kỳ ai có quyền select
-- trên view sẽ đọc được cả clickstream.
create or replace view public.customer_events
with (security_invoker = on) as
select e.id, e.occurred_at, e.session_id, e.user_id, e.event_type, e.product_id, e.properties
from public.events e
-- coalesce chứ không so thẳng: event không phải page_view (thả tim, bấm Zalo) không có
-- properties.path, mà `null not like '/admin%'` trả về NULL → dòng bị loại oan, hụt cả
-- "lượt thả tim" lẫn "lượt bấm liên hệ".
where coalesce(e.properties ->> 'path', '') not like '/admin%'
  and (
    e.user_id is null
    or e.user_id not in (select * from public.staff_user_ids())
  );

-- Thiếu GRANT thì PostgREST trả 42501 dù RLS đúng. KHÔNG cấp cho anon, y như bảng events:
-- khách không đọc clickstream.
grant select on public.customer_events to authenticated;
grant select on public.customer_events to service_role;
