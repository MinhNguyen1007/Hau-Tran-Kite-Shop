-- Tin nhắn từ form liên hệ. Khách vãng lai gửi được (user_id null), chỉ admin đọc.
-- Ràng buộc độ dài đặt Ở DB chứ không chỉ ở form: form chỉ là gợi ý, ai cũng POST thẳng được.

create table public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id    uuid references auth.users on delete set null,   -- null = khách chưa đăng nhập
  name       text not null check (char_length(name) between 1 and 100),
  phone      text not null check (char_length(phone) between 8 and 20),
  email      text          check (email is null or char_length(email) <= 200),
  message    text not null check (char_length(message) between 1 and 2000),
  handled    boolean not null default false                   -- admin đánh dấu đã liên hệ lại
);

alter table public.contact_messages enable row level security;

-- Ai cũng gửi được, nhưng không được mạo danh user khác.
create policy "contact_messages_insert" on public.contact_messages
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- Chỉ admin đọc. Khách KHÔNG đọc lại được tin mình vừa gửi — trong bảng có số điện thoại
-- của người khác, mở select cho user thường là lộ dữ liệu cá nhân.
create policy "contact_messages_select_admin" on public.contact_messages
  for select using (public.is_admin());

-- Chỉ admin đổi cờ handled.
create policy "contact_messages_update_admin" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

create index contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- GRANT bắt buộc, không thì PostgREST trả 42501 dù RLS đã đúng.
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
