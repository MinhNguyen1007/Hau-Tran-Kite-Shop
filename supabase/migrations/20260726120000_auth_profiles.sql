-- Nền phân quyền: profiles (1-1 với auth.users) + is_admin() + trigger tạo profile.
-- Xem skill auth-rls. Role KHÔNG lưu trong JWT (tự sửa được) mà ở public.profiles.

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  role       text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer là BẮT BUỘC: nếu không, policy trên chính profiles sẽ đệ quy vô hạn.
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- user thấy profile của mình; admin thấy tất.
create policy "profiles_select_self_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

-- chỉ admin đổi role. Không cho user tự update để tránh tự nâng quyền lên admin.
create policy "profiles_update_admin" on public.profiles
  for update using (public.is_admin()) with check (public.is_admin());

-- Tự tạo profile role='user' khi có user mới. Chạy security definer nên bỏ qua RLS.
-- Không để frontend tự tạo profile (nó sẽ tự set role = admin).
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
