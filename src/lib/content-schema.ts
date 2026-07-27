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
  active: z.boolean(),
})

export type SiteSettingsParsed = z.infer<typeof SiteSettingsSchema>
export type ContentBlockParsed = z.infer<typeof ContentBlockSchema>
