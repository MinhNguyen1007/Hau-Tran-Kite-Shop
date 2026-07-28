-- Vai trò CHỦ SHOP (owner) đứng trên admin.
--
-- Trước migration này mọi admin ngang quyền nhau: ai cũng nâng/hạ được vai trò của người
-- khác, kể cả hạ đúng người đã tuyển mình. Giờ tách hai bậc:
--
--   owner  — DUY NHẤT một tài khoản. Làm được mọi thứ admin làm, CỘNG quản lý tài khoản.
--   admin  — admin phụ do owner nâng lên. Toàn quyền nội dung (sản phẩm, danh mục, trang chủ,
--            thông tin shop, tin nhắn) nhưng KHÔNG đụng được vào vai trò của bất kỳ ai.
--   user   — khách thường.
--
-- is_admin() được mở rộng để owner cũng tính là admin, nên MỌI policy cũ đang gọi is_admin()
-- giữ nguyên nghĩa — không phải sửa lại từng bảng.

alter table public.profiles drop constraint profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('user', 'admin', 'owner'));

-- Chặn ở tầng DB chứ không chỉ ở tầng app: "chỉ có một chủ" là bất biến của mô hình phân
-- quyền này, không phải luật nghiệp vụ đổi được. Index một phần → chỉ ràng buộc dòng owner.
create unique index profiles_one_owner on public.profiles (role) where role = 'owner';

-- Trang quản lý tài khoản phải hiện được ai là ai. auth.users KHÔNG với tới được qua
-- PostgREST (schema auth không expose), nên chép email sang profiles và giữ đồng bộ bằng
-- trigger. Chép chứ không join: rẻ hơn và giữ nguyên luật "mọi truy cập DB qua public".
alter table public.profiles add column email text;

update public.profiles p set email = u.email from auth.users u where u.id = p.id;

create or replace function public.is_owner()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'owner'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'owner')
  );
$$;

-- Admin phụ KHÔNG được đọc danh sách tài khoản người khác — quản lý tài khoản là việc của
-- riêng owner, và danh sách này chứa email của mọi khách đã đăng ký.
drop policy "profiles_select_self_or_admin" on public.profiles;

create policy "profiles_select_self_or_owner" on public.profiles
  for select using (id = auth.uid() or public.is_owner());

-- Chỉ owner đổi được vai trò, và hai vế chặn hai hướng lạm quyền khác nhau:
--   using       — dòng CŨ không phải owner  → không ai hạ/sửa được tài khoản chủ, kể cả chính chủ.
--   with check  — dòng MỚI không phải owner → không ai tự nhân bản thêm một chủ thứ hai.
drop policy "profiles_update_admin" on public.profiles;

create policy "profiles_update_owner" on public.profiles
  for update
  using (public.is_owner() and role <> 'owner')
  with check (public.is_owner() and role <> 'owner');

-- Thêm email vào profile sinh tự động. Vẫn security definer + role mặc định 'user':
-- không bao giờ để đường đăng ký tự quyết định vai trò.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create or replace function public.sync_profile_email()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (new.email is distinct from old.email)
  execute function public.sync_profile_email();
