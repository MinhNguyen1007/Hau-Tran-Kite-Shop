// Giá luôn VND. DB lưu integer đồng (price_vnd); format lúc render bằng ĐÚNG helper này,
// không tự nối .toLocaleString() + ' đ' rải rác trong component. Xem skill product-card.
export const formatVnd = (v: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v)
