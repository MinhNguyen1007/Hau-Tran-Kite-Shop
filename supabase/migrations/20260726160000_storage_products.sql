-- Bucket ảnh sản phẩm. `src/lib/storage.ts` dựng URL trỏ vào bucket tên 'products' từ buổi 1
-- nhưng chưa ai tạo nó — thiếu migration này thì upload ảnh báo "Bucket not found".

insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do nothing;

-- public = true nghĩa là đọc file qua URL công khai không cần policy (đúng ý: khách vãng lai
-- phải xem được ảnh diều). Nhưng LIỆT KÊ file thì vẫn qua RLS, nên cần policy select ở dưới.
-- storage.objects đã bật RLS sẵn từ Supabase, không alter lại.

create policy "products_objects_select_public" on storage.objects
  for select using (bucket_id = 'products');

-- Ghi/xoá ảnh chỉ admin. Cùng luật với bảng products: RLS là lớp cuối, route upload
-- vẫn phải requireAdmin() ở tầng API.
create policy "products_objects_insert_admin" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_objects_update_admin" on storage.objects
  for update to authenticated
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

create policy "products_objects_delete_admin" on storage.objects
  for delete to authenticated
  using (bucket_id = 'products' and public.is_admin());
