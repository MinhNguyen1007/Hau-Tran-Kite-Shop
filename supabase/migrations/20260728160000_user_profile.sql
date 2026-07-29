-- Trang cá nhân của khách (yêu cầu user 2026-07-28).
--
-- Web không nhận đơn: chốt đơn diễn ra trên Zalo. Mấy trường này tồn tại để lúc khách nhắn
-- Zalo, chủ shop đã có sẵn tên - số - địa chỉ, khỏi hỏi lại từ đầu.

alter table public.profiles
  add column phone       text not null default '',
  add column address     text not null default '',
  -- Path trong bucket 'avatars' (vd '<uid>/1738.webp'), KHÔNG lưu full URL — cùng luật với
  -- ảnh sản phẩm, xem src/lib/storage.ts.
  add column avatar_path text;

-- Khách sửa được hồ sơ CỦA CHÍNH MÌNH. Policy cũ chỉ cho owner update, nên trước migration
-- này không ai tự sửa nổi tên mình.
create policy "profiles_update_self" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- RLS quyết định được SỬA DÒNG NÀO chứ không chặn được SỬA CỘT NÀO: chỉ có policy trên thì
-- khách tự đặt role = 'admin' cho mình là xong. Chặn bằng trigger.
--
-- Hai nhánh chặn hai chuyện khác nhau:
--   không phải owner  → không ai tự phong hay phong cho người khác.
--   dòng cũ là owner  → vai trò chủ shop bất động, kể cả chính chủ cũng không tự hạ được
--                       (giữ nguyên bất biến đã đặt ở migration 20260727160000).
create or replace function public.prevent_role_change()
returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is not distinct from old.role then
    return new;
  end if;

  -- auth.uid() rỗng = không đi qua PostgREST bằng token người dùng: psql, migration, hoặc
  -- script dùng service key (npm run tao-chu-shop nâng role lên 'owner' đúng đường này).
  -- Mấy đường đó đã cầm khoá cao nhất rồi, chặn ở đây chỉ khoá chính chủ shop ra ngoài.
  -- KHÔNG phải lỗ hổng: client anon/authenticated luôn có uid, và cả hai policy update của
  -- bảng này đều đòi auth.uid() nên request không token không bao giờ chạm tới trigger.
  if auth.uid() is null then
    return new;
  end if;

  if not public.is_owner() then
    raise exception 'Không được đổi vai trò' using errcode = '42501';
  end if;
  if old.role = 'owner' then
    raise exception 'Không đổi được vai trò của chủ shop' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Bucket ảnh đại diện. Tách khỏi bucket 'products' vì quyền ghi khác hẳn: ảnh sản phẩm chỉ
-- admin ghi, ảnh đại diện thì mỗi khách ghi vào đúng thư mục mang uid của mình.
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Đọc công khai: ảnh đại diện hiện trên trang cá nhân, không có gì bí mật.
create policy "avatars_objects_select_public" on storage.objects
  for select using (bucket_id = 'avatars');

-- Ghi: chỉ vào thư mục '<uid>/...' của chính mình. Không có vế foldername thì khách A ghi đè
-- được ảnh của khách B.
create policy "avatars_objects_insert_self" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_objects_update_self" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "avatars_objects_delete_self" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
