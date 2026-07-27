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

// Giá là số nguyên ĐỒNG, không phải nghìn đồng, không phải float (xem migration products).
const priceVnd = z
  .number()
  .int('Giá phải là số nguyên đồng')
  .min(0, 'Giá không được âm')
  .max(1_000_000_000, 'Giá quá lớn, kiểm tra lại giúp shop')

export const ProductInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Chưa nhập slug')
    .max(120)
    .regex(SLUG_PATTERN, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  name: z.string().trim().min(1, 'Chưa nhập tên sản phẩm').max(200),
  description: emptyToNull(5000),
  // Giá của mẫu bán MỘT mức. Mẫu có bảng cỡ bên dưới thì giá này không hiện ra đâu cả.
  priceVnd,
  // Chỉ lưu PATH trong bucket 'products', không lưu full URL (xem skill product-card).
  // Đây là ảnh ĐẠI DIỆN hiện trên card; bộ ảnh trang chi tiết nằm ở `images`.
  imagePath: emptyToNull(300),
  categoryId: z
    .union([z.literal(''), z.uuid('Danh mục không hợp lệ')])
    .transform((value) => value || null),

  // Bảng giá theo kích thước. Rỗng = mẫu bán một mức, dùng priceVnd.
  // Trùng nhãn bị Postgres chặn bằng unique(product_id, label); kiểm luôn ở đây để báo lỗi
  // đọc được thay vì để lộ mã 23505 ra client.
  sizes: z
    .array(z.object({ label: z.string().trim().min(1, 'Chưa nhập tên cỡ').max(60), priceVnd }))
    .max(30, 'Tối đa 30 cỡ cho một sản phẩm')
    .default([])
    .refine(
      (list) => new Set(list.map((size) => size.label.toLowerCase())).size === list.length,
      'Có hai cỡ trùng tên',
    ),

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
