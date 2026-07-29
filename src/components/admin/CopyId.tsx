'use client'

// Hiện mã (uuid) của một dòng, bấm là chép đầy đủ vào clipboard.
//
// Chỉ hiện 8 ký tự đầu: uuid đầy đủ dài 36 ký tự, in hết ra thì cột nào cũng vỡ mà mắt người
// cũng không đọc nổi. Tám ký tự đủ để đối chiếu bằng mắt, còn muốn dùng thật thì bấm chép.
import { Check, Copy } from '@phosphor-icons/react'
import { useState } from 'react'

export function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Trình duyệt chặn clipboard (http, Safari cũ) — vẫn còn title để bôi đen chép tay.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={`Chép mã đầy đủ: ${id}`}
      className="group flex items-center gap-1 font-mono text-xs text-stone-500 transition-colors hover:text-ink-950"
    >
      {id.slice(0, 8)}
      {copied ? (
        <Check size={12} weight="bold" className="text-ink-950" />
      ) : (
        <Copy size={12} weight="bold" className="opacity-0 transition-opacity group-hover:opacity-100" />
      )}
      <span className="sr-only">{copied ? 'Đã chép mã' : 'Chép mã đầy đủ'}</span>
    </button>
  )
}
