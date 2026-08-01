// Test cho tầng đọc/ghi bảng `wishlists` phía client.
//
// Vì sao phải mock Supabase ở đây trong khi mọi test khác của dự án đều là hàm thuần: lỗi cần
// canh KHÔNG nằm ở phép biến đổi dữ liệu mà ở CÂU TRUY VẤN — thiếu một bộ lọc. Đo bằng dữ liệu
// vào/ra không thấy được, phải nhìn thẳng vào chuỗi gọi mà file dựng lên.
import { beforeEach, describe, expect, it, vi } from 'vitest'

const createBrowserSupabase = vi.fn()
vi.mock('./supabase-browser', () => ({ createBrowserSupabase: () => createBrowserSupabase() }))

const { addRemote, fetchRemoteWishlist, removeRemote } = await import('./wishlist-remote')

const TOI = 'toi-uid'
const NGUOI_KHAC = 'nguoi-khac-uid'

function dongDb(userId: string) {
  return {
    product_id: 'p1',
    created_at: '2026-07-31T15:32:43.558+00:00',
    user_id: userId,
    products: {
      slug: 'dieu-canh-coc',
      name: 'Diều cánh cốc',
      price_text: '3 triệu - 5 triệu',
      show_price: true,
      image_path: 'kites/a.jpg',
    },
  }
}

type CauHinhGia = {
  session?: { user: { id: string } } | null
  rows?: unknown[]
  error?: { message: string } | null
}

// Giả lập đủ phần supabase-js mà file dùng, đồng thời GHI LẠI mọi .eq() đã gọi để test soi được.
function dungClient({ session = { user: { id: TOI } }, rows = [], error = null }: CauHinhGia = {}) {
  const eqCalls: [string, string][] = []
  const builder = {
    eq(cot: string, gia: string) {
      eqCalls.push([cot, gia])
      return builder
    },
    then(resolve: (value: { data: unknown; error: unknown }) => unknown) {
      return Promise.resolve(resolve({ data: rows, error }))
    },
  }
  const client = {
    auth: { getSession: async () => ({ data: { session } }) },
    from: () => ({
      select: () => builder,
      delete: () => builder,
      upsert: vi.fn(async () => ({ error: null })),
    }),
  }
  return { client, eqCalls }
}

beforeEach(() => {
  createBrowserSupabase.mockReset()
})

describe('fetchRemoteWishlist', () => {
  it('lọc theo user_id của người đang đăng nhập', async () => {
    const { client, eqCalls } = dungClient({ rows: [dongDb(TOI)] })
    createBrowserSupabase.mockReturnValue(client)

    await fetchRemoteWishlist()

    expect(eqCalls).toContainEqual(['user_id', TOI])
  })

  // Đây là lỗi đã dính thật trên production 2026-08-01: policy `wishlists_select` cho admin đọc
  // dòng của mọi người, nên tài khoản admin/owner nhận về danh sách của KHÁCH KHÁC và tưởng là
  // của mình. Hậu quả nặng hơn hiện nhầm: syncWithRemote thấy mẫu "đã có trên DB" nên tim của
  // chính admin không bao giờ được đẩy lên, và bỏ tim thì lần sync sau nó quay lại.
  it('KHÔNG nhận dòng của tài khoản khác dù RLS cho admin đọc được', async () => {
    const { client, eqCalls } = dungClient({ rows: [dongDb(NGUOI_KHAC)] })
    createBrowserSupabase.mockReturnValue(client)

    await fetchRemoteWishlist()

    // Bộ lọc phải nằm trong CÂU TRUY VẤN, không phải lọc lại sau khi đã tải về: dòng người khác
    // không được rời khỏi Postgres ngay từ đầu.
    expect(eqCalls).toContainEqual(['user_id', TOI])
  })

  it('chưa đăng nhập thì trả null, không đụng bảng', async () => {
    const { client } = dungClient({ session: null })
    createBrowserSupabase.mockReturnValue(client)

    expect(await fetchRemoteWishlist()).toBeNull()
  })

  it('đọc DB hỏng trả items = null chứ không phải mảng rỗng', async () => {
    const { client } = dungClient({ error: { message: 'toang' } })
    createBrowserSupabase.mockReturnValue(client)

    expect(await fetchRemoteWishlist()).toEqual({ userId: TOI, items: null })
  })

  it('bỏ dòng có products = null (mẫu đã bị gỡ) thay vì hiện ô trống', async () => {
    const { client } = dungClient({ rows: [{ ...dongDb(TOI), products: null }] })
    createBrowserSupabase.mockReturnValue(client)

    expect(await fetchRemoteWishlist()).toEqual({ userId: TOI, items: [] })
  })

  it('shop tắt hiện giá thì không mang giá về, để bản DB giống hệt bản local', async () => {
    const row = dongDb(TOI)
    row.products.show_price = false
    const { client } = dungClient({ rows: [row] })
    createBrowserSupabase.mockReturnValue(client)

    const ket = await fetchRemoteWishlist()
    expect(ket?.items?.[0].priceText).toBe('')
  })
})

describe('removeRemote', () => {
  it('lọc cả user_id lẫn product_id', async () => {
    const { client, eqCalls } = dungClient()
    createBrowserSupabase.mockReturnValue(client)

    await removeRemote('p1')

    expect(eqCalls).toEqual([
      ['user_id', TOI],
      ['product_id', 'p1'],
    ])
  })
})

describe('addRemote', () => {
  it('danh sách rỗng thì không gọi Supabase', async () => {
    await addRemote([])
    expect(createBrowserSupabase).not.toHaveBeenCalled()
  })
})
