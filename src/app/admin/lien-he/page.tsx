import { getContactMessages } from '@/lib/contact'

// Ngày giờ theo múi giờ Việt Nam, không theo múi giờ máy chủ.
const formatSentAt = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso))

export default async function AdminContactPage() {
  // Layout /admin chặn ở lớp 1; RLS contact_messages_select_admin là lớp 2.
  const messages = await getContactMessages()

  return (
    <div>
      <h1 className="mb-5 text-xl font-extrabold tracking-tight text-ink-900">
        Tin nhắn liên hệ ({messages.length})
      </h1>

      {messages.length === 0 ? (
        <p className="rounded-xl border border-dashed border-stone-300 px-6 py-12 text-center text-sm text-stone-600">
          Chưa có tin nhắn nào.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className="rounded-xl border border-stone-200 bg-white p-4"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-bold text-ink-900">{message.name}</span>
                <a
                  href={`tel:${message.phone}`}
                  className="text-sm font-semibold text-brand-700 hover:underline"
                >
                  {message.phone}
                </a>
                {message.email && (
                  <a
                    href={`mailto:${message.email}`}
                    className="break-all text-sm text-stone-600 hover:underline"
                  >
                    {message.email}
                  </a>
                )}
                <span className="ml-auto text-xs text-stone-500">
                  {formatSentAt(message.createdAt)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                {message.message}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
