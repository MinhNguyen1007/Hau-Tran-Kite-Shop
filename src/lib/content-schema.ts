// Schema dùng chung cho các route admin nội dung. Để riêng khỏi site-settings.ts vì file kia
// kéo theo adapter server; file này thuần zod nên form phía client cũng dùng lại được.
import { z } from 'zod'
import { checkNavHref } from './nav-destinations'

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
  productsTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề khối sản phẩm').max(120),
  categoryTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề khối danh mục').max(120),
  aboutHeading: z.string().trim().min(1, 'Chưa nhập tiêu đề khối giới thiệu').max(120),
  ctaTitle: z.string().trim().min(1, 'Chưa nhập tiêu đề dải liên hệ').max(120),
  ctaBody: z.string().trim().max(400),
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

// Cả menu gửi lên một lượt, thứ tự trong mảng LÀ thứ tự hiển thị (xem replaceNavItems).
//
// min(1): menu rỗng thì header không còn đường đi nào, mà admin không nhìn thấy hậu quả đó
// ngay lúc bấm Lưu vì trang /admin có sidebar riêng.
export const NavMenuSchema = z.object({
  items: z
    .array(
      z.object({
        // null = mục vừa thêm trong form, chưa có dòng trong DB.
        id: z.uuid('Mã mục menu không hợp lệ').nullable(),
        label: z.string().trim().min(1, 'Chưa nhập tên mục menu').max(60, 'Tên mục menu quá dài'),
        // superRefine chứ không refine: cần trả về ĐÚNG câu lỗi của checkNavHref (mỗi kiểu sai
        // một câu khác nhau), refine chỉ nhận một câu cố định.
        href: z
          .string()
          .trim()
          .superRefine((value, ctx) => {
            const message = checkNavHref(value)
            if (message) ctx.addIssue({ code: 'custom', message })
          }),
        active: z.boolean(),
      }),
    )
    .min(1, 'Menu phải có ít nhất một mục')
    .max(12, 'Menu quá dài, tối đa 12 mục'),
})

export type SiteSettingsParsed = z.infer<typeof SiteSettingsSchema>
export type CategoryParsed = z.infer<typeof CategorySchema>
export type NavMenuParsed = z.infer<typeof NavMenuSchema>
