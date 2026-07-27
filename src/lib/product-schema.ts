// Schema dùng chung cho các route admin sản phẩm. Để riêng khỏi products.ts vì file kia
// kéo theo adapter server; file này thuần zod nên form phía client cũng dùng lại được.
import { z } from 'zod'

// Slug đi thẳng vào URL /san-pham/<slug> nên ép dạng kebab-case, không dấu, không khoảng trắng.
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Ô để trống trong form gửi lên chuỗi rỗng, nhưng DB muốn null. Quy về null tại đây,
// một chỗ duy nhất, thay vì rải `|| null` khắp route.
const emptyToNull = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .default(null)

export const ProductInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Chưa nhập slug')
    .max(120)
    .regex(SLUG_PATTERN, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  name: z.string().trim().min(1, 'Chưa nhập tên sản phẩm').max(200),
  description: emptyToNull(5000),
  // Giá là CHỮ TỰ DO, không phải số: shop báo khoảng ("3 triệu – 5 triệu") chứ không có
  // bảng giá cố định. Rỗng hoặc showPrice = false thì trang khách không hiện giá.
  priceText: z.string().trim().max(120, 'Chuỗi giá quá dài'),
  showPrice: z.boolean(),
  // Mô tả cỡ làm được, cũng là chữ tự do: "Làm từ 3m đến 5m tuỳ yêu cầu".
  sizeNote: z.string().trim().max(300),
  // Chỉ lưu PATH trong bucket 'products', không lưu full URL (xem skill product-card).
  // Đây là ảnh ĐẠI DIỆN hiện trên card; bộ ảnh trang chi tiết nằm ở `images`.
  imagePath: emptyToNull(300),
  categoryId: z
    .union([z.literal(''), z.uuid('Danh mục không hợp lệ')])
    .transform((value) => value || null),

  images: z
    .array(
      z.object({
        imagePath: z.string().trim().min(1).max(300),
        alt: z.string().trim().max(200).default(''),
      }),
    )
    .max(12, 'Tối đa 12 ảnh cho một sản phẩm')
    .default([]),
})

export type ProductInputParsed = z.infer<typeof ProductInputSchema>
