-- Mục 'Sản phẩm' và 'Liên hệ' trên menu chính chuyển thành NEO trong trang chủ.
--
-- Yêu cầu user 2026-08-01: bấm 'Sản phẩm' thì cuộn xuống khối sản phẩm ngay trên trang chủ,
-- giống hệt 'Danh mục' và 'Giới thiệu', chứ không nhảy sang trang khác. Muốn xem trang riêng
-- thì đã có nút 'Xem tất cả sản phẩm' ở cuối khối. 'Liên hệ' cũng vậy — cuộn xuống dải
-- ContactBand thay vì mở /lien-he.
--
-- Hai trang /san-pham và /lien-he KHÔNG bỏ: footer vẫn dẫn tới, và nút 'Xem tất cả sản phẩm'
-- vẫn là đường vào chính của /san-pham.
--
-- Neo phải CÓ THẬT trước khi đổi ở đây: id 'san-pham' nằm trên <section> của NewArrivals.tsx,
-- id 'lien-he' trên <section> của ContactBand.tsx, và cả hai đã khai trong KNOWN_ANCHORS
-- (src/lib/nav-destinations.ts). Đổi thứ tự hai việc này là menu trỏ vào chỗ trống.

-- Khớp theo href chứ không theo label: admin có thể đã đổi tên mục, nhưng đích thì chưa.
-- Chạy lại nhiều lần không sao — lần thứ hai khớp 0 dòng.
update public.nav_items set href = '/#san-pham' where href = '/san-pham';
update public.nav_items set href = '/#lien-he'  where href = '/lien-he';
