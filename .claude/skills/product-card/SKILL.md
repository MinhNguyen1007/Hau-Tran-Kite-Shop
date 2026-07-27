---
name: product-card
description: Dùng khi render sản phẩm ra UI — card trong lưới danh sách, trang chi tiết, hoặc bất kỳ chỗ nào hiện ảnh/giá/nút yêu thích. Chốt cách format giá VND (khoảng giá theo cỡ), lấy ảnh từ Supabase Storage, và vì sao không có tồn kho.
---

# Card sản phẩm

## Giá — luôn VND, và thường là KHOẢNG giá

Lưu trong DB là **integer đồng**, không float, không chuỗi. Hai nguồn:

- `product_sizes` — mẫu bán nhiều cỡ, mỗi cỡ một giá. Đây là ca thường gặp với diều.
- `products.price_vnd` — mẫu bán một mức (vải, dây, phụ kiện). Có bảng cỡ thì giá này bị bỏ qua.

Render bằng `formatProductPrice(product)` trong `src/lib/product-shared.ts`, KHÔNG gọi
`formatVnd(product.priceVnd)` thẳng — mẫu nhiều cỡ sẽ hiện sai một con số thay vì khoảng giá.

```ts
formatProductPrice(product)   // "1.000.000 – 3.000.000 ₫" hoặc "450.000 ₫"
```

⚠ `Intl.NumberFormat('vi-VN')` ngăn số với ₫ bằng **NBSP (U+00A0)**, không phải dấu cách
thường. Test so chuỗi bằng literal gõ tay sẽ trượt dù nhìn y hệt — dựng mốc so sánh từ chính
`formatVnd`.

Không tự nối `.toLocaleString() + ' đ'` rải rác trong component — dùng đúng một helper.

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
