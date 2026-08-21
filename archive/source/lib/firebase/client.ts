"use client";

import { getApp, getApps, initializeApp, type FirebaseApp, type FirebaseOptions } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

/**
 * Firebase Web App config is public client metadata, not an Admin SDK secret.
 * Environment values can override these defaults for local/emulator projects.
 */
export const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "AIzaSyDzHJJunRs5M58F1dHPg9WtpKcTnJdHkzE",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "huong-dong-tarot-729d2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "huong-dong-tarot-729d2",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "huong-dong-tarot-729d2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "228558600570",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "1:228558600570:web:fd4c1e30a6dec514e3bec3",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? "G-GWCNBTGQ9V",
};

export const isFirebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
].every(Boolean);

export type FirebaseServices = {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
};

let services: FirebaseServices | undefined;
let analyticsService: Analytics | null | undefined;

/**
 * Khởi tạo theo nhu cầu để bản build/preview vẫn chạy khi project Firebase thật
 * chưa được liên kết. Không gọi hàm này trong Server Component.
 */
export function getFirebaseServices(): FirebaseServices {
  if (services) return services;
  if (!isFirebaseConfigured) {
    throw new Error("Firebase chưa được cấu hình. Hãy bổ sung các biến NEXT_PUBLIC_FIREBASE_*.");
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  services = { app, auth: getAuth(app), firestore: getFirestore(app) };
  return services;
}

/**
 * Analytics chỉ chạy trong trình duyệt và được tải theo nhu cầu để không làm
 * nặng phần render phía máy chủ. Trình duyệt không hỗ trợ sẽ nhận về null.
 */
export async function getFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined" || !isFirebaseConfigured) return null;
  if (analyticsService !== undefined) return analyticsService;

  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) {
    analyticsService = null;
    return analyticsService;
  }

  analyticsService = getAnalytics(getFirebaseServices().app);
  return analyticsService;
}
