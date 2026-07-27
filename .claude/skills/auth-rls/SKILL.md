---
name: auth-rls
description: Dùng khi viết migration Supabase, tạo bảng mới, viết RLS policy, hoặc làm bất cứ gì liên quan phân quyền admin/user trong dự án này. Nêu pattern policy chuẩn và luật kiểm quyền hai lớp.
---

# RLS trong Supabase

## Nguyên tắc

- **Bật RLS cho MỌI bảng trong `public`.** Bảng không bật RLS = ai có anon key cũng đọc được.
- **RLS là lớp cuối, không phải lớp duy nhất.** Thao tác admin phải kiểm role ở API NỮA
  (xem skill `api-route`). Lý do: RLS không bảo vệ được khi code lỡ dùng service role key.
- **Role lưu ở đâu:** bảng `public.profiles` (1-1 với `auth.users`), cột `role text`
  check in `('user','admin')`, default `'user'`. Không lưu role trong JWT claim tự sửa được.

## Helper

```sql
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
```

`security definer` là bắt buộc — nếu không, chính policy trên `profiles` sẽ đệ quy vô hạn.

## Pattern policy

```sql
alter table public.orders enable row level security;

-- user chỉ thấy đơn của mình; admin thấy tất
create policy "orders_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- user chỉ tạo đơn cho chính mình
create policy "orders_insert" on public.orders
  for insert with check (user_id = auth.uid());

-- chỉ admin sửa trạng thái đơn
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
```

Bảng đọc công khai (`products`): `for select using (true)`, còn insert/update/delete
chỉ `public.is_admin()`.

## Tự tạo profile khi có user mới

Trigger `on auth.users after insert` → chèn `public.profiles` với `role = 'user'`.
Không để frontend tự tạo profile (nó sẽ tự set role = admin).

## Checklist trước khi coi là xong

- [ ] `alter table ... enable row level security` cho bảng mới.
- [ ] Có policy cho ĐỦ các thao tác dùng đến; thiếu policy = mặc định từ chối.
- [ ] Test thật bằng 2 tài khoản: user thường KHÔNG làm được thao tác admin.
- [ ] Route admin tương ứng cũng kiểm role ở tầng API.
