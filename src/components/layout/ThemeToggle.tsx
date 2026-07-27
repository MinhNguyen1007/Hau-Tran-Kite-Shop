'use client'

// Nút đổi nền sáng/tối. Cố ý KHÔNG giữ theme trong useState: server không biết người dùng
// chọn gì, nên nếu render icon theo state sẽ lệch lúc hydrate và chớp sai màu. Thay vào đó
// hai icon luôn có mặt, để CSS `dark:` quyết định cái nào hiện — khớp ngay từ HTML đầu tiên.
import { Moon, Sun } from '@phosphor-icons/react'
import { THEME_STORAGE_KEY } from '@/lib/theme'

export function ThemeToggle() {
  function toggle() {
    const root = document.documentElement
    const nextIsDark = !root.classList.contains('dark')
    root.classList.toggle('dark', nextIsDark)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light')
    } catch {
      // Trình duyệt chặn localStorage (chế độ riêng tư): vẫn đổi được trong phiên này.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title="Đổi nền sáng hoặc tối"
      aria-label="Đổi nền sáng hoặc tối"
      className="grid h-10 w-10 place-items-center rounded-lg text-stone-700 transition-colors hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-ink-800"
    >
      <Sun size={20} weight="fill" aria-hidden className="dark:hidden" />
      <Moon size={20} weight="fill" aria-hidden className="hidden dark:block" />
    </button>
  )
}
