# KẾ HOẠCH: Claude Code Project Structure — Web Shop Bán Diều Cánh Cốc

> ## ⚠️ TÀI LIỆU LỊCH SỬ — ĐỪNG LÀM THEO
>
> Đây là bản kế hoạch ngày đầu (dán vào Claude Code để scaffold dự án). Giữ lại làm sử liệu.
> **Hai chỗ đã sai so với thực tế:**
>
> 1. **Không còn thanh toán.** Dự án bỏ hẳn Stripe / giỏ hàng / checkout ngày 2026-07-27.
>    Web chỉ trưng bày, khách chốt đơn qua Zalo. Mục nói về `payment.ts`, Stripe CLI,
>    skill `payment-checkout` (đã xoá) đều không còn đúng.
> 2. **Bản `CLAUDE.md` chép trong §3 đã cũ.** Bản đang dùng là `/CLAUDE.md` ở gốc repo.
>
> Nguồn đúng: `CLAUDE.md` (gốc repo) và [architecture.md](architecture.md).

---

## 0. Chiến lược: LOCAL trước, ONLINE sau — nền Supabase

- **Giai đoạn 1 — Local (làm trước):** code + test toàn bộ MVP trên máy bằng
  Supabase local (chạy trong Docker qua Supabase CLI). Không tốn tiền, sai thoải mái.
- **Giai đoạn 2 — Deploy (làm sau):** khi MVP ổn → đẩy lên **Vercel + Supabase cloud**.
- **AWS để dành cho lớp DE về sau** (warehouse + pipeline), KHÔNG dùng để host shop.

**Vì sao Supabase:** là Postgres thật (SQL) → map thẳng sang warehouse+dbt cho câu
chuyện Data Engineer; có **pgvector** sẵn trong DB → sau này làm RAG/vector search
ngay trong cùng database, khỏi dựng vector DB riêng; auth Google + storage dựng sẵn.

**Nguyên tắc thiết kế xuyên suốt:** mọi call ra dịch vụ ngoài (DB, storage, payment,
auth) gói sau lớp `src/lib/` → sau này đổi hạ tầng chỉ thay adapter, không viết lại tính năng.

---

## 1. Bối cảnh dự án (cho Claude Code hiểu)

- **What:** web e-commerce bán diều cánh cốc, portfolio project để show kỹ năng AI + DE.
- **MVP (Giai đoạn 1):** đăng nhập admin có phân quyền (admin/user), đăng nhập user
  bằng Google, hiển thị sản phẩm (ảnh/mô tả/giá), giỏ hàng, thanh toán, thông tin liên hệ.
- **Giai đoạn sau:**
  - AI: RAG chatbot + semantic search bằng **pgvector trong chính Supabase Postgres**; gợi ý sản phẩm.
  - DE: clickstream → ELT sang warehouse → dbt → dashboard (đây là chỗ để AWS lên tiếng).

### Stack — Giai đoạn 1 (Local) → Giai đoạn 2 (Online)

| Lớp | Giai đoạn 1 (Local) | Giai đoạn 2 (Online) |
|---|---|---|
| Frontend | Next.js (App Router) + TS + Tailwind | Vercel |
| Backend | Next.js API routes / Server Actions | Vercel |
| Auth | Supabase Auth + Google (local) | Supabase cloud |
| DB | Supabase Postgres (local, Docker) | Supabase cloud Postgres |
| Vector (AI sau) | pgvector trong cùng DB | y hệt |
| Lưu ảnh | Supabase Storage (local) | Supabase Storage |
| Payment | Stripe **test mode** + Stripe CLI | Stripe live / VNPay (đổi key) |
| Chạy | `supabase start` + `npm run dev` | deploy Vercel |

---

## 2. Cây thư mục mục tiêu

```
kite-shop/
├── CLAUDE.md                  # Hiến pháp dự án — load mỗi session
├── .claudeignore              # File Claude KHÔNG được đọc
├── .claude/
│   ├── settings.json          # Quyền tool + hooks
│   └── skills/
│       ├── product-card/SKILL.md
│       ├── api-route/SKILL.md
│       ├── auth-rls/SKILL.md
│       └── payment-checkout/SKILL.md
├── docs/
│   ├── architecture.md
│   └── deploy.md              # để trống ở GĐ1, viết khi sang GĐ2
├── supabase/                  # do Supabase CLI tạo: migrations, config
│   └── migrations/
├── src/
│   ├── app/                   # Next.js App Router
│   ├── components/
│   └── lib/                   # LỚP ĐỔI ĐƯỢC
│       ├── supabase.ts        # client (auth + db + storage)
│       ├── storage.ts         # wrap Supabase Storage
│       └── payment.ts         # Stripe test giờ → live/VNPay sau
├── .env.example               # Mẫu biến môi trường (KHÔNG chứa secret thật)
└── package.json
```

---

## 3. `CLAUDE.md` — hiến pháp dự án (GIỮ DƯỚI 200 DÒNG, link ra `docs/`)

```markdown
# Kite Shop — Diều Cánh Cốc E-commerce

## Project Overview
Web bán diều cánh cốc. Đang ở GIAI ĐOẠN 1: build + test LOCAL (Supabase local),
chưa deploy. MVP: auth (admin/user + Google), sản phẩm, giỏ hàng, checkout, liên hệ.

## Tech Stack
- Next.js (App Router) + TypeScript + Tailwind
- Supabase: Auth (Google), Postgres, Storage — chạy local qua Supabase CLI (Docker)
- Phân quyền: Postgres RLS (Row Level Security) + field role. pgvector để dành cho AI sau.
- Payment: Stripe Checkout TEST mode, webhook qua Stripe CLI.

## Architecture Decisions
- LOCAL-FIRST bằng `supabase start`. Chi tiết: docs/architecture.md
- Mọi call ra ngoài (db/auth/storage/payment) gói trong src/lib/ để đổi hạ tầng
  chỉ thay adapter, không sửa tính năng.
- Phân quyền CHECK Ở BACKEND (RLS + kiểm ở API/Server Action); frontend chỉ ẩn UI.
- Payment theo hosted checkout: app KHÔNG bao giờ thấy số thẻ.

## Coding Standards
- TypeScript strict. Component: PascalCase (.tsx). Util: kebab-case (.ts).
- Không any trừ khi có // TODO giải thích.
- Mọi truy cập DB qua client trong src/lib/supabase.ts, không rải rác trong component.

## Key Commands
- Supabase local:  supabase start   (dừng: supabase stop)
- Migration:       supabase migration new <ten> ; supabase db reset
- Dev:             npm run dev
- Webhook:         stripe listen --forward-to localhost:3000/api/webhooks/stripe
- Lint:            npm run lint
- Typecheck:       npm run typecheck
- Test:            npm run test

## How To Test
- Unit: Vitest — npm run test
- Trước khi commit: npm run lint && npm run typecheck && npm run test
- Smoke test tay: đăng nhập Google → thêm giỏ → checkout Stripe test (thẻ 4242 4242 4242 4242).

## NEVER DO (bất biến)
- KHÔNG tự nhận/lưu số thẻ, CVV. Chỉ dùng hosted checkout.
- KHÔNG commit secret (.env, Google/Stripe/Supabase keys). Dùng .env + .claudeignore.
- KHÔNG dựa RLS rồi bỏ kiểm quyền ở API — kiểm CẢ HAI cho route admin.
- KHÔNG hard-delete dữ liệu thật trong lúc dev (đừng chạy supabase db reset trên data cần giữ).

## Commit Conventions
- Conventional Commits: feat:, fix:, chore:, docs:, refactor:
- Commit nhỏ, một mục đích mỗi commit.
```

---

## 4. `.claude/settings.json` — quyền tool + hooks

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run *)",
      "Bash(npm install *)",
      "Bash(supabase *)",
      "Bash(git status)",
      "Bash(git add *)",
      "Bash(git commit *)",
      "Bash(git diff *)"
    ],
    "deny": [
      "Bash(rm -rf *)",
      "Bash(supabase db reset*)",
      "Read(./.env)",
      "Read(./.env.*)"
    ]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "npm run lint --silent || true" }
        ]
      }
    ]
  }
}
```

> Cho phép lệnh npm/supabase/git; chặn lệnh xóa nguy hiểm, chặn `supabase db reset`
> (xóa sạch DB local), chặn đọc `.env`; tự lint sau mỗi lần Claude sửa file.

---

## 5. `.claude/skills/` — mỗi skill là MỘT năng lực gọn

- **product-card/** — render card sản phẩm (ảnh qua Supabase Storage, giá format VND,
  nút thêm giỏ, trạng thái hết hàng).
- **api-route/** — khuôn 1 API route: validate input (zod) → check auth/role →
  gọi src/lib → trả lỗi thống nhất `{ error: { code, message } }`.
- **auth-rls/** — pattern RLS trong Supabase: viết policy cho bảng sao cho user chỉ
  thấy dữ liệu của mình, admin thấy tất; nhắc kiểm quyền LẠI ở API cho thao tác admin.
- **payment-checkout/** — "tạo đơn → redirect Stripe Checkout → nhận webhook", kèm
  checklist bảo mật: verify chữ ký webhook, idempotency, không tin số tiền từ client.

*Giai đoạn sau thêm:* `rag-pgvector/`, `recommendation/`, `dbt-model/`, `clickstream-event/`.

Khung một `SKILL.md`:
```markdown
---
name: api-route
description: Khuôn viết một Next.js API route chuẩn cho dự án này
---
Khi tạo API route mới, luôn theo thứ tự:
1. Validate input bằng zod schema
2. Xác thực user + kiểm role (admin/user) — TỪ CHỐI nếu thiếu quyền
3. Gọi hàm trong src/lib/ (không viết logic DB thẳng trong route)
4. Trả lỗi theo format { error: { code, message } }
Ví dụ: [dán 1 route mẫu vào đây]
```

---

## 6. `.claudeignore` — file Claude KHÔNG đọc

```
node_modules/
.next/
build/
dist/
.env
.env.*
*.pem
*.key
supabase/.temp/
coverage/
*.mp4
```

---

## 7. Thứ tự Claude đọc (priority hierarchy)

1. `CLAUDE.md` — đọc đầu tiên mỗi session, "hiến pháp".
2. `.claude/settings.json` — quyết định Claude ĐƯỢC LÀM gì.
3. `.claude/skills/` — nạp theo yêu cầu / khi khớp description.
4. `.claudeignore` — danh sách cấm đọc.
5. `~/.claude/memory/` — preference cá nhân (KHÔNG để trong repo).
6. Code trong repo — đọc khi cần.

---

## 8. Checklist 7 anti-pattern PHẢI né

- [ ] Có `CLAUDE.md` (đừng để Claude khởi động từ số 0).
- [ ] `CLAUDE.md` dưới 200 dòng, phần dài link ra `docs/`.
- [ ] Không có secret trong `CLAUDE.md` — dùng `.env` + `.claudeignore`.
- [ ] Có `.claudeignore` (đừng để Claude đọc node_modules/build).
- [ ] Không có chỉ dẫn mâu thuẫn giữa `CLAUDE.md` và `settings.json`.
- [ ] Đã ghi rõ lệnh test (để Claude tự kiểm được thay đổi của nó).
- [ ] Preference cá nhân để ở global, KHÔNG nhét vào `CLAUDE.md` của repo.

---

## 9. "Xong Giai đoạn 1" nghĩa là gì (mốc để bắt đầu tính chuyện online)

- [ ] Đăng nhập Google chạy (Supabase Auth), tạo được user với role mặc định.
- [ ] Có admin, và RLS + API chặn user thường khỏi thao tác admin (test thật).
- [ ] Xem danh sách sản phẩm + chi tiết (ảnh Supabase Storage/mô tả/giá) từ DB.
- [ ] Thêm/sửa/xóa sản phẩm ở trang admin.
- [ ] Giỏ hàng cộng/trừ/xóa đúng.
- [ ] Checkout Stripe test đi trọn vòng: tạo đơn → thanh toán → webhook cập nhật đơn "paid".
- [ ] Trang liên hệ + thông tin shop.
- [ ] `npm run lint && npm run typecheck && npm run test` xanh hết.

Đủ hết mới mở `docs/deploy.md` và deploy lên Vercel + Supabase cloud.

---

## Phụ lục A. Setup skill global (CHẠY MỘT LẦN — KHÔNG thuộc repo)

> ⚠️ KHÔNG đưa vào `CLAUDE.md` của repo. Đây là preference cá nhân cho MỌI project
> → phải nằm ở config global. Nhét vào repo là phạm anti-pattern "trộn project + personal prefs".

Hai skill global đang có: `design-taste-frontend`, `find-skills`.
Thêm mục sau vào **`~/.claude/CLAUDE.md`** (file cấp user, đọc đầu mỗi session —
KHÁC với `CLAUDE.md` của repo):

```markdown
## Skill usage (global)
- Khi làm việc frontend/UI (layout, style, component, màu, typography),
  LUÔN dùng skill design-taste-frontend trước khi viết code.
- Ở đầu mỗi task code mới, chạy find-skills để kiểm skill khớp ngữ cảnh.
```

Kiểm sau khi thêm:
- Mở SKILL.md của cả hai: `description` phải rõ ngữ cảnh kích hoạt (mơ hồ → auto-invoke hay hụt).
- Nếu có `disable-model-invocation: true` thì skill CHỈ chạy khi gõ tay → cân nhắc bỏ.
- Ca quan trọng: cứ gõ thẳng `/design-taste-frontend`, đừng phó mặc auto-invoke.

---

### Nôm na
Nền chọn là Supabase: Postgres thật nên vừa dễ ship (auth Google + storage sẵn) vừa
giữ đúng tín hiệu Data Engineer, lại có pgvector để sau này làm RAG/vector search ngay
trong cùng DB. Chặng 1 dựng + test toàn bộ trên máy bằng `supabase start` (Docker),
chưa tốn đồng nào; chặng 2 đẩy lên Vercel + Supabase cloud. AWS để dành cho lớp DE
(warehouse) về sau, không dùng host shop. Mọi call ra ngoài đã gói trong src/lib/ nên
đổi hạ tầng chỉ thay adapter. Dán file vào Claude Code, bảo nó scaffold GIAI ĐOẠN 1 trước.
