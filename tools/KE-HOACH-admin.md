# Kế hoạch · Admin Dashboard Hường Đông

Trước khi viết code, bốn điều bạn cần biết — tôi kiểm trực tiếp trên Firestore và repo.

---

## 0 · Bốn chỗ đề bài lệch với hệ thống thật

**0.1 · Dự án KHÔNG phải Next.js.** Site công khai là static site generator tự viết:
`templates/` + `data/` + `scripts/build.js` → `dist/` → Firebase Hosting. Không React,
không SSR. Nó vừa được tối ưu xuống LCP 3,2s và SEO 100. Chuyển toàn bộ sang Next.js
là ném đi kết quả đó và gánh rủi ro hồi quy lớn.

**0.2 · Đã có một admin đang chạy** ở `/admin/`, viết bằng JS thuần, 100KB, có router
và 9 màn hình:

```
views/      dashboard · cards · card-edit · posts · post-edit · media · settings · subscribers · users
components/ rich-editor · media-picker · seo-panel · seo-preview · publish-checklist · toast
```

Nghĩa là **Module 1 (Di Sản) về cơ bản đã tồn tại**, kèm rich editor, bộ chọn media,
bảng kiểm trước khi xuất bản và xem trước SEO. Remake sạch sẽ ném đi phần này.

**0.3 · Collection tên `subscribers`, không phải `waitlist`.** Form trên site đang ghi
thẳng vào `subscribers` qua Firestore REST API. Đổi tên nghĩa là phải sửa cả form đang
chạy — nên tôi đề xuất **giữ tên `subscribers`**.

**0.4 · Trạng thái thật trên Firestore lúc này:**

| Collection | Số tài liệu |
|---|---|
| `cards` | 78 |
| `posts` | 2 |
| `admins` | 1 |
| `settings` | 1 |
| `subscribers` | **chưa tồn tại** — chưa ai đăng ký |
| `orders` | **chưa tồn tại** |
| `media` | **chưa tồn tại** (rules có nhưng chưa dùng) |

Và tài khoản `hongkhang21998@gmail.com` có **`customClaims = {}`** — chưa có claim nào.

---

## 1 · Đề xuất kiến trúc

**Admin là một app Next.js RIÊNG, deploy sang Hosting site thứ hai.** Site công khai
giữ nguyên static.

| | Lý do |
|---|---|
| Không đụng site công khai | LCP 3,2s và SEO 100 vừa đạt được, không đánh đổi |
| Khách không tải React | Admin chỉ 1–3 người dùng, không có lý do bắt 100% khách gánh bundle |
| Deploy độc lập | Sập admin không sập site bán hàng |
| DX hiện đại cho phần cần nó | Ba module admin sẽ còn phình; JS thuần sẽ đuối |

**Next.js chạy ở chế độ `output: 'export'` (static export).** Không SSR, không Cloud
Functions, không cold start, không tốn tiền chạy. Admin nằm sau đăng nhập nên không cần
SSR, và **không được** SSR: dữ liệu quản trị không nên đi qua render phía máy chủ.

> Hệ quả phải biết: `middleware.ts` **không hoạt động** với static export. Chặn route
> phải làm ở client. Điều đó chấp nhận được vì — xem §2 — chặn ở client là trải nghiệm,
> không phải bảo mật.

Tên miền: `admin.huongdong.id.vn` (Hosting site thứ hai), hoặc giữ `/admin/` qua rewrite.
Tôi nghiêng về **subdomain riêng** — tách cookie, tách CSP, tách cache.

---

## 2 · Cách đăng nhập — phần bạn muốn lên kế hoạch trước

### 2.1 · Hai lớp, đừng nhầm lẫn

| Lớp | Là gì | Chống được gì |
|---|---|---|
| **Route guard ở client** | Kiểm token + claim rồi mới render | Người dùng lạc vào nhầm trang |
| **Firestore Rules + Storage Rules** | Kiểm trên máy chủ Google | **Đây mới là bảo mật thật** |

Ai cũng mở được DevTools và bỏ qua guard client. Nhưng họ **không** đọc được một
document nào nếu Rules không cho. Mọi thiết kế phải giả định guard client bị vô hiệu.

### 2.2 · Đăng nhập bằng Google, bỏ email/mật khẩu

Admin hiện dùng `signInWithEmailAndPassword`. Đề xuất chuyển sang **Google Sign-In**:

- Bạn đã có sẵn tài khoản Google cho dự án
- Không phải lưu, đặt lại, hay lo rò rỉ mật khẩu
- Thừa hưởng 2FA của tài khoản Google — thứ mà email/mật khẩu tự dựng khó bằng
- Không cần màn hình "quên mật khẩu", không cần email giao dịch

Luồng:

```
1. Người dùng bấm "Đăng nhập bằng Google"
2. signInWithPopup(GoogleAuthProvider)
3. getIdTokenResult(true) → đọc claims
4. claims.admin === true ?
     có   → vào /dashboard
     không→ signOut() NGAY, hiện "Tài khoản này không có quyền quản trị"
```

Bước 4 quan trọng: **đăng xuất ngay** nếu không có claim. Đừng để một tài khoản Google
bất kỳ ở trạng thái "đã đăng nhập nhưng không có quyền" — đó là bề mặt tấn công thừa.

### 2.3 · Custom Claims, nhưng giữ `/admins/{uid}` làm nguồn sự thật cho người

| | Custom Claims | Document `/admins/{uid}` |
|---|---|---|
| Rules đọc | Từ JWT, **0 lượt đọc** | `exists()` → **1 lượt đọc mỗi lần kiểm** |
| Tốc độ | Nhanh hơn | Chậm hơn |
| Thu hồi quyền | Tới 1 giờ mới hiệu lực | Tức thì |
| Người đọc được | Không, nằm trong token | Có, xem được ai là admin, vai trò, cấp khi nào |

Rules hiện tại gọi `exists()` ở **mọi lần đọc lá chưa publish** — mỗi lần là một lượt
đọc tính tiền.

**Đề xuất giữ cả hai:**

```
/admins/{uid}  ← nguồn sự thật cho người: email, role, grantedBy, grantedAt
      ↓ Cloud Function onWrite
custom claim   ← bản sao cho máy: { admin: true, role: 'owner' | 'editor' }
```

Rules đọc claim (rẻ). Con người đọc document (rõ ràng, có vết). Function giữ hai bên
đồng bộ. Thu hồi khẩn cấp thì xoá document **và** gọi `revokeRefreshTokens(uid)` để ép
token hết hạn ngay, không chờ một giờ.

### 2.4 · Bẫy triển khai — đọc kỹ chỗ này

Tài khoản duy nhất hiện có **`customClaims = {}`**. Nếu deploy rules mới (dựa trên claim)
trước khi gán claim, **bạn mất quyền truy cập ngay lập tức, kể cả owner** — và không vào
được admin để tự sửa.

Thứ tự bắt buộc:

```
1. Chạy script Admin SDK gán claim cho hongkhang21998@gmail.com
2. Đăng xuất, đăng nhập lại, xác nhận getIdTokenResult().claims.admin === true
3. LÚC ĐÓ mới deploy firestore.rules mới
4. Kiểm lại đọc/ghi được
```

Bước 1 cần khoá dịch vụ — **bạn tự chạy**, tôi không đụng vào khoá bí mật.

### 2.5 · Lớp phòng thủ thêm

- **App Check** (reCAPTCHA Enterprise) — chặn script gọi thẳng API mà không qua app thật
- **Giới hạn tên miền** cho Firebase API key trong Google Cloud Console
- **`authDomain`** trỏ đúng subdomain admin
- Không bật provider nào khác ngoài Google trong Firebase Auth

---

## 3 · Cấu trúc thư mục

```
admin/                              # app Next.js riêng
  app/
    layout.tsx                      # <html lang="vi">, font, Toaster
    page.tsx                        # → redirect /dashboard
    login/page.tsx                  # màn hình duy nhất không cần quyền
    (protected)/
      layout.tsx                    # guard: chờ auth → kiểm claim → render
      dashboard/page.tsx            # số liệu tổng quan
      lore/
        cards/page.tsx              # bảng 78 lá
        cards/[slug]/page.tsx       # sửa một lá
        posts/page.tsx
        posts/[slug]/page.tsx
        media/page.tsx              # Storage
      waitlist/page.tsx             # ĐỌC collection `subscribers`
      orders/page.tsx
      orders/[id]/page.tsx
      settings/page.tsx
      users/page.tsx                # cấp/thu quyền admin — chỉ owner
  components/
    ui/                             # shadcn/ui
    data-table/                     # bảng dùng chung: lọc, phân trang, export
    editor/                         # rich text
    media-picker/
    app-shell.tsx                   # sidebar + topbar
  lib/
    firebase/client.ts              # khởi tạo app, auth, db, storage
    firebase/collections.ts         # TÊN COLLECTION TẬP TRUNG MỘT CHỖ
    hooks/use-auth.ts
    hooks/use-admin-guard.ts
    hooks/use-collection.ts
    export/to-csv.ts
  types/
    card.ts · post.ts · subscriber.ts · order.ts
  next.config.mjs                   # output: 'export'
  firebase.json                     # site thứ hai: admin
```

`lib/firebase/collections.ts` tồn tại vì đúng một lý do: chính dự án này đã có bài học
về việc cùng một sự thật nằm ở nhiều nơi rồi lệch nhau. Tên collection viết một chỗ,
mọi nơi import.

---

## 4 · Lộ trình

| Bước | Việc | Ai | Chặn bởi |
|---|---|---|---|
| **A1** | Gán custom claim cho tài khoản owner | **Người** chạy script | — |
| **A2** | Cloud Function đồng bộ `/admins` → claim | Claude | A1 |
| **A3** | Deploy `firestore.rules` mới | **Người** | A1 xác nhận xong |
| **B1** | Dựng khung Next.js + shadcn + Tailwind | Claude | — |
| **B2** | Đăng nhập Google + guard + app shell | Claude | A1 |
| **B3** | Module Phễu: bảng `subscribers` + lọc + export CSV | Claude | B2 |
| **B4** | Module Di Sản: chuyển 9 màn hình cũ sang | **ChatGPT** dựng UI · Claude nối dữ liệu | B2 |
| **B5** | Module Thương Mại: `orders` — cần chốt schema trước | Claude | **Người chốt §5** |
| **C1** | Hosting site thứ hai + tên miền admin | **Người** | B2 |
| **C2** | App Check + giới hạn API key | Claude + **Người** | C1 |

---

## 5 · Cần chốt trước khi làm Module Thương Mại

`orders` chưa tồn tại. Trước khi viết code phải chốt:

1. **Vòng đời đơn** — bạn nêu ba trạng thái. Cần thêm *Đã huỷ* và *Hoàn tiền*?
2. **Thanh toán** — chuyển khoản tay và admin xác nhận, hay tích hợp cổng?
   Ảnh hưởng lớn tới schema và tới Rules.
3. **Lưu gì về khách** — tên, điện thoại, địa chỉ giao. Đây là **dữ liệu cá nhân**;
   Rules phải chặt hơn hẳn `subscribers`, và cần chính sách xoá.
4. **Kho** — có theo dõi tồn kho không, hay bán theo đợt đặt trước?

Tôi không dựng schema `orders` khi chưa có bốn câu trả lời này — đoán sai schema
thương mại tốn hơn nhiều so với chờ.
