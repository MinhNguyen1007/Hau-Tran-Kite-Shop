-- Dải kêu gọi liên hệ ở cuối trang chủ (thiết kế mới 2026-07-28).
--
-- Hai cột này tồn tại chỉ vì một lý do: chữ trên dải đó là NỘI DUNG HIỂN THỊ, mà luật của dự
-- án là nội dung hiện trên trang phải nằm trong DB để admin sửa được, không viết cứng trong
-- component. Không có bảng riêng vì đây là khối duy nhất một dòng, đúng chỗ của site_settings.

alter table public.site_settings
  add column if not exists cta_title text not null default 'Chốt đơn trực tiếp với xưởng',
  add column if not exists cta_body text not null default
    'Nhắn Zalo hoặc gọi để xưởng tư vấn kích cỡ, hoạ tiết và báo giá đúng mẫu bạn muốn.';

comment on column public.site_settings.cta_title is
  'Tiêu đề dải liên hệ cuối trang chủ';
comment on column public.site_settings.cta_body is
  'Đoạn mô tả dưới tiêu đề dải liên hệ cuối trang chủ';
