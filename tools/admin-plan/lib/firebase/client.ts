/* Khởi tạo Firebase phía client.
 *
 * Admin chạy ở chế độ static export nên KHÔNG có phía máy chủ — mọi truy vấn đi
 * thẳng từ trình duyệt tới Firestore, và Rules là lớp bảo mật duy nhất thật sự.
 * Đừng bao giờ đặt bí mật nào ở đây: mọi biến NEXT_PUBLIC_* đều lộ ra bundle.
 */
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export const app: FirebaseApp = getApps()[0] ?? initializeApp(config);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
