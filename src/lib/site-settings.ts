// Cấu hình chung của shop, admin sửa được (bảng public.site_settings, đúng một dòng).
//
// shop.ts vẫn giữ bản HẰNG SỐ và ở đây dùng làm giá trị dự phòng: header/footer nằm trên mọi
// trang, DB hỏng mà cả web trắng thì tệ hơn nhiều so với việc hiện tạm số hotline cũ.
import { createServerSupabase } from './supabase'
import { SHOP } from './shop'

export type SiteSettings = {
  shopName: string
  tagline: string
  hotline: string
  zaloPhone: string
  email: string
  area: string
  address: string
  openHours: string
  heroNote: string
  aboutTitle: string
  aboutBody: string
}

type SiteSettingsRow = {
  shop_name: string
  tagline: string
  hotline: string
  zalo_phone: string
  email: string
  area: string
  address: string
  open_hours: string
  hero_note: string
  about_title: string
  about_body: string
}

const COLUMNS =
  'shop_name, tagline, hotline, zalo_phone, email, area, address, open_hours, hero_note, about_title, about_body'

export const SETTINGS_FALLBACK: SiteSettings = {
  shopName: SHOP.name,
  tagline: SHOP.tagline,
  hotline: SHOP.hotline,
  zaloPhone: SHOP.hotline,
  email: SHOP.email,
  area: SHOP.area,
  address: '',
  openHours: '',
  heroNote: '',
  aboutTitle: '',
  aboutBody: '',
}

function mapSettings(row: SiteSettingsRow): SiteSettings {
  return {
    shopName: row.shop_name,
    tagline: row.tagline,
    hotline: row.hotline,
    zaloPhone: row.zalo_phone,
    email: row.email,
    area: row.area,
    address: row.address,
    openHours: row.open_hours,
    heroNote: row.hero_note,
    aboutTitle: row.about_title,
    aboutBody: row.about_body,
  }
}

// KHÔNG ném lỗi: gọi từ layout nên một lần DB hỏng sẽ làm trắng toàn bộ site.
export async function getSiteSettings(): Promise<SiteSettings> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase.from('site_settings').select(COLUMNS).eq('id', 1).maybeSingle()
    if (error || !data) return SETTINGS_FALLBACK
    return mapSettings(data as SiteSettingsRow)
  } catch {
    return SETTINGS_FALLBACK
  }
}

// Người gọi PHẢI requireAdmin() trước — RLS là lớp thứ hai, không phải lớp duy nhất.
// Ở đây thì ném lỗi thật: admin bấm Lưu mà hỏng thì phải biết, không được im lặng.
export async function updateSiteSettings(input: SiteSettings): Promise<SiteSettings> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('site_settings')
    .update({
      shop_name: input.shopName,
      tagline: input.tagline,
      hotline: input.hotline,
      zalo_phone: input.zaloPhone,
      email: input.email,
      area: input.area,
      address: input.address,
      open_hours: input.openHours,
      hero_note: input.heroNote,
      about_title: input.aboutTitle,
      about_body: input.aboutBody,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
    .select(COLUMNS)
    .single()
  if (error) throw error
  return mapSettings(data as SiteSettingsRow)
}

// Đoạn văn ngăn nhau bằng dòng trống (xem cột about_body trong migration).
export function toParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean)
}

