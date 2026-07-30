'use client'

// Trang tổng quan tự cập nhật khi có khách chạm vào web, không phải bấm F5.
//
// Cách làm: nghe Realtime của Supabase trên bảng `events` (khách xem trang / thả tim / bấm
// Zalo đều ghi một dòng vào đó), rồi gọi router.refresh() để Server Component tính lại số.
// KHÔNG tự cộng số ở client: số liệu phải khớp tuyệt đối với DB, mà cộng tay thì lệch ngay
// khi một bản tin rớt giữa đường.
//
// Hai lớp:
//  1. Realtime — gần như tức thì, nhưng gộp 3 giây một lần. Một lượt xem trang bắn nhiều
//     event liền nhau, refresh từng cái là trang nhấp nháy liên tục.
//  2. Hẹn giờ 60 giây — lưới an toàn cho lúc realtime không bật được (container realtime tắt,
//     mạng chặn websocket). Không có nó thì trang đứng im mà chẳng ai biết vì sao.
//
// Nghe BẢNG `events` chứ không phải view `customer_events` (Realtime chỉ phát trên bảng, đổi
// sang view là kênh im lặng vĩnh viễn mà không báo lỗi). Nghĩa là admin tự duyệt /admin cũng
// kích một lần refresh — vô hại, vì số tính lại đã lọc hành vi admin nên không đổi.
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabase-browser'

const BURST_WINDOW_MS = 3000
const FALLBACK_MS = 60_000

export function LiveRefresh() {
  const router = useRouter()
  const [live, setLive] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    const supabase = createBrowserSupabase()

    const refreshSoon = () => {
      if (timerRef.current !== null) return
      timerRef.current = window.setTimeout(() => {
        timerRef.current = null
        setUpdatedAt(new Date())
        router.refresh()
      }, BURST_WINDOW_MS)
    }

    const channel = supabase
      .channel('admin-events')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'events' }, refreshSoon)
      .subscribe((status) => setLive(status === 'SUBSCRIBED'))

    const fallback = window.setInterval(() => {
      setUpdatedAt(new Date())
      router.refresh()
    }, FALLBACK_MS)

    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current)
      window.clearInterval(fallback)
      supabase.removeChannel(channel)
    }
  }, [router])

  return (
    <span className="flex items-center gap-2 rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600">
      {/* Chấm này mang trạng thái THẬT của kết nối, không phải chấm trang trí. */}
      <span
        aria-hidden
        className={`h-2 w-2 rounded-full ${live ? 'animate-pulse bg-emerald-500' : 'bg-stone-400'}`}
      />
      {live ? 'Đang cập nhật trực tiếp' : 'Tự làm mới mỗi phút'}
      {updatedAt && (
        <span className="tabular-nums text-stone-500">
          · {updatedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      )}
    </span>
  )
}
