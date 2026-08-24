#!/usr/bin/env node
/* Gán custom claim admin cho một tài khoản. BẠN TỰ CHẠY — cần khoá dịch vụ.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/đường/dẫn/service-account.json \
 *   FIREBASE_PROJECT_ID=huong-dong-tarot-729d2 \
 *   node set-admin-claim.mjs hongkhang21998@gmail.com owner
 *
 * PHẢI CHẠY TRƯỚC KHI DEPLOY firestore.rules MỚI. Rules mới kiểm quyền bằng
 * claim; tài khoản chưa có claim sẽ mất quyền ngay khi deploy, kể cả owner, và
 * lúc đó không vào được admin để tự sửa.
 */
import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const [email, role = "editor"] = process.argv.slice(2);
if (!email) { console.error("Dùng: node set-admin-claim.mjs <email> [owner|editor]"); process.exit(1); }
if (!["owner", "editor"].includes(role)) { console.error("role phải là owner hoặc editor"); process.exit(1); }

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
}

const auth = getAuth();
const user = await auth.getUserByEmail(email);

await auth.setCustomUserClaims(user.uid, { admin: true, role });

/* Ghi cả vào /admins/{uid} — đây là nguồn sự thật cho NGƯỜI đọc: ai là admin,
   vai trò gì, ai cấp, cấp lúc nào. Rules không đọc collection này nữa (để khỏi
   tốn lượt đọc), nhưng có nó thì con người tra được và có vết kiểm toán. */
await getFirestore().collection("admins").doc(user.uid).set({
  email: user.email, role, grantedAt: FieldValue.serverTimestamp(), grantedBy: "cli",
}, { merge: true });

console.log(`✓ ${email} → admin=true, role=${role}`);
console.log(`  uid: ${user.uid}`);
console.log(`\n  Token cũ vẫn chưa có claim. Đăng xuất rồi đăng nhập lại, hoặc gọi`);
console.log(`  getIdToken(true) để lấy token mới, rồi mới deploy rules.`);
