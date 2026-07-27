'use client'

// Ô tìm kiếm ở header. Chỉ điều hướng sang /san-pham?q=… ;
// logEvent('search') bắn ở TRANG KẾT QUẢ (SearchTracker) vì chỉ ở đó mới biết resultCount.
// (Không đọc useSearchParams ở đây: header nằm trong root layout, hook đó sẽ ép mọi trang
// bail out khỏi static render.)
import { MagnifyingGlass } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function SearchBox({ className = '' }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    router.push(q ? `/san-pham?q=${encodeURIComponent(q)}` : '/san-pham')
  }

  return (
    <form role="search" onSubmit={handleSubmit} className={`relative ${className}`}>
      <label htmlFor="site-search" className="sr-only">
        Tìm diều
      </label>
      <input
        id="site-search"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm diều cánh cốc, diều sáo…"
        className="h-10 w-full rounded-full border border-stone-300 bg-white pl-4 pr-11 text-sm text-stone-900 placeholder:text-stone-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 dark:border-ink-700 dark:bg-ink-800 dark:text-stone-100 dark:placeholder:text-stone-400"
      />
      <button
        type="submit"
        aria-label="Tìm kiếm"
        className="absolute right-1 top-1 grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700 active:scale-95"
      >
        <MagnifyingGlass size={16} weight="bold" />
      </button>
    </form>
  )
}
