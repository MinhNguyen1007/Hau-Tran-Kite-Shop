'use client'

// Ảnh lớn + dải ảnh nhỏ bấm để đổi. Client Component vì cần state ảnh đang xem.
// Chỉ một ảnh thì không hiện dải thumbnail — đỡ thừa một hàng trống.
import Image from 'next/image'
import { useState } from 'react'
import { getProductImageUrl } from '@/lib/storage'

export function ProductGallery({ paths, name }: { paths: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const current = paths[active] ?? paths[0]

  if (!current) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-2xl border border-stone-200 bg-gradient-to-br from-brand-50 to-brand-100 dark:border-ink-700 dark:from-ink-800 dark:to-ink-900">
        <div
          className="h-24 w-24 rotate-45 rounded-lg border-2 border-brand-300 dark:border-brand-700"
          aria-hidden
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-stone-200 dark:border-ink-700">
        <Image
          src={getProductImageUrl(current)}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {paths.length > 1 && (
        <ul className="no-scrollbar flex gap-2 overflow-x-auto">
          {paths.map((path, index) => (
            <li key={path}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Xem ảnh ${index + 1} của ${name}`}
                aria-current={index === active}
                className={`relative block h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                  index === active
                    ? 'border-brand-600 dark:border-brand-400'
                    : 'border-stone-200 hover:border-brand-300 dark:border-ink-700'
                }`}
              >
                <Image
                  src={getProductImageUrl(path)}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
