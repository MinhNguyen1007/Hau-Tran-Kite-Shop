// Bản đồ tên icon (chuỗi trong DB) → component Phosphor. SERVER COMPONENT: import từ
// '@phosphor-icons/react/ssr' theo quy ước UI của dự án.
//
// Liệt kê tay chứ không import động theo tên: bundler phải thấy được đường import tĩnh mới
// tree-shake nổi, và như vậy tên rác trong DB không thể kéo về một module bất kỳ.
import {
  Baby,
  CloudSun,
  Feather,
  Gift,
  HandHeart,
  Lightning,
  MusicNoteSimple,
  MusicNotes,
  Package,
  PaintBrushBroad,
  PaperPlaneTilt,
  Phone,
  Ruler,
  Scissors,
  SealCheck,
  Spiral,
  Star,
  Tag,
  Truck,
  Wind,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { ContentIconName } from '@/lib/content-icons'

const ICONS: Record<ContentIconName, Icon> = {
  Wind,
  MusicNotes,
  MusicNoteSimple,
  Ruler,
  Baby,
  PaintBrushBroad,
  Spiral,
  Feather,
  Package,
  CloudSun,
  Lightning,
  Truck,
  SealCheck,
  HandHeart,
  Phone,
  PaperPlaneTilt,
  Scissors,
  Gift,
  Tag,
  Star,
}

// Tên lạ (admin gõ tay, hoặc icon bị bỏ khỏi danh sách sau này) → rơi về Wind thay vì vỡ trang.
export function ContentIcon({
  name,
  size = 22,
  weight = 'bold',
  className,
}: {
  name: string
  size?: number
  weight?: 'bold' | 'fill' | 'duotone' | 'regular'
  className?: string
}) {
  const Glyph = ICONS[name as ContentIconName] ?? Wind
  return <Glyph size={size} weight={weight} className={className} aria-hidden />
}
