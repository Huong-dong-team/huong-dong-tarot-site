import type { AnalyticsPort, FunnelEvent } from "@/modules/analytics/domain/events";
import { getFirebaseAnalytics } from "@/lib/firebase/client";

declare global {
  interface Window {
    dataLayer?: FunnelEvent[];
  }
}

export class BrowserEventAnalytics implements AnalyticsPort {
  track(event: FunnelEvent): void {
    if (typeof window === "undefined") return;

    window.dataLayer ??= [];
    window.dataLayer.push(event);
    window.dispatchEvent(new CustomEvent("huong-dong:analytics", { detail: event }));
    void publishToFirebase(event);
  }
}

async function publishToFirebase(event: FunnelEvent): Promise<void> {
  try {
    const analytics = await getFirebaseAnalytics();
    if (!analytics) return;

    const { logEvent } = await import("firebase/analytics");
    logEvent(analytics, event.name, {
      source: event.source,
      occurred_at: event.occurredAt,
      ...(event.productId ? { product_id: event.productId } : {}),
      ...(event.value === undefined ? {} : { value: event.value }),
      ...(event.currency ? { currency: event.currency } : {}),
    });
  } catch {
    // Analytics không được phép làm gián đoạn trải nghiệm nếu bị chặn bởi
    // trình duyệt, tiện ích bảo mật hoặc kết nối mạng.
  }
}
