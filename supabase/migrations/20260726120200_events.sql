-- Clickstream append-only. Không ai được update/delete. Xem skill event-logging.
-- Phần duy nhất không hoãn được: hành vi không ghi hôm nay là mất vĩnh viễn.

create table public.events (
  id          bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  session_id  text not null,                                          -- BẮT BUỘC: nối chuỗi hành vi khách chưa login
  user_id     uuid references auth.users on delete set null,          -- null = khách vãng lai
  event_type  text not null,                                          -- taxonomy CHỐT, xem skill event-logging
  product_id  uuid references public.products on delete set null,
  properties  jsonb not null default '{}'                             -- field phát sinh, khỏi migration lại
);

alter table public.events enable row level security;

-- Ai cũng insert được event của chính mình (hoặc ẩn danh user_id = null).
create policy "events_insert" on public.events
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

-- Chỉ admin đọc (dữ liệu phân tích).
create policy "events_select_admin" on public.events
  for select using (public.is_admin());

create index events_occurred_at_idx      on public.events (occurred_at);
create index events_type_occurred_at_idx on public.events (event_type, occurred_at);
create index events_session_id_idx       on public.events (session_id);
