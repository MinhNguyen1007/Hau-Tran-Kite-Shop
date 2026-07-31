-- Siết trigger đăng ký: bỏ miễn trừ `@hautran-kite.local`.
--
-- Migration trước (20260731120000) còn chừa cửa cho miền nội bộ vì `npm run tao-chu-shop` tạo
-- tài khoản mật khẩu cho chủ shop. Từ 2026-07-31 web chuyển sang MỘT cửa đăng nhập Google cho
-- tất cả (user chốt: bày form "Đăng nhập quản trị" ngoài trang khách vừa thừa vừa lộ khu quản
-- trị). Tài khoản `adminhautran` đã xoá, `login-identifier.ts` và script tạo tài khoản cũng
-- xoá — miễn trừ đó giờ là cửa mở không ai dùng, nên đóng lại.
--
-- Giữ nguyên HƯỚNG SAI AN TOÀN của bản cũ: chỉ chặn khi provider ĐÚNG LÀ 'email'. Provider lạ
-- hoặc null vẫn cho qua. Đảo thành "chỉ cho qua khi = google" là hễ GoTrue đổi cách ghi
-- raw_app_meta_data thì khách hết đăng ký được, mà giờ Google là đường DUY NHẤT nên hỏng kiểu
-- đó là chết cả web chứ không riêng phần đăng ký.
--
-- CỬA THOÁT HIỂM (docs/deploy.md ghi kỹ hơn): mất hết đường vào thì dùng Supabase Dashboard,
-- `update public.profiles set role = 'owner' where email = '<email>'`. Trigger này không cản
-- việc đó — nó chỉ chạy lúc INSERT tài khoản mới, không chạy lúc đổi vai trò.

create or replace function public.chi_cho_dang_ky_google()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if coalesce(new.raw_app_meta_data ->> 'provider', '') = 'email' then
    raise exception 'Dang ky bang email da dong. Dung nut "Tiep tuc voi Google".'
      using errcode = 'check_violation';
  end if;

  return new;
end;
$$;
