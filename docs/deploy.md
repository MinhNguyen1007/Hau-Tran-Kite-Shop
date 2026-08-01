# Deploy — Giai đoạn 2

Đích: web chạy online trên **Vercel + Supabase cloud**, khách đăng nhập bằng **Google**.

Thứ tự dưới đây có lý do: Google OAuth cần biết URL của Supabase cloud, Supabase cloud cần
biết domain Vercel. Làm ngược thì phải quay lại sửa hai ba lần.

```
1. Google Cloud   →  lấy Client ID + Secret
2. Supabase cloud →  tạo project, đẩy migration, dán credential Google vào
3. Vercel         →  deploy, lấy domain
4. Quay lại 1 và 2 điền domain Vercel vừa có
5. Kiểm thật
```

Bước 1 làm được ngay ở local (test Google login trước khi deploy). Bước 2–4 cần lần lượt.

---

## 0. Ba tài khoản cần có

| Tài khoản | Đăng ký ở | Ghi chú |
|---|---|---|
| Google Cloud Console | console.cloud.google.com | Dùng chính Gmail đang có. Miễn phí, phần OAuth không cần thẻ. |
| Supabase | supabase.com | Đăng nhập bằng GitHub cho nhanh. Free tier: 1 project. |
| Vercel | vercel.com | Đăng nhập bằng GitHub → tự thấy repo `Hau-Tran-Kite-Shop`. |

> Free tier Supabase **tạm dừng project sau 7 ngày không ai truy cập**. Vào lại Dashboard bấm
> Restore là sống lại, dữ liệu còn nguyên. Biết trước để khỏi tưởng web hỏng.

---

## 1. Google OAuth — lấy Client ID + Secret

### 1.1 Tạo project

console.cloud.google.com → thanh trên cùng bấm hộp chọn project → **New Project**.
Tên gì cũng được (`kite-shop`). Tạo xong nhớ **chọn đúng project đó** ở thanh trên.

### 1.2 Branding (màn hình khách thấy khi bấm đăng nhập)

**APIs & Services → OAuth consent screen** (hoặc **Google Auth Platform → Branding**):

- User Type: **External**
- App name: tên shop — **khách sẽ đọc đúng chữ này** ở màn "… muốn truy cập tài khoản Google của bạn"
- User support email + Developer contact: email của bạn
- Scope: **không thêm gì cả**. Mặc định `email`, `profile`, `openid` là đủ; xin thêm scope
  là tự chuốc vòng xét duyệt của Google.

### 1.3 Test users, và vì sao Publish app là BẮT BUỘC

App mới ở trạng thái **Testing**: chỉ email nằm trong danh sách **Test users** mới đăng nhập
được, tối đa 100. Ai ngoài danh sách bấm vào sẽ thấy "Access blocked".

- **Audience → Test users → Add users**: thêm Gmail của bạn (và của chủ shop).
- **Trước khi mở web cho khách thật, PHẢI bấm `Publish app`.** Không phải việc làm cho đẹp.
  Từ 2026-07-31 đăng ký bằng email đã tắt hẳn, Google là đường DUY NHẤT để khách có tài khoản
  — để app ở Testing nghĩa là **không một khách nào đăng ký được**. Với ba scope cơ bản ở trên,
  Google không bắt verification, publish xong dùng ngay.

### 1.4 Tạo credential

**APIs & Services → Credentials → Create Credentials → OAuth client ID**

- Application type: **Web application**
- **Authorized redirect URIs** — thêm **cả hai** dòng (nút "Add URI"):

  ```
  http://127.0.0.1:55321/auth/v1/callback
  https://<project-ref>.supabase.co/auth/v1/callback
  ```

  - Dòng 1: Supabase **local** (cổng 55321, xem `[api]` trong `supabase/config.toml`).
  - Dòng 2: Supabase **cloud** — chưa có `<project-ref>` thì để đó, làm xong bước 2.1 quay
    lại thêm.
  - URI trỏ vào **Supabase**, không phải vào Next.js. Google → Supabase → mới về
    `/auth/callback` của web. Điền nhầm `localhost:3000` là hỏng.
  - `127.0.0.1` chứ không phải `localhost` — Google **không nhận** `localhost` cho luồng web
    app này.
- **Authorized JavaScript origins**: để trống, luồng này không cần.

Bấm Create → hiện **Client ID** và **Client Secret**. Copy cả hai.

### 1.5 Bật Google ở local

Bỏ hai giá trị vừa copy vào `.env.local` (file này đã nằm trong `.gitignore`, **không commit**):

```
SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID=<client id>
SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET=<client secret>
```

Rồi trong `supabase/config.toml`, khối `[auth.external.google]` đổi `enabled = false` → `true`.

```bash
supabase stop && supabase start   # config.toml chỉ đọc lúc khởi động
npm run dev
```

Vào `http://localhost:3000/dang-nhap` → bấm "Đăng nhập bằng Google".
Đúng thì về `/tai-khoan`, và trong `public.profiles` có dòng mới `role = 'user'`.

**Gặp lỗi thì đọc bảng cuối file.**

---

## 2. Supabase cloud

### 2.1 Tạo project

supabase.com → **New project**.

- Region: **Southeast Asia (Singapore)** — gần VN nhất.
- Database password: **sinh mật khẩu mạnh và lưu lại ngay**, sau không xem lại được.
- Đợi ~2 phút.

Xong thì lấy về (Dashboard → **Project Settings → API**):

| Cần lấy | Ở đâu | Dùng làm gì |
|---|---|---|
| Project URL | `https://<ref>.supabase.co` | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / publishable key | mục API keys | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` / secret key | mục API keys, bấm Reveal | `SUPABASE_SERVICE_ROLE_KEY` |
| Project ref | đoạn `<ref>` trong URL | dùng ở 1.4 và `supabase link` |

> `service_role` **bỏ qua toàn bộ RLS**. Chỉ đặt ở biến môi trường phía server, tuyệt đối
> không để lọt vào biến `NEXT_PUBLIC_*` (Next nhét mọi biến `NEXT_PUBLIC_*` thẳng vào
> bundle trình duyệt — lộ key này là mất sạch quyền kiểm soát dữ liệu).

Có `<project-ref>` rồi → quay lại **bước 1.4** thêm nốt dòng redirect URI thứ hai.

### 2.2 Đẩy schema lên

```bash
supabase login
supabase link --project-ref <project-ref>
supabase db push
```

`db push` chạy toàn bộ migration trong `supabase/migrations/` theo thứ tự — dựng bảng, RLS,
bucket `products` + `avatars`, và các dòng mặc định của `site_settings` / `nav_items` /
`categories`.

Hai điều cần biết:

- **`supabase/seed.sql` KHÔNG chạy trên cloud.** Nó chỉ chạy khi `supabase db reset` ở local.
  Nghĩa là cloud **không có sản phẩm mẫu** — vào `/admin/san-pham` thêm sản phẩm thật.
  (Bản seed hiện tại cũng đã lỗi thời, còn cột `price_vnd`/`stock` đã bỏ.)
- Nội dung trang (tên shop, số Zalo, menu, danh mục) **có sẵn** vì nằm trong migration.
  Nhưng là **giá trị mẫu** — bước 5 phải vào sửa thành thông tin thật.

Kiểm nhanh: Dashboard → **Table Editor**, thấy đủ `profiles`, `products`, `categories`,
`wishlists`, `events`, `site_settings`, `nav_items`.

### 2.3 Bật Google provider trên cloud

Dashboard → **Authentication → Sign In / Providers → Google**:

- Bật **Enable Sign in with Google**
- **Client ID** / **Client Secret**: dán từ bước 1.4 (dùng lại đúng credential đó)
- **Skip nonce check**: **để TẮT**. Nó chỉ cần cho local; bật trên production là tự bỏ một
  lớp chống replay.
- Save.

Ô "Callback URL" mà Dashboard hiện ra phải **khớp y hệt** dòng redirect URI thứ hai đã điền
ở bước 1.4. Lệch một ký tự là Google trả `redirect_uri_mismatch`.

**⚠ ĐỪNG bỏ tick "Allow new users to sign up" trên Dashboard** — cờ đó chặn cả đăng ký
Google, tức là không khách nào có tài khoản được nữa.
Việc chặn đăng ký email do trigger `chan_dang_ky_email` lo (migration
`20260731120000_chi_dang_ky_google.sql`), và `db push` ở bước 2.2 đã mang nó lên cloud rồi —
không phải bật tắt gì thêm.

### 2.4 URL Configuration

Dashboard → **Authentication → URL Configuration**. Chưa có domain Vercel thì **để đó**,
làm xong bước 3 quay lại. Sau khi có:

- **Site URL**: `https://<tên-app>.vercel.app`
- **Redirect URLs** — Add URL, thêm:
  ```
  https://<tên-app>.vercel.app/auth/callback
  https://<tên-app>.vercel.app/**
  ```

Thiếu chỗ này thì đăng nhập Google xong Supabase **từ chối redirect** về web, khách kẹt ở
trang trắng của Supabase.

### 2.5 Dựng chủ shop trên cloud

Tài khoản ở local **không đi theo** `db push` (migration chỉ mang schema, không mang user).
Trên cloud phải dựng lại, và **thứ tự không đảo được** — web chỉ có một cửa đăng nhập là
Google, mà tài khoản Google thì không tạo sẵn bằng script được:

1. Gmail của chủ shop phải nằm trong **Test users** (bước 1.3), hoặc app đã **Publish**.
2. **Chủ shop tự vào `https://<tên-app>.vercel.app/dang-nhap` bấm "Tiếp tục với Google"** một
   lần. Lúc này DB mới có hồ sơ của họ, role mặc định `user`.
3. Nâng lên chủ shop:

```bash
# PowerShell — trỏ tạm env sang cloud rồi chạy script
$env:NEXT_PUBLIC_SUPABASE_URL="https://<ref>.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="<service_role key>"
npm run nang-chu-shop -- <gmail-cua-chu-shop>
```

Script tự hạ chủ cũ xuống `admin` (unique index chỉ cho phép MỘT `owner`). Chạy lại nhiều lần
không sao. Từ đó chủ shop vào `/admin/tai-khoan` tự nâng người khác lên admin phụ được, không
cần chạy script nữa.

### 2.6 Cửa thoát hiểm khi mất đường vào admin

Không còn tài khoản mật khẩu nào. Nếu Google treo app, mất quyền vào Gmail, hoặc lỡ hạ nhầm
chính mình xuống `user` thì **không ai vào được `/admin`**. Đây là đánh đổi có chủ ý của việc
chỉ dùng một nhà cung cấp danh tính, và lối ra là **Supabase Dashboard → SQL Editor**:

```sql
-- Xem ai đang giữ vai gì
select email, role from public.profiles order by role;

-- Trao lại quyền chủ shop. Hạ chủ cũ TRƯỚC, unique index chỉ cho một owner.
update public.profiles set role = 'admin' where role = 'owner';
update public.profiles set role = 'owner' where email = '<email-can-cuu>';
```

Trigger chặn đăng ký không cản lệnh này — nó chỉ chạy lúc INSERT tài khoản mới, không chạy
lúc đổi vai trò. Điều kiện duy nhất: email đó đã từng đăng nhập Google ít nhất một lần.

Ai giữ được mật khẩu Supabase Dashboard thì giữ được toàn bộ web. Bật 2FA cho tài khoản
Supabase, và đừng dùng chung mật khẩu đó với chỗ khác.

---

## 3. Vercel

### 3.1 Build thử ở local trước

```bash
npm run lint && npm run typecheck && npm run test && npm run build
```

Bắt buộc chạy `build`, không bỏ qua: lỗi **client component import nhầm module có
`next/headers`** chỉ lộ ra ở bước này, `npm run dev` chạy ngon lành (xem CLAUDE.md).
Để lỗi đó tới Vercel mới phát hiện là mất thời gian đọc log.

### 3.2 Import repo

vercel.com → **Add New → Project** → chọn `MinhNguyen1007/Hau-Tran-Kite-Shop` → Import.

Framework Next.js Vercel tự nhận. **Không đụng** Build Command / Output Directory.

### 3.3 Environment Variables

Khai **trước khi bấm Deploy** (mục Environment Variables ngay màn import), cả 3 tick đủ
Production + Preview + Development:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key ở bước 2.1 |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key ở bước 2.1 |

Không cần khai `SUPABASE_AUTH_EXTERNAL_GOOGLE_*` — hai biến đó là của **Supabase CLI chạy
local**, trên cloud thì credential Google nằm trong Dashboard (bước 2.3).

> Thiếu `NEXT_PUBLIC_SUPABASE_URL` là **gãy build** kèm câu báo rõ ràng — `next.config.ts`
> cố ý ném lỗi thay vì để web lên sóng với toàn bộ ảnh sản phẩm hỏng.

⚠ Tick đủ cả ba môi trường nghĩa là **Preview cũng trỏ vào DB thật**. Vì thế từ 2026-08-01
`vercel.json` tắt hẳn tự động deploy cho mọi nhánh trừ `master`:

```json
{ "git": { "deploymentEnabled": { "**": false, "master": true } } }
```

Không có preview deploy thì không còn bản web nào chạy bằng dữ liệu thật ngoài production.
Đây là lý do file `vercel.json` tồn tại — JSON không viết chú thích được nên ghi ở đây.
Muốn xem thử trước khi merge thì chạy `npm run dev` ở máy. Nếu về sau thật sự cần preview,
đừng chỉ bật lại dòng trên: phải dựng một project Supabase riêng cho nó trước, không thì
mỗi nhánh đang làm dở lại ghi thẳng vào bảng `events` của production.

### 3.4 Deploy

Bấm Deploy, đợi ~2 phút, lấy domain `https://<tên-app>.vercel.app`.

**Quay lại làm nốt bước 2.4** (Site URL + Redirect URLs) — chưa làm thì Google login trên
production chưa chạy.

Từ giờ mỗi lần `git push` lên `master` là Vercel tự deploy lại.

---

## 4. Kiểm sau khi deploy

Đi hết, đừng bỏ bước nào — đây là dữ liệu thật, sai là lộ thật.

- [ ] Mở trang chủ, ảnh + nội dung hiện đủ.
- [ ] Đăng nhập Google bằng tài khoản **khách thường** → về `/tai-khoan`, `profiles` ghi
      `role = 'user'`.
- [ ] Tài khoản khách đó **KHÔNG** vào được `/admin` (bị đá ra).
- [ ] Gõ thẳng URL `POST` route admin bằng tài khoản khách → trả 403, không phải 200.
      (Đây là kiểm lớp API; RLS là lớp hai.)
- [ ] Đăng nhập chủ shop bằng Google (tài khoản đã nâng ở bước 2.5) → vào thẳng `/admin`.
- [ ] `/admin/san-pham` thêm 1 sản phẩm thật + upload ảnh → ảnh hiện được ở trang khách
      (nếu 400 thì xem lại `NEXT_PUBLIC_SUPABASE_URL` trên Vercel).
- [ ] Chưa đăng nhập → bấm tim → đăng nhập Google → danh sách yêu thích được **merge** lên
      DB, đăng nhập lần hai **không nhân đôi** dòng.
- [ ] Nút Zalo / gọi mở đúng số.
- [ ] Đi một vòng như khách rồi query bảng `events`: đúng chuỗi sự kiện, `session_id` xuyên
      suốt cả trước và sau khi đăng nhập.
- [ ] **`/admin/cai-dat` đổi tên shop / số điện thoại / Zalo / email / địa chỉ sang thông
      tin THẬT** — migration đang để giá trị mẫu.
- [ ] Google Cloud Console → **Publish app** (bước 1.3) nếu muốn khách ngoài danh sách test
      đăng nhập được.

---

## 5. Lỗi hay gặp

| Triệu chứng | Nguyên nhân | Sửa |
|---|---|---|
| `redirect_uri_mismatch` | Redirect URI ở Google Console không khớp callback của Supabase | Đối chiếu từng ký tự với ô Callback URL ở Dashboard (bước 2.3). Nhớ `127.0.0.1` chứ không phải `localhost` cho bản local |
| "Access blocked: app has not completed verification" | Email đăng nhập không nằm trong Test users | Thêm vào Test users, hoặc Publish app (bước 1.3) |
| Đăng nhập xong kẹt ở trang Supabase, không về web | Thiếu Redirect URLs | Bước 2.4 |
| Về `/dang-nhap?loi=ma-khong-hop-le` | Code PKCE hết hạn hoặc đã dùng | Bấm đăng nhập lại. Lặp lại mãi thì kiểm cookie có bị chặn không |
| Nút Google báo "Chưa bật đăng nhập Google" | Local: chưa `enabled = true` hoặc chưa restart. Cloud: chưa bật provider | Bước 1.5 / 2.3 |
| Ảnh sản phẩm 400 trên production | `NEXT_PUBLIC_SUPABASE_URL` trên Vercel sai/thiếu | Sửa env rồi **Redeploy** (đổi env không tự build lại) |
| Build Vercel gãy, log nhắc `next/headers` | Client component import module server-only | Chạy `npm run build` ở local để tìm, xem CLAUDE.md |
| PostgREST trả 42501 dù RLS đúng | Bảng mới chưa `GRANT` cho `anon`/`authenticated` | Thêm GRANT vào migration rồi `db push` lại |
| Web đột nhiên không vào được sau vài ngày | Free tier Supabase tạm dừng project | Dashboard → Restore |
| Workflow sao lưu đỏ: `pg_dumpall: error: … password authentication failed for user "postgres"` | Sai mật khẩu trong secret `SUPABASE_DB_URL` | **Đừng đi tìm lỗi ở tên user.** Supavisor luôn báo `user "postgres"` kể cả khi chuỗi ghi đúng `postgres.<ref>` — đo 2026-08-01 bằng cách thử mật khẩu sai cố ý. Không nhớ mật khẩu thì Dashboard → Database Settings → **Reset database password** rồi khai lại secret; reset không làm hỏng gì khác vì web dùng anon key và CLI dùng access token, không cái nào cần mật khẩu này |

---

## 6. Vận hành: CI, sao lưu, rollback

Bốn workflow trong `.github/workflows/`. Repo public nên GitHub Actions không tính phút, chạy
bao nhiêu cũng miễn phí.

| Workflow | Chạy khi nào | Làm gì |
|---|---|---|
| `ci.yml` | mỗi push (mọi nhánh), mỗi PR vào `master` | `lint` → `typecheck` → `test` → `build` |
| `kiem-migration.yml` | push/PR có đụng `supabase/**` | Dựng DB trắng, áp toàn bộ migration + `seed.sql`, rồi soi lại schema |
| `giu-web-song.yml` | 6 tiếng/lần | Ping web production + hỏi Supabase một câu truy vấn thật |
| `sao-luu-db.yml` | 01:30 giờ VN mỗi ngày | `pg_dump` toàn bộ DB, mã hoá GPG, giữ artifact 30 ngày |

`kiem-migration.yml` không chỉ kiểm "migration có chạy được không" — nó còn khẳng định những
thứ **đã bỏ có chủ ý** (bảng `orders`, `contact_messages`, `content_blocks`, `product_sizes`,
cột `stock`/`price_vnd`) vẫn đang biến mất. Ai vô tình dựng lại chúng sẽ thấy CI đỏ kèm câu
giải thích, thay vì phải nhớ hết mục NEVER DO trong CLAUDE.md.

### 6.1 Vì sao phải đi qua Pull Request

Vercel bắt đầu deploy **ngay khi nhận push**, chạy song song với GitHub Actions chứ không đợi
kết quả. Nghĩa là push thẳng `master` thì **CI đỏ mà bản hỏng vẫn lên sóng** — Actions chỉ kịp
gửi mail báo sau khi chuyện đã rồi.

Chỗ duy nhất chặn được là chặn ở GitHub, trước khi commit kịp nằm trên `master`. Vì thế
`master` bật **branch protection**: Settings → Branches → Add branch ruleset cho `master`,
tick *Require a pull request before merging* và *Require status checks to pass* → chọn check
`Lint, typecheck, test, build`.

Cách làm việc từ đó:

```bash
git switch -c sua-abc          # làm việc trên nhánh, không đụng master
git push -u origin sua-abc     # CI chạy trên nhánh này
# CI xanh → mở Pull Request trên GitHub → Merge → lúc này Vercel mới deploy production
```

Nhánh không sinh preview deploy nữa (xem 3.3), nên đẩy nhánh lên chỉ tốn CI chứ không đụng
gì tới web thật.

### 6.2 Secret và variable cần khai

Khai ở **Settings → Secrets and variables → Actions**.

| Tên | Loại | Workflow dùng | Lấy ở đâu |
|---|---|---|---|
| `SUPABASE_URL` | secret | `giu-web-song` | Dashboard → Project Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | secret | `giu-web-song` | cùng chỗ, khoá `anon` / publishable |
| `SUPABASE_DB_URL` | secret | `sao-luu-db` | Dashboard → **Connect** → thẻ **Direct** → Connection Method → **Session pooler** |
| `BACKUP_PASSPHRASE` | secret | `sao-luu-db` | Tự đặt. Lưu ở chỗ KHÁC GitHub |
| `SITE_URL` | variable | `giu-web-song` | Domain Vercel. Chỉ cần khai khi đổi domain |

Chưa khai thì hai workflow đó **không đỏ** — chúng bỏ qua phần cần secret kèm một cảnh báo
vàng. Cố ý làm vậy: một job đỏ mỗi ngày sẽ nhanh chóng bị ngó lơ, rồi lúc hỏng thật cũng
không ai buồn mở ra xem.

> ⚠ `SUPABASE_DB_URL` **phải là chuỗi "Session pooler"**, đừng lấy "Direct connection". Kết nối
> trực tiếp `db.<ref>.supabase.co` chỉ có địa chỉ IPv6, mà runner của GitHub chỉ có IPv4 —
> nối thẳng là treo tới lúc timeout, log không nói gì về nguyên nhân. Chính Supabase cũng mô tả
> Session pooler là *"alternative to direct connection when connecting via an IPv4 network"*.
> Mật khẩu có ký tự đặc biệt thì phải percent-encode (`@` → `%40`, `#` → `%23`).
>
> Nhận dạng nhanh: chuỗi đúng có host `...pooler.supabase.com` và cổng **5432**. Thấy cổng
> **6543** là đang cầm nhầm Transaction pooler — `pg_dump` không chạy được ở chế độ đó.
> Chuỗi của project hiện tại:
> `postgresql://postgres.qwxnggbdcyoomogniswg:[MẬT-KHẨU]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`

> ⚠ Mất `BACKUP_PASSPHRASE` là **mất toàn bộ bản sao lưu**, không có đường mở lại. Đây là mã
> hoá đối xứng, không có khoá dự phòng nào cả.

### 6.3 Mở một bản sao lưu

Actions → `Sao lưu database` → chọn lượt chạy → tải artifact `sao-luu-<id>`.

```bash
gpg --decrypt --batch --passphrase '<BACKUP_PASSPHRASE>' -o sao-luu.tar.gz sao-luu.tar.gz.gpg
tar -xzf sao-luu.tar.gz        # ra roles.sql, schema.sql, data.sql
```

Khôi phục **vào một project TRỐNG** (đừng đổ đè lên DB đang có dữ liệu — `data.sql` không xoá
gì trước khi chèn, chỉ chồng thêm và đụng khoá chính):

```bash
psql "$DB_URL" -f roles.sql
psql "$DB_URL" -f schema.sql
psql "$DB_URL" -f data.sql
```

Chỉ cần cứu một bảng thì mở `data.sql` tìm khối `COPY public.<tên bảng>` và chạy riêng khối đó.

### 6.4 Runbook: hỏng thì lùi thế nào

**A. Vừa deploy xong thì web hỏng**

1. Vercel → Deployments → chọn bản chạy tốt gần nhất → **Promote to Production**. Đây là đường
   nhanh nhất, không cần đụng tới git, web trở lại sau vài giây.
2. Xong mới `git revert <sha>` rồi push, cho repo khớp với thứ đang chạy thật. Bỏ bước này là
   lần push sau vô tình đẩy lại đúng bản hỏng.

⚠ Promote chỉ lùi **code**. Migration đã chạy thì vẫn nằm nguyên trong DB — xem mục B.

**B. Migration hỏng**

**Đừng sửa file migration đã push.** Supabase ghi lại version đã chạy trong
`supabase_migrations.schema_migrations`; sửa nội dung file cũ thì cloud không chạy lại, còn máy
dev dựng từ đầu lại ra schema khác — hai bên lệch nhau mà không có gì báo.

Cách đúng là viết một migration MỚI đảo lại:

```bash
supabase migration new sua_<viec_can_dao>
# viết SQL đảo lại, rồi:
supabase db push
```

Xem cloud đang dừng ở đâu: `select * from supabase_migrations.schema_migrations order by version desc limit 5;`

**C. Mất dữ liệu (xoá nhầm, update nhầm)**

Gói Free **không có** backup tự động lẫn Point-in-time recovery — `sao-luu-db.yml` là bản sao
duy nhất. Lấy bản gần nhất theo 6.3, dựng một project Supabase tạm để khôi phục, rồi copy phần
thiếu sang project thật. Đừng restore thẳng đè lên production.

**D. Web không vào được sau vài ngày yên ắng**

Supabase Free tạm dừng project sau 7 ngày không có truy vấn. `giu-web-song.yml` sinh ra để
chuyện này không xảy ra; nếu vẫn dính thì vào Dashboard bấm **Restore**, dữ liệu còn nguyên.

### 6.5 Mấy điều dễ quên

- **GitHub tự tắt scheduled workflow sau 60 ngày repo không có hoạt động nào.** Nghỉ hè xong
  quay lại thấy ping và sao lưu im lặng thì vào tab Actions bật lại, không phải file hỏng.
- Lịch `schedule` của GitHub chạy trễ vài phút đến vài chục phút lúc cao điểm. Bình thường.
- Đổi domain Vercel → khai lại variable `SITE_URL`. Xoay `anon` key → khai lại secret.
- Muốn chạy tay bất kỳ workflow nào: Actions → chọn workflow → **Run workflow**.
