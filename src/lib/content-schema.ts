// Schema dùng chung cho các route admin nội dung. Để riêng khỏi site-settings.ts và
// content-blocks.ts vì hai file kia kéo theo adapter server; file này thuần zod nên form
// phía client cũng dùng lại được.
import { z } from 'zod'
import { SECTIONS } from './content-blocks-shared'

// Số điện thoại VN nhập tay hay lẫn khoảng trắng và dấu chấm. Cho phép các ký tự đó rồi
// telHref/zaloHref tự dọn khoảng trắng lúc dựng link.
const phone = (label: string) =>
  z
    .string()
    .trim()
    .min(8, `${label} quá ngắn`)
    .max(20, `${label} quá dài`)
    .regex(/^[0-9+.\s()-]+$/, `${label} chỉ gồm số và dấu + . ( ) -`)

export const SiteSettingsSchema = z.object({
  shopName: z.string().trim().min(1, 'Chưa nhập tên shop').max(120),
  tagline: z.string().trim().max(200),
  hotline: phone('Hotline'),
  zaloPhone: phone('Số Zalo'),
  // Cho phép rỗng: shop có thể chưa dùng email. z.email() từ chối chuỗi rỗng nên phải union.
  email: z.union([z.literal(''), z.email('Email không hợp lệ')]),
  area: z.string().trim().max(200),
  address: z.string().trim().max(300),
  openHours: z.string().trim().max(200),
  heroNote: z.string().trim().max(500),
  aboutTitle: z.string().trim().max(200),
  aboutBody: z.string().trim().max(4000),
  footerAbout: z.string().trim().max(4000),
  productsTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề khối sản phẩm').max(120),
  promoTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề khối khuyến mãi').max(120),
  categoryTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề khối danh mục').max(120),
  aboutHeading: z.string().trim().min(1, 'Chưa nhập tiêu đề khối giới thiệu').max(120),
  guideTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề khối kinh nghiệm').max(120),
})

export const ContentBlockSchema = z.object({
  section: z.enum(SECTIONS),
  // Nhỏ hiện trước. Cho số âm để admin đẩy một khối lên đầu mà không phải đánh số lại cả list.
  sortOrder: z.number().int('Thứ tự phải là số nguyên').min(-9999).max(9999),
  title: z.string().trim().min(1, 'Chưa nhập tiêu đề').max(120),
  subtitle: z.string().trim().max(120),
  body: z.string().trim().max(1000),
  // Chỉ nhận đường dẫn nội bộ. Chặn javascript: và link ngoài đội lốt khối nội dung.
  href: z
    .string()
    .trim()
    .max(300)
    .refine((value) => value === '' || value.startsWith('/'), 'Đường dẫn phải bắt đầu bằng /'),
  icon: z.string().trim().max(60),
  // Path trong bucket 'products'. Rỗng → null (khối dùng dải màu mặc định).
  imagePath: z
    .string()
    .trim()
    .max(300)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .default(null),
  active: z.boolean(),
})

export const CategorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, 'Chưa nhập slug')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  name: z.string().trim().min(1, 'Chưa nhập tên danh mục').max(120),
  description: z.string().trim().max(1000),
  imagePath: z
    .string()
    .trim()
    .max(300)
    .transform((value) => (value === '' ? null : value))
    .nullable()
    .default(null),
  sortOrder: z.number().int('Thứ tự phải là số nguyên').min(-9999).max(9999),
})

export type SiteSettingsParsed = z.infer<typeof SiteSettingsSchema>
export type ContentBlockParsed = z.infer<typeof ContentBlockSchema>
export type CategoryParsed = z.infer<typeof CategorySchema>
