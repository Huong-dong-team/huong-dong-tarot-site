# Đăng nhập trang Admin — so bảy phương án

Kiểm cấu hình thật của project `huong-dong-tarot-729d2` ngày 22/08/2026:

```
Phương thức đang dùng : signInWithEmailAndPassword + kiểm doc /admins/{uid}
MFA                   : DISABLED
Blocking functions    : chưa có
Domain được uỷ quyền  : localhost · *.firebaseapp.com · *.web.app
Tài khoản             : 1 · customClaims rỗng
```

**Một chỗ chặn tìm thấy ngay:** `huongdong.id.vn` **không** nằm trong danh sách domain
được uỷ quyền. Google Sign-In gọi từ tên miền thật sẽ bị từ chối. Phải thêm domain
admin vào danh sách trước khi làm bất cứ gì khác — nếu không sẽ mất thời gian debug
một lỗi không liên quan đến code.

---

## Vì sao phương án hiện tại không ổn

`signInWithEmailAndPassword` với Firebase có ba điểm yếu cụ thể, không phải chê chung chung:

1. **API key của Firebase là công khai** — nằm ngay trong bundle. Ai cũng lấy được và
   gọi thẳng endpoint đăng nhập. Chỉ còn mật khẩu chắn giữa họ và tài khoản.
2. **Không có giới hạn số lần thử mặc định** ở mức ứng dụng. Firebase có chặn theo IP
   nhưng không phải là cơ chế bạn cấu hình được chặt.
3. **Không có 2FA.** MFA đang `DISABLED`, và bật được thì cũng chỉ áp cho
   email/mật khẩu sau khi nâng cấp Identity Platform.

Cộng thêm: phải tự dựng luồng quên mật khẩu, phải gửi email giao dịch, phải lo chỗ lưu.

---

## Bảy phương án

| | Phương án | Chống được gì | Đổi lại | Hợp không |
|---|---|---|---|---|
| **A** | Email + mật khẩu *(hiện tại)* | gần như không | phải tự lo mọi thứ | ✗ bỏ |
| **B** | **Google Sign-In** | thừa hưởng 2FA của Google; không có mật khẩu để rò | phụ thuộc một tài khoản Google | ✓ **nền tảng** |
| **C** | Email link không mật khẩu | không mật khẩu | hộp thư thành chìa khoá; link chuyển tiếp được | trung bình |
| **D** | **Blocking function chặn đăng ký** | người lạ **không tạo nổi tài khoản** | cần Identity Platform | ✓ **nên thêm** |
| **E** | MFA bắt buộc (TOTP) | chống chiếm tài khoản | cần GCIP; thêm một bước mỗi lần vào | ✓ khi mở `orders` |
| **F** | **Không mở admin ra internet** | bề mặt tấn công bằng 0 | không sửa được từ điện thoại | ✓ đáng cân nhắc cho OpenBeta |
| **G** | Passkey / WebAuthn | chống phishing tốt nhất hiện có | Firebase Auth chưa hỗ trợ sẵn, phải tự dựng custom token | để sau |

---

## Đề xuất: xếp lớp, không chọn một

### Lớp 1 · Google Sign-In (B)

Không mật khẩu để mất. Bảo mật tài khoản dồn về chỗ bạn đã bảo vệ tốt nhất — tài khoản
Google. **Điều kiện đi kèm: bật 2FA cho chính tài khoản Google đó.** Không bật thì
phương án này chỉ hơn A một chút.

### Lớp 2 · Blocking function chặn đăng ký (D)

Đây là chỗ nhiều người bỏ qua. Với provider Google, **bất kỳ ai cũng đăng nhập được** —
họ chỉ không có claim nên không đọc được gì. Vẫn khó chịu: danh sách Auth đầy tài khoản lạ.

Blocking function `beforeCreate` từ chối mọi email ngoài allowlist → **tài khoản không
bao giờ được tạo**. Khác biệt thật: không phải "vào được nhưng không làm gì được", mà là
"không vào được".

```js
// Cloud Function · beforeUserCreated
const ALLOW = ["hongkhang21998@gmail.com"];
if (!ALLOW.includes(user.email ?? "")) {
  throw new HttpsError("permission-denied", "Tài khoản không được phép.");
}
```

Cần nâng cấp lên Identity Platform. Miễn phí ở quy mô này.

### Lớp 3 · Firestore Rules (đã có)

Lớp duy nhất thật sự là bảo mật. Hai lớp trên bị vượt qua thì Rules vẫn chặn.

### Lớp 4 · App Check

Chặn script gọi thẳng API mà không đi qua app thật.

---

## Phương án F đáng cân nhắc nghiêm túc

Câu hỏi nên hỏi: **trong giai đoạn OpenBeta, có lý do gì để admin nằm trên internet không?**

Hiện chỉ một người dùng, ngồi một máy Ubuntu, sửa nội dung vài lần một tuần. Chạy
`npm run admin` ở localhost, kết nối thẳng Firestore production bằng chính tài khoản
Google — bề mặt tấn công từ internet **bằng không**. Không subdomain, không App Check,
không lo ai dò `/admin`.

`localhost` đã có sẵn trong danh sách domain uỷ quyền, nên chạy được ngay.

Đổi lại: không sửa được từ điện thoại, và người thứ hai muốn vào phải dựng môi trường dev.

**Khi nào bỏ F:** khi có người thứ hai không phải lập trình viên, hoặc khi cần duyệt đơn
hàng ngoài giờ. Lúc đó chuyển sang B + D + E.

---

## Kế hoạch phá cửa khi mất tài khoản

Google Sign-In nghĩa là mất tài khoản Google là mất admin. Phải có đường lùi:

1. Khoá dịch vụ `service-account.json` cất trong trình quản lý mật khẩu, **không** để
   chỉ một bản trên ổ đĩa
2. Có khoá là chạy được `set-admin-claim.mjs` để cấp quyền cho một tài khoản khác
3. Ghi lại quy trình này ở nơi không phụ thuộc vào chính tài khoản Google đó

---

## Thứ tự làm

| | Việc | Ai | Ghi chú |
|---|---|---|---|
| 1 | Thêm `huongdong.id.vn` và domain admin vào authorized domains | **Người** | Chặn mọi thứ phía sau |
| 2 | Bật 2FA cho tài khoản Google | **Người** | Không có bước này thì B vô nghĩa |
| 3 | Chạy `set-admin-claim.mjs` | **Người** | Cần khoá dịch vụ |
| 4 | Đăng nhập lại, xác nhận `claims.admin === true` | **Người** | |
| 5 | Deploy `firestore.rules` mới | **Người** | Chỉ sau khi bước 4 xác nhận |
| 6 | Đổi admin sang Google Sign-In | Claude | |
| 7 | Nâng cấp Identity Platform + blocking function | Claude + **Người** | |
| 8 | App Check | Claude | |
| 9 | MFA bắt buộc | **Người** | Khi mở `orders` |

Bước 1–5 làm được ngay hôm nay. Bước 6 trở đi chờ 1–5 xong.
