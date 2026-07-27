-- Danh sách yêu thích ("Diều tôi thích") của khách ĐÃ ĐĂNG NHẬP.
--
-- Khách vãng lai vẫn thích được, nhưng lưu ở localStorage phía client — bảng này không có
-- chỗ cho họ (user_id not null). Lúc đăng nhập, client merge danh sách local lên đây.
-- Vì thế thao tác thêm phải IDEMPOTENT: merge chạy lại nhiều lần không được nhân bản dòng.
-- Khoá chính kép (user_id, product_id) lo việc đó, kèm `on conflict do nothing` ở tầng code.

create table public.wishlists (
  user_id    uuid not null references auth.users    on delete cascade,
  -- cascade: sản phẩm bị xoá cứng thì dòng thích cũng đi theo. Xoá MỀM (archived_at) mới là
  -- đường thường dùng của admin, và nó không đụng tới bảng này — RLS của products tự giấu hàng.
  product_id uuid not null references public.products on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

alter table public.wishlists enable row level security;

-- Khách chỉ thấy danh sách của chính mình. Admin thấy tất để biết mẫu nào được ưng nhiều.
create policy "wishlists_select" on public.wishlists
  for select using (user_id = auth.uid() or public.is_admin());

-- Chỉ thích được cho chính mình — with check chặn việc nhét product vào tài khoản người khác.
create policy "wishlists_insert" on public.wishlists
  for insert with check (user_id = auth.uid());

create policy "wishlists_delete" on public.wishlists
  for delete using (user_id = auth.uid());

-- Không có policy update: bảng chỉ gồm khoá và created_at, sửa dòng là vô nghĩa.
-- Bỏ thích = delete rồi thích lại = insert.

-- Đếm "mẫu nào được thích nhiều nhất" quét theo product_id, không theo user.
create index wishlists_product_id_idx on public.wishlists (product_id);

-- GRANT bắt buộc cho bảng public mới, RLS đúng vẫn 42501 nếu thiếu (xem docs/architecture.md).
-- KHÔNG cấp cho anon: khách chưa đăng nhập dùng localStorage, không chạm bảng này.
grant select, insert, delete on public.wishlists to authenticated;
