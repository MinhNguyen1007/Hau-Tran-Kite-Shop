// Bỏ dấu tiếng Việt rồi ép kebab-case: "Diều Cánh Cốc Lớn" -> "dieu-canh-coc-lon".
//
// normalize('NFD') tách dấu thành ký tự tổ hợp riêng (U+0300..U+036F) để regex dưới xoá sạch.
// Riêng đ/Đ không phải chữ d kèm dấu nên NFD không tách được, phải thay tay.
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
