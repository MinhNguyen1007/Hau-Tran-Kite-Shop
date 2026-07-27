// Tên icon Phosphor hợp lệ cho content_blocks.icon.
//
// File này CỐ Ý chỉ chứa chuỗi, không import gì: form admin (Client Component) cần danh sách
// này để đổ dropdown, mà kéo theo bản /ssr của icon vào client là gãy build
// (xem CLAUDE.md và bộ nhớ nextjs-client-server-import).
// Bản đồ tên → component nằm ở src/components/ui/ContentIcon.tsx, chỉ dùng phía server.
export const CONTENT_ICON_NAMES = [
  'Wind',
  'MusicNotes',
  'MusicNoteSimple',
  'Ruler',
  'Baby',
  'PaintBrushBroad',
  'Spiral',
  'Feather',
  'Package',
  'CloudSun',
  'Lightning',
  'Truck',
  'SealCheck',
  'HandHeart',
  'Phone',
  // Phosphor KHÔNG có icon tên 'Kite' — đã kiểm trong node_modules/.../dist/ssr.
  // PaperPlaneTilt là thứ gần nghĩa nhất, đừng thêm 'Kite' lại.
  'PaperPlaneTilt',
  'Scissors',
  'Gift',
  'Tag',
  'Star',
] as const

export type ContentIconName = (typeof CONTENT_ICON_NAMES)[number]

export function isContentIconName(value: string): value is ContentIconName {
  return (CONTENT_ICON_NAMES as readonly string[]).includes(value)
}
