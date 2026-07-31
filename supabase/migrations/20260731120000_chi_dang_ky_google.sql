-- Khách chỉ tạo được tài khoản bằng Google (user chốt 2026-07-31). Trang /dang-ky và
-- RegisterForm đã xoá, nhưng gỡ giao diện KHÔNG chặn được ai POST thẳng /auth/v1/signup —
-- luật dự án bắt chặn ở backend, frontend chỉ ẩn UI.
--
-- VÌ SAO KHÔNG DÙNG CỜ CÓ SẴN: `[auth.email] enable_signup = false` trong config.toml tắt cả
-- provider email, tức là KHOÁ LUÔN đăng nhập mật khẩu của chủ shop (đo được: /auth/v1/token
-- trả 422 `email_provider_disabled` "Email logins are disabled"). `[auth] enable_signup = false`
-- thì chặn cả Google. GoTrue không có cờ "cấm đăng ký email nhưng cho đăng nhập email", nên
-- phải tự chặn ở tầng DB.
--
-- HƯỚNG SAI AN TOÀN: chỉ chặn khi provider ĐÚNG LÀ 'email'. Provider lạ hoặc null thì cho qua.
-- Đảo lại (chỉ cho qua khi provider = 'google') là hễ GoTrue đổi cách ghi raw_app_meta_data
-- một chút thì khách Google hết đăng ký được — hỏng nặng hơn nhiều so với lọt vài tài khoản rác.

create or replace function public.chi_cho_dang_ky_google()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- Miền nội bộ được miễn: đó là tài khoản nhân sự do `npm run tao-chu-shop` tạo qua admin API
  -- (chủ shop đăng nhập bằng tên tài khoản, không có Gmail). PHẢI khớp ACCOUNT_EMAIL_DOMAIN
  -- trong src/lib/login-identifier.ts và scripts/tao-chu-shop.mjs — giờ hằng số này nằm ở BA
  -- chỗ, sửa một chỗ phải sửa cả ba.
  if coalesce(new.raw_app_meta_data ->> 'provider', '') = 'email'
     and coalesce(new.email, '') not like '%@hautran-kite.local'
  then
    raise exception 'Dang ky bang email da dong. Dung nut "Tiep tuc voi Google".'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;

-- BEFORE INSERT: chạy trước `on_auth_user_created`, nên khi chặn thì không có dòng profiles mồ côi.
create trigger chan_dang_ky_email
  before insert on auth.users
  for each row execute function public.chi_cho_dang_ky_google();
