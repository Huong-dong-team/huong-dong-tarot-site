import type { Timestamp } from "firebase/firestore";

/* Bốn trường đầu do form công khai ghi và Rules kiểm chặt.
   Ba trường sau chỉ admin được sửa — xem rule onlyChanged(['note','tags','status']). */
export interface Subscriber {
  id: string;
  email: string;
  source: string;          // "card-detail", "home-hero"… nơi họ đăng ký
  note: string;
  createdAt: Timestamp | null;
  tags?: string[];
  status?: "new" | "contacted" | "converted" | "unsubscribed";
}
