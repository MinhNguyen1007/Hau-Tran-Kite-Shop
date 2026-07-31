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

**⚠ ĐỪNG tắt Email provider và ĐỪNG bỏ tick "Allow new users to sign up" trên Dashboard.**
Cái thứ nhất khoá luôn đăng nhập mật khẩu của chủ shop; cái thứ hai chặn cả đăng ký Google.
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
- [ ] Đăng nhập chủ shop bằng tài khoản + mật khẩu → vào thẳng `/admin`.
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
