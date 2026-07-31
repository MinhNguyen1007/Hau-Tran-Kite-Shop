import { describe, expect, it } from 'vitest'
import { formatVnd } from './format'
import {
  addItem,
  hasItem,
  mergeWishlists,
  parseStored,
  reconcileForUser,
  removeItem,
  toWishlistItem,
  wishlistCount,
  type Wishlist,
} from './wishlist'

const dieu = {
  productId: 'p1',
  slug: 'dieu-canh-coc-lon',
  name: 'Diều cánh cốc lớn',
  priceText: '450.000 ₫',
  imagePath: null,
}

const sao = {
  productId: 'p2',
  slug: 'sao-dieu-tre',
  name: 'Sáo diều tre',
  priceText: '120.000 ₫',
  imagePath: 'kites/sao.webp',
}

describe('addItem', () => {
  it('thêm sản phẩm mới thành dòng mới', () => {
    const list = addItem([], dieu)
    expect(list).toHaveLength(1)
    expect(list[0].productId).toBe('p1')
  })

  it('thích lại thứ đã thích thì KHÔNG nhân đôi dòng', () => {
    const list = addItem(addItem([], dieu), dieu)
    expect(list).toHaveLength(1)
  })

  it('giữ nguyên addedAt cũ khi thích lại — đó là lúc khách ưng thật', () => {
    const list = addItem(addItem([], dieu, '2026-01-01T00:00:00.000Z'), dieu, '2026-07-27T00:00:00.000Z')
    expect(list[0].addedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('làm mới snapshot tên/giá khi thích lại', () => {
    const list = addItem(addItem([], dieu), { ...dieu, priceText: '500.000 ₫' })
    expect(list[0].priceText).toBe('500.000 ₫')
  })

  it('xếp mới nhất lên đầu', () => {
    const list = addItem(addItem([], dieu, '2026-01-01T00:00:00.000Z'), sao, '2026-07-27T00:00:00.000Z')
    expect(list.map((item) => item.productId)).toEqual(['p2', 'p1'])
  })

  it('không sửa mảng cũ', () => {
    const before: Wishlist = []
    addItem(before, dieu)
    expect(before).toHaveLength(0)
  })
})

describe('removeItem và hasItem', () => {
  it('chỉ xoá đúng dòng được chỉ định', () => {
    const list = removeItem(addItem(addItem([], dieu), sao), 'p1')
    expect(list).toHaveLength(1)
    expect(list[0].productId).toBe('p2')
  })

  it('hasItem phân biệt có và không', () => {
    const list = addItem([], dieu)
    expect(hasItem(list, 'p1')).toBe(true)
    expect(hasItem(list, 'p2')).toBe(false)
  })

  it('đếm theo số dòng — không còn khái niệm số lượng', () => {
    expect(wishlistCount(addItem(addItem([], dieu), sao))).toBe(2)
    expect(wishlistCount([])).toBe(0)
  })
})

describe('mergeWishlists', () => {
  it('hợp hai bên, không trùng dòng', () => {
    const local = addItem([], dieu, '2026-07-01T00:00:00.000Z')
    const remote = addItem([], sao, '2026-07-02T00:00:00.000Z')
    const merged = mergeWishlists(local, remote)
    expect(merged.map((item) => item.productId).sort()).toEqual(['p1', 'p2'])
  })

  it('trùng productId thì giữ addedAt SỚM HƠN', () => {
    const local = addItem([], dieu, '2026-01-01T00:00:00.000Z')
    const remote = addItem([], dieu, '2026-07-01T00:00:00.000Z')
    const merged = mergeWishlists(local, remote)
    expect(merged).toHaveLength(1)
    expect(merged[0].addedAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('trùng productId thì lấy snapshot của DB (đáng tin hơn localStorage cũ)', () => {
    const local = addItem([], { ...dieu, priceText: 'giá cũ' }, '2026-01-01T00:00:00.000Z')
    const remote = addItem([], { ...dieu, priceText: '3 triệu – 5 triệu' }, '2026-07-01T00:00:00.000Z')
    expect(mergeWishlists(local, remote)[0].priceText).toBe('3 triệu – 5 triệu')
  })

  it('merge hai lần cho cùng kết quả — đăng nhập lại không nhân bản', () => {
    const local = addItem([], dieu, '2026-01-01T00:00:00.000Z')
    const remote = addItem([], sao, '2026-02-01T00:00:00.000Z')
    const once = mergeWishlists(local, remote)
    expect(mergeWishlists(once, remote)).toEqual(once)
  })
})

// Đọc từng DÒNG trong localStorage. Đi qua parseStored vì đó là cửa duy nhất vào,
// và nó phải nuốt được cả bản mảng trần lẫn bản có ownerId.
describe('parseStored — đọc dòng', () => {
  const items = (raw: string) => parseStored(raw).items

  it('bỏ dòng sai cấu trúc, giữ dòng hợp lệ', () => {
    const raw = JSON.stringify([
      { ...dieu, addedAt: '2026-07-01T00:00:00.000Z' },
      { productId: 'p3' },
      null,
    ])
    expect(items(raw)).toHaveLength(1)
    expect(items(raw)[0].productId).toBe('p1')
  })

  it('bỏ dòng thiếu addedAt — không xếp thứ tự được thì coi như hỏng', () => {
    expect(items(JSON.stringify([dieu]))).toEqual([])
  })

  // Dòng lưu trước 2026-07-27 mang `priceVnd` dạng SỐ (và có cả `stock`). Đổi schema mà xoá
  // sạch danh sách của khách là mất dữ liệu thật, nên phải đọc được cả bản cũ.
  it('vẫn đọc được dòng lưu theo schema cũ và dựng lại chuỗi giá từ priceVnd', () => {
    const legacy = {
      productId: 'p1',
      slug: 'dieu-canh-coc-lon',
      name: 'Diều cánh cốc lớn',
      priceVnd: 450_000,
      imagePath: null,
      stock: 3,
      addedAt: '2026-07-01T00:00:00.000Z',
    }
    const list = items(JSON.stringify([legacy]))
    expect(list).toHaveLength(1)
    expect(list[0].priceText).toBe(formatVnd(450_000))
  })

  it('dòng cũ không có giá nào thì priceText rỗng, không phải undefined', () => {
    const legacy = {
      productId: 'p1',
      slug: 'dieu-nho',
      name: 'Diều nhỏ',
      imagePath: null,
      addedAt: '2026-07-01T00:00:00.000Z',
    }
    expect(items(JSON.stringify([legacy]))[0].priceText).toBe('')
  })
})

describe('parseStored', () => {
  const line = { ...dieu, addedAt: '2026-07-01T00:00:00.000Z' }

  it('đọc được bản có dấu chủ sở hữu', () => {
    const stored = parseStored(JSON.stringify({ ownerId: 'u1', items: [line] }))
    expect(stored.ownerId).toBe('u1')
    expect(stored.items).toHaveLength(1)
  })

  // Bản trước 2026-07-31 lưu thẳng mảng. Từ chối nó là xoá danh sách thật của khách vãng lai.
  it('đọc được bản cũ (mảng trần) và coi là của khách vãng lai', () => {
    const stored = parseStored(JSON.stringify([line]))
    expect(stored.ownerId).toBeNull()
    expect(stored.items).toHaveLength(1)
  })

  it('localStorage trống hoặc JSON hỏng thì trả về danh sách rỗng vô chủ', () => {
    expect(parseStored(null)).toEqual({ ownerId: null, items: [] })
    expect(parseStored('{khong-phai-json')).toEqual({ ownerId: null, items: [] })
  })

  it('ownerId sai kiểu thì coi như vô chủ, không vỡ', () => {
    expect(parseStored(JSON.stringify({ ownerId: 42, items: [line] })).ownerId).toBeNull()
  })
})

describe('reconcileForUser', () => {
  const local = addItem([], dieu, '2026-07-01T00:00:00.000Z')
  const remote = addItem([], sao, '2026-07-02T00:00:00.000Z')

  // Bài test quan trọng nhất file này. Không có luật này thì tài khoản mới nào đăng nhập trên
  // máy đã dùng cũng thấy sẵn một mẫu diều "đang thích", và nó bị đẩy luôn lên DB của họ.
  it('VỨT bản local khi nó mang dấu của tài khoản khác', () => {
    expect(reconcileForUser({ ownerId: 'u1', items: local }, remote, 'u2')).toEqual(remote)
  })

  it('merge khi danh sách local chưa thuộc về ai — khách vãng lai vừa đăng nhập', () => {
    const items = reconcileForUser({ ownerId: null, items: local }, remote, 'u2')
    expect(items.map((item) => item.productId).sort()).toEqual(['p1', 'p2'])
  })

  it('merge khi vẫn đúng tài khoản đó — mở lại tab, đổi máy', () => {
    const items = reconcileForUser({ ownerId: 'u1', items: local }, remote, 'u1')
    expect(items.map((item) => item.productId).sort()).toEqual(['p1', 'p2'])
  })

  it('tài khoản khác mà DB rỗng thì ra rỗng, không rơi về bản local', () => {
    expect(reconcileForUser({ ownerId: 'u1', items: local }, [], 'u2')).toEqual([])
  })
})

describe('toWishlistItem', () => {
  const base = {
    id: 'p9',
    slug: 'dieu-nho',
    name: 'Diều nhỏ',
    priceText: '3 triệu – 5 triệu',
    imagePath: null,
  }

  it('chép lại chuỗi giá khi shop có công khai giá', () => {
    const item = toWishlistItem({ ...base, showPrice: true })
    expect(item.productId).toBe('p9')
    expect(item.priceText).toBe('3 triệu – 5 triệu')
  })

  // Danh sách yêu thích không được lộ giá mà trang sản phẩm đang giấu.
  it('bỏ trống giá khi shop tắt hiện giá', () => {
    expect(toWishlistItem({ ...base, showPrice: false }).priceText).toBe('')
  })
})
