// Bài hướng dẫn chơi diều kèm link YouTube — hiện ở trang /huong-dan và cụm link cuối footer.
//
// KHÁC với content_blocks section 'guide' (thẻ "Kinh nghiệm chơi diều" trên trang chủ, chỉ
// có chữ, không link). Hai thứ hiển thị ở hai chỗ khác nhau nên để riêng bảng.
import { createServerSupabase } from './supabase'

export type GuideVideo = {
  id: string
  title: string
  description: string
  // Rỗng = chưa có link. Mục vẫn hiện tiêu đề + mô tả nhưng không bấm được —
  // thà vậy còn hơn dẫn khách vào link chết.
  youtubeUrl: string
  sortOrder: number
  active: boolean
}

export type GuideVideoInput = Omit<GuideVideo, 'id'>

type GuideVideoRow = {
  id: string
  title: string
  description: string
  youtube_url: string
  sort_order: number
  active: boolean
}

const COLUMNS = 'id, title, description, youtube_url, sort_order, active'

function mapGuide(row: GuideVideoRow): GuideVideo {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    youtubeUrl: row.youtube_url,
    sortOrder: row.sort_order,
    active: row.active,
  }
}

function toRow(input: GuideVideoInput) {
  return {
    title: input.title,
    description: input.description,
    youtube_url: input.youtubeUrl,
    sort_order: input.sortOrder,
    active: input.active,
  }
}

// Gọi từ footer (nằm trên MỌI trang) nên KHÔNG ném lỗi — DB hỏng thì cụm link rỗng,
// không được làm sập cả site.
export async function getGuideVideos(): Promise<GuideVideo[]> {
  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('guide_videos')
      .select(COLUMNS)
      .order('sort_order', { ascending: true })
    if (error) return []
    return (data ?? []).map((row) => mapGuide(row as GuideVideoRow))
  } catch {
    return []
  }
}

// Người gọi PHẢI requireAdmin(). Ném lỗi thật: admin cần biết khi hỏng.
export async function getGuideVideosForAdmin(): Promise<GuideVideo[]> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('guide_videos')
    .select(COLUMNS)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []).map((row) => mapGuide(row as GuideVideoRow))
}

export async function getGuideVideoById(id: string): Promise<GuideVideo | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('guide_videos').select(COLUMNS).eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapGuide(data as GuideVideoRow) : null
}

export async function createGuideVideo(input: GuideVideoInput): Promise<GuideVideo> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase.from('guide_videos').insert(toRow(input)).select(COLUMNS).single()
  if (error) throw error
  return mapGuide(data as GuideVideoRow)
}

export async function updateGuideVideo(id: string, input: GuideVideoInput): Promise<GuideVideo | null> {
  const supabase = await createServerSupabase()
  const { data, error } = await supabase
    .from('guide_videos')
    .update(toRow(input))
    .eq('id', id)
    .select(COLUMNS)
    .maybeSingle()
  if (error) throw error
  return data ? mapGuide(data as GuideVideoRow) : null
}

export async function deleteGuideVideo(id: string): Promise<void> {
  const supabase = await createServerSupabase()
  const { error } = await supabase.from('guide_videos').delete().eq('id', id)
  if (error) throw error
}
