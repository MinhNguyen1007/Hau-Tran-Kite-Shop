---
name: product-card
description: Dùng khi render sản phẩm ra UI — card trong lưới danh sách, trang chi tiết, hoặc bất kỳ chỗ nào hiện ảnh/giá/nút yêu thích. Chốt cách format giá VND, lấy ảnh từ Supabase Storage, và xử lý hết hàng.
---

# Card sản phẩm

## Giá — luôn VND

Lưu trong DB là **integer đồng** (`price_vnd int`), không dùng float, không lưu chuỗi.
Format lúc render:

```ts
export const formatVnd = (v: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
// 450000 → "450.000 ₫"
```

Không tự nối `.toLocaleString() + ' đ'` rải rác trong component — dùng đúng một helper.

## Ảnh

Ảnh nằm trong Supabase Storage bucket `products`. DB chỉ lưu **path** (vd `kites/canh-coc-01.webp`),
không lưu full URL — đổi hạ tầng là hỏng hết.
Lấy URL qua `getPublicUrl()` trong `src/lib/storage.ts`, không gọi Supabase thẳng trong component.

Dùng `next/image` với `width`/`height` cố định + `alt` là tên sản phẩm (không để `alt=""`).
Ảnh đầu tiên trong lưới đặt `priority`.

## Trạng thái hết hàng

`stock === 0` → nhãn "Hết hàng" trên ảnh, ảnh giảm opacity.
Không ẩn sản phẩm khỏi lưới — người ta vẫn muốn xem.

**KHÔNG disable nút yêu thích khi hết hàng.** Diều làm thủ công, hết hàng chỉ nghĩa là chưa có
sẵn; khách ưng mẫu hết hàng rồi nhắn Zalo đặt làm là luồng chính của shop. Chặn lại là chặn
đúng đơn đáng giá nhất. (Nút thêm giỏ ngày trước có disable — luật đó đã bỏ cùng giỏ hàng.)

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
