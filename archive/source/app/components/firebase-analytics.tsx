"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase/client";

/** Khởi động Analytics một lần sau khi ứng dụng đã hydrate trong trình duyệt. */
export function FirebaseAnalytics() {
  useEffect(() => {
    void getFirebaseAnalytics().catch(() => {
      // Tiện ích chặn theo dõi hoặc mạng lỗi không được làm hỏng giao diện.
    });
  }, []);

  return null;
}
