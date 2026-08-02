-- Siết quyền ĐỌC trên bucket 'avatars': chỉ đọc được thư mục của chính mình.
--
-- Policy cũ `avatars_objects_select_public` cho select mọi dòng storage.objects của bucket,
-- kể cả với vai anon. Hậu quả đo được trên production 2026-08-02: người lạ KHÔNG đăng nhập gọi
-- POST /storage/v1/object/list/avatars là nhận đủ danh sách — uid của mọi tài khoản từng tải
-- ảnh, kèm tên file và kích thước — rồi ghép URL công khai tải ảnh chân dung khách về.
-- Ảnh đại diện không hiện công khai ở đâu trên web (chỉ chính chủ và bảng /admin/tai-khoan
-- thấy), nên đây là rò rỉ thật chứ không phải dữ liệu vốn đã công khai.
--
-- HAI ĐIỀU DỄ HIỂU SAI, đừng "dọn" policy này thêm nữa:
--
-- 1. Bỏ policy select KHÔNG làm ảnh tắt. Bucket public thì tải file qua
--    /object/public/... đi thẳng, không hỏi RLS — chỉ LIỆT KÊ mới qua RLS. Ghi chú này đã có
--    trong 20260726160000_storage_products.sql từ buổi 1.
--
-- 2. Nhưng cũng ĐỪNG bỏ trắng (nút "Remove policy" trên dashboard làm đúng việc đó): Storage
--    đòi có quyền select trên dòng thì mới cho delete. Bỏ trắng là chính chủ hết xoá được ảnh
--    mình, kéo theo cả đường dọn file thừa trong AvatarUploader/updateMyProfile.
--    Vì vậy thay bằng policy HẸP, không phải xoá đi.
--
-- Bucket 'products' cố ý GIỮ policy đọc rộng: ảnh sản phẩm vốn để công khai, liệt kê được
-- cũng không mất gì.

drop policy if exists "avatars_objects_select_public" on storage.objects;

create policy "avatars_objects_select_self" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
