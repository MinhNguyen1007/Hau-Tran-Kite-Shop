'use client'

// Sửa menu chính của header. Gửi CẢ danh sách lên PUT /api/admin/menu một lượt.
//
// Thứ tự lấy từ vị trí trong danh sách, admin không phải gõ số thứ tự: nút lên/xuống cho thấy
// ngay kết quả, còn ô "sort order" thì phải nhẩm trong đầu mới biết mục nào ra trước.
//
// Đường dẫn nhập bằng ô CHỌN đích có sẵn, kèm lựa chọn "Đường dẫn khác" để gõ tay. Gõ tự do
// hoàn toàn là cách cũ đã cắn hai lần: mục nav trỏ vào khối đã xoá, bấm vào nhảy hụt mà không
// có gì báo. Luật kiểm nằm ở lib/nav-destinations.ts (dùng chung với zod ở API).
import { ArrowDown, ArrowUp, CheckCircle, Plus, Trash, WarningCircle } from '@phosphor-icons/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { checkNavHref, NAV_DESTINATIONS } from '@/lib/nav-destinations'
import type { NavItem } from '@/lib/nav-items'
import { inputClass } from './FormField'
import { UnsavedGuard } from './UnsavedGuard'

const CUSTOM = '__khac__'

type Row = {
  // Khoá React ổn định, kể cả với mục chưa có dòng trong DB. KHÔNG dùng chỉ số mảng: đổi chỗ
  // hai mục là React coi như nội dung của chúng hoán đổi, con trỏ nhảy sang ô khác giữa chừng.
  key: string
  id: string | null
  label: string
  href: string
  active: boolean
  // Admin đang gõ tay đường dẫn. Lưu riêng chứ không suy ra từ href: chọn "Đường dẫn khác" rồi
  // gõ đúng '/lien-he' mà suy ra thì ô chọn tự nhảy về "Liên hệ" ngay dưới tay người đang gõ.
  custom: boolean
}

function toRow(item: NavItem): Row {
  return {
    key: item.id,
    id: item.id,
    label: item.label,
    href: item.href,
    active: item.active,
    custom: !NAV_DESTINATIONS.some((destination) => destination.href === item.href),
  }
}

// Chỉ những phần được LƯU, để so sánh "có thay đổi chưa". `custom` không tính: bật ô gõ tay
// rồi tắt đi mà không sửa gì thì không phải là thay đổi.
function snapshotOf(rows: Row[]): string {
  return JSON.stringify(rows.map((row) => [row.id, row.label, row.href, row.active]))
}

export function NavMenuForm({ items }: { items: NavItem[] }) {
  const router = useRouter()

  const [rows, setRows] = useState<Row[]>(() => items.map(toRow))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [initialSnapshot, setInitialSnapshot] = useState(() => snapshotOf(items.map(toRow)))

  const dirty = snapshotOf(rows) !== initialSnapshot
  // Lỗi từng dòng hiện ngay dưới ô đó; nút Lưu khoá lại khi còn dòng hỏng, để admin không phải
  // bấm rồi chờ API mới biết mình gõ sai.
  const rowErrors = rows.map((row) => (row.label.trim() === '' ? 'Chưa nhập tên mục' : checkNavHref(row.href)))
  const canSave = rows.length > 0 && rowErrors.every((message) => message === null)

  function update(key: string, patch: Partial<Row>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)))
    setSaved(false)
  }

  function move(index: number, delta: number) {
    setRows((current) => {
      const next = [...current]
      const target = index + delta
      if (target < 0 || target >= next.length) return current
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
    setSaved(false)
  }

  function add() {
    setRows((current) => [
      ...current,
      { key: crypto.randomUUID(), id: null, label: '', href: '/', active: true, custom: false },
    ])
    setSaved(false)
  }

  function remove(key: string) {
    setRows((current) => current.filter((row) => row.key !== key))
    setSaved(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/admin/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: rows.map((row) => ({
            id: row.id,
            label: row.label.trim(),
            href: row.href.trim(),
            active: row.active,
          })),
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        setError(payload?.error?.message ?? 'Không lưu được menu')
        setSaving(false)
        return
      }

      // Nhận lại danh sách đã lưu để mục MỚI có id thật; không thì bấm Lưu lần hai là chèn
      // thêm một bản sao thay vì sửa dòng vừa tạo.
      const payload = (await response.json()) as { data: NavItem[] }
      const fresh = payload.data.map(toRow)
      setRows(fresh)
      setInitialSnapshot(snapshotOf(fresh))
      setSaved(true)
      setSaving(false)
      // Header là Server Component đọc cùng bảng này — refresh để thấy menu mới ngay.
      router.refresh()
    } catch {
      setError('Mất kết nối. Thử lại nhé.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <UnsavedGuard
        dirty={dirty}
        message="Menu vừa sửa chưa được lưu. Rời trang lúc này là mất hết thay đổi, phải sắp lại từ đầu."
      />

      <ul className="flex flex-col gap-3">
        {rows.map((row, index) => (
          <li
            key={row.key}
            className="flex flex-col gap-3 rounded-xl border border-stone-200 bg-stone-50/60 p-3.5"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex min-w-52 flex-1 flex-col gap-2">
                <label
                  htmlFor={`menu-label-${row.key}`}
                  className="text-sm font-semibold text-ink-950"
                >
                  Tên mục {index + 1}
                </label>
                <input
                  id={`menu-label-${row.key}`}
                  value={row.label}
                  onChange={(event) => update(row.key, { label: event.target.value })}
                  maxLength={60}
                  placeholder="Ví dụ: Sản phẩm"
                  className={inputClass}
                />
              </div>

              <div className="flex min-w-52 flex-1 flex-col gap-2">
                <label
                  htmlFor={`menu-dest-${row.key}`}
                  className="text-sm font-semibold text-ink-950"
                >
                  Bấm vào thì tới
                </label>
                <select
                  id={`menu-dest-${row.key}`}
                  value={row.custom ? CUSTOM : row.href}
                  onChange={(event) => {
                    const value = event.target.value
                    if (value === CUSTOM) {
                      update(row.key, { custom: true })
                      return
                    }
                    update(row.key, { custom: false, href: value })
                  }}
                  className={inputClass}
                >
                  {NAV_DESTINATIONS.map((destination) => (
                    <option key={destination.href} value={destination.href}>
                      {destination.label}
                    </option>
                  ))}
                  <option value={CUSTOM}>Đường dẫn khác…</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={`Đưa mục ${index + 1} lên trên`}
                  className="grid h-10 w-10 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-200 hover:text-ink-950 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
                >
                  <ArrowUp size={17} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === rows.length - 1}
                  aria-label={`Đưa mục ${index + 1} xuống dưới`}
                  className="grid h-10 w-10 place-items-center rounded-full text-stone-600 transition-colors hover:bg-stone-200 hover:text-ink-950 disabled:cursor-not-allowed disabled:text-stone-300 disabled:hover:bg-transparent"
                >
                  <ArrowDown size={17} weight="bold" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(row.key)}
                  aria-label={`Xoá mục ${row.label || index + 1}`}
                  className="grid h-10 w-10 place-items-center rounded-full text-stone-600 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                  <Trash size={17} weight="bold" />
                </button>
              </div>
            </div>

            {row.custom && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`menu-href-${row.key}`}
                  className="text-sm font-semibold text-ink-950"
                >
                  Đường dẫn tự nhập
                </label>
                <input
                  id={`menu-href-${row.key}`}
                  value={row.href}
                  onChange={(event) => update(row.key, { href: event.target.value })}
                  maxLength={200}
                  placeholder="/san-pham?danh-muc=sao"
                  className={inputClass}
                />
                <span className="text-xs text-stone-600">
                  Đường dẫn trong web, bắt đầu bằng dấu /. Neo (#) chỉ dùng được với trang chủ.
                </span>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={row.active}
                  onChange={(event) => update(row.key, { active: event.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-ink-950 focus:ring-ink-950/20"
                />
                Hiện trên menu
              </label>

              {rowErrors[index] && (
                <span className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
                  <WarningCircle size={15} weight="fill" className="shrink-0" />
                  {rowErrors[index]}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div>
        <button
          type="button"
          onClick={add}
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-ink-950 transition-colors hover:border-stone-400 hover:bg-stone-50"
        >
          <Plus size={16} weight="bold" />
          Thêm mục
        </button>
      </div>

      {error && (
        <p role="alert" className="flex items-start gap-2 text-sm font-medium text-red-600">
          <WarningCircle size={18} weight="fill" className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 border-t border-stone-200 pt-4">
        <button
          type="submit"
          disabled={saving || !canSave}
          className="rounded-full bg-ink-950 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ink-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-600"
        >
          {saving ? 'Đang lưu…' : 'Lưu menu'}
        </button>

        {saved && !dirty && (
          <span role="status" className="flex items-center gap-1.5 text-sm font-semibold text-ink-950">
            <CheckCircle size={18} weight="fill" />
            Đã lưu
          </span>
        )}

        {dirty && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-stone-600">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-red-500" />
            Chưa lưu
          </span>
        )}
      </div>
    </form>
  )
}
