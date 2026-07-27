---
name: product-card
description: Dùng khi render sản phẩm ra UI — card trong lưới danh sách, trang chi tiết, hoặc bất kỳ chỗ nào hiện ảnh/giá/nút yêu thích. Chốt cách hiện giá (chữ tự do, admin ẩn được), lấy ảnh từ Supabase Storage, và vì sao không có tồn kho lẫn bộ chọn cỡ.
---

# Card sản phẩm

## Giá — CHỮ TỰ DO, admin ẩn được

`products.price_text` là chuỗi admin gõ tay: "3 triệu – 5 triệu", "350.000 ₫", "Liên hệ".
Shop làm thủ công theo yêu cầu nên không có bảng giá cố định — đừng cố ép về số.

Đọc bằng `visiblePrice(product)` trong `src/lib/product-shared.ts`, ĐỪNG đọc thẳng
`product.priceText`:

```ts
visiblePrice(product)   // string | null
```

Nó lo luôn **hai** đường ẩn giá — `show_price = false` (admin tạm ẩn nhưng vẫn giữ chữ) và
chuỗi rỗng (chưa ghi). Rải tay ra là chỗ hiện giá chỗ không, khách thấy mâu thuẫn.

`null` → hiện "Liên hệ để biết giá", đừng để chỗ trống.

`formatVnd` vẫn còn cho nơi thật sự có số. ⚠ `Intl.NumberFormat('vi-VN')` ngăn số với ₫ bằng
**NBSP (U+00A0)**, không phải dấu cách thường — test so chuỗi bằng literal gõ tay sẽ trượt dù
nhìn y hệt.

## Kích thước là MÔ TẢ, không phải lựa chọn

`products.size_note` — "Nhận làm từ 3m đến 5m, cỡ lớn hơn liên hệ shop". Đừng dựng lại bộ chọn
cỡ: shop làm theo yêu cầu, cho khách "chọn" là hứa những thứ chưa chắc làm được.

## Ảnh

Ảnh nằm trong Supabase Storage bucket `products`. DB chỉ lưu **path** (vd `kites/canh-coc-01.webp`),
không lưu full URL — đổi hạ tầng là hỏng hết.
Lấy URL qua `getPublicUrl()` trong `src/lib/storage.ts`, không gọi Supabase thẳng trong component.

Hai chỗ chứa ảnh:
- `products.image_path` — ảnh **bìa**, hiện trên card ngoài lưới.
- `product_images` — bộ ảnh trang chi tiết (`ProductGallery`).

Dùng `next/image` với `alt` là tên sản phẩm (không để `alt=""` trừ ảnh trang trí thuần).
Ảnh đầu tiên trong lưới đặt `priority`.

## KHÔNG có trạng thái hết hàng

Tồn kho đã bỏ hẳn 2026-07-27 (drop cột `products.stock`). Diều làm thủ công theo đơn: "còn 5
chiếc" là thông tin sai và làm khách ngại hỏi. Đừng thêm lại nhãn "Hết hàng", đừng disable nút
gì theo tồn kho — mẫu nào cũng đặt được, đó là điểm mạnh của shop chứ không phải thiếu sót.

## Cấu trúc

```tsx
type ProductCardProps = {
  product: Pick<Product, 'id' | 'name' | 'priceVnd' | 'imagePath' | 'stock'>
}
```

Card là **Server Component** (chỉ render). Nút yêu thích (`WishlistButton`) tách ra Client
Component riêng vì nó cần `onClick` + đọc state danh sách.

Dựng dữ liệu cho nút bằng `toWishlistItem(product)` — KHÔNG truyền thẳng kiểu `Product` xuống
client, vì `products.ts` kéo theo adapter server (`next/headers`) và sẽ gãy build.

## Bắt buộc

- Xem chi tiết sản phẩm → `logEvent('product_view', { productId })`.
- Bấm tim → `add_to_wishlist` / `remove_from_wishlist`. Lời gọi nằm sẵn trong
  `wishlist-store.ts`, nút KHÔNG tự log. Xem skill `event-logging`.
- Trang chi tiết phải có `ContactCta` (nút Zalo/gọi) — web không nhận đơn, đó là đường
  chốt đơn duy nhất.
- Trước khi viết CSS/layout: chạy skill `design-taste-frontend` (preference global).
