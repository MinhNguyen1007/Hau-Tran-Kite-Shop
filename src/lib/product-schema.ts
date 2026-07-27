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
  // Giá là số nguyên ĐỒNG, không phải nghìn đồng, không phải float (xem migration products).
  priceVnd: z
    .number()
    .int('Giá phải là số nguyên đồng')
    .min(0, 'Giá không được âm')
    .max(1_000_000_000, 'Giá quá lớn, kiểm tra lại giúp shop'),
  // Chỉ lưu PATH trong bucket 'products', không lưu full URL (xem skill product-card).
  imagePath: emptyToNull(300),
  stock: z.number().int('Tồn kho phải là số nguyên').min(0, 'Tồn kho không được âm').max(100_000),
})

export type ProductInputParsed = z.infer<typeof ProductInputSchema>
