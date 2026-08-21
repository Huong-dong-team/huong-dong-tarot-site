import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const args = Object.fromEntries(process.argv.slice(2).map((value, index, all) => value.startsWith("--") ? [value.slice(2), all[index + 1]] : null).filter(Boolean));
if (!args.email || !args.password) {
  throw new Error('Cách dùng: node scripts/create-admin.js --email "..." --password "..." --name "Nguyễn Hồng Khang"');
}
if (args.password.length < 12) throw new Error("Mật khẩu owner phải có ít nhất 12 ký tự.");
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) throw new Error("Thiếu GOOGLE_APPLICATION_CREDENTIALS.");
if (!getApps().length) initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID });
const auth = getAuth();
const db = getFirestore();
let user;
try { user = await auth.getUserByEmail(args.email); }
catch (error) {
  if (error.code !== "auth/user-not-found") throw error;
  user = await auth.createUser({ email: args.email, password: args.password, displayName: args.name || "Nguyễn Hồng Khang", emailVerified: false });
}
await db.collection("admins").doc(user.uid).set({ email: user.email, displayName: args.name || user.displayName || "Nguyễn Hồng Khang", role: "owner", createdAt: FieldValue.serverTimestamp() }, { merge: true });
console.log(`Đã tạo/cập nhật owner: ${user.email}`);
