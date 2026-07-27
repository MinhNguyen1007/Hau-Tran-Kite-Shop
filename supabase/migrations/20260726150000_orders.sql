-- Đơn hàng + dòng hàng trong đơn.
--
-- Ai được GHI: chỉ server. Route /api/checkout tạo đơn và webhook Stripe cập nhật đơn, cả hai
-- chạy bằng service role (bỏ qua RLS). CỐ Ý không có policy insert/update cho anon/authenticated:
-- nếu client tự chèn được dòng orders thì nó tự đặt total_vnd, mà tiền phải do server tính.
-- Ai được ĐỌC: chủ đơn và admin.

create table public.orders (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  user_id     uuid references auth.users on delete set null,  -- null = khách chưa đăng nhập
  -- Cùng session_id với bảng events: nối được đơn hàng vào chuỗi hành vi trước đó của khách.
  session_id  text,
  status      text not null default 'pending'
              check (status in ('pending', 'paid', 'shipped', 'done', 'cancelled', 'failed')),
  -- Tổng tiền do SERVER tính lại từ bảng products, không lấy từ client.
  total_vnd   int not null check (total_vnd >= 0),

  customer_name    text not null check (char_length(customer_name) between 1 and 100),
  customer_phone   text not null check (char_length(customer_phone) between 8 and 20),
  customer_email   text,
  shipping_address text not null check (char_length(shipping_address) between 1 and 500),
  note             text,

  stripe_session_id text unique,
  -- Idempotency: Stripe gửi lại webhook khi timeout. Unique ở đây khiến lần gửi lại
  -- bị Postgres chặn thay vì cộng đơn hai lần.
  stripe_event_id   text unique,
  paid_at           timestamptz
);

create table public.order_items (
  id         bigint generated always as identity primary key,
  order_id   uuid not null references public.orders on delete cascade,
  -- on delete set null chứ không cascade: gỡ sản phẩm không được làm bốc hơi dòng trong đơn cũ.
  product_id uuid references public.products on delete set null,
  -- Chụp lại tên và giá LÚC MUA. Admin sửa giá sau này thì đơn cũ vẫn giữ đúng số tiền đã trả.
  name            text not null,
  unit_price_vnd  int not null check (unit_price_vnd >= 0),
  quantity        int not null check (quantity > 0)
);

alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Chủ đơn thấy đơn của mình; admin thấy tất. Đơn của khách vãng lai (user_id null) chỉ admin thấy.
create policy "orders_select" on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

-- Chỉ admin đổi trạng thái tay (giao hàng, huỷ). pending → paid thì CHỈ webhook được làm,
-- và webhook đi bằng service role nên không đụng tới policy này.
create policy "orders_update_admin" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

-- Dòng hàng đi theo quyền của đơn chứa nó.
create policy "order_items_select" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

create index orders_user_id_idx    on public.orders (user_id);
create index orders_created_at_idx on public.orders (created_at desc);
create index orders_status_idx     on public.orders (status);
create index order_items_order_id_idx on public.order_items (order_id);

-- GRANT: KHÔNG cấp gì cho anon (khách vãng lai không đọc đơn qua API).
-- authenticated chỉ select — insert/update dành riêng cho service role.
grant select on public.orders, public.order_items to authenticated;
grant update on public.orders to authenticated;   -- RLS thu hẹp lại còn đúng admin
grant all    on public.orders, public.order_items to service_role;
