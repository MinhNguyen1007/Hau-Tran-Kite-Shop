// Format lỗi thống nhất cho mọi route trong src/app/api/** (xem skill api-route).
// Client chỉ nhận code + câu tiếng Việt đọc được. KHÔNG trả stack trace, KHÔNG trả message
// gốc của Postgres — nó lộ tên bảng, tên cột, đôi khi cả nội dung dòng dữ liệu.
import { NextResponse } from 'next/server'

export type ApiErrorCode =
  | 'INVALID_INPUT'
  | 'UNAUTHENTICATED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'INTERNAL'

export function fail(status: number, code: ApiErrorCode, message: string) {
  return NextResponse.json({ error: { code, message } }, { status })
}

// requireAdmin trong supabase.ts ném Error('UNAUTHORIZED' | 'FORBIDDEN'). Đổi sang response
// chuẩn ở một chỗ để mọi route admin trả lỗi giống nhau. Ném lỗi khác thì để route tự lo 500.
export function failFromAuthError(error: unknown) {
  const reason = error instanceof Error ? error.message : ''
  if (reason === 'UNAUTHORIZED') {
    return fail(401, 'UNAUTHENTICATED', 'Bạn cần đăng nhập')
  }
  if (reason === 'FORBIDDEN') {
    return fail(403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác này')
  }
  return null
}
