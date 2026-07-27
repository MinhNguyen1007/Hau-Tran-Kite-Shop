-- Cấp quyền bảng cho các role API. Thiếu GRANT thì RLS còn chẳng được đánh giá
-- (PostgREST báo 42501 "permission denied for table"). GRANT mở rộng, RLS mới là lớp
-- quyết định thật sự chặn từng dòng. service_role bỏ qua RLS nên cấp full.

grant usage on schema public to anon, authenticated, service_role;

-- products: đọc công khai cho khách vãng lai; ghi để RLS is_admin() chặn.
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;

-- events: ai cũng insert được (kể cả anon); đọc chỉ authenticated rồi RLS lọc còn admin.
grant insert on public.events to anon, authenticated;
grant select on public.events to authenticated;

-- profiles: chỉ authenticated; RLS lọc còn của mình / admin. Không cho anon.
grant select, update on public.profiles to authenticated;

-- service role cho tác vụ hệ thống (webhook ghi order_paid, seed, v.v.).
grant all on public.products, public.events, public.profiles to service_role;
