export type FunnelEventName =
  | "qualified_view"
  | "story_open"
  | "quest_start"
  | "quest_complete"
  | "waitlist_submit"
  | "deposit_start"
  | "deposit_success"
  | "purchase_complete";

export interface FunnelEvent {
  readonly name: FunnelEventName;
  readonly occurredAt: string;
  readonly source: string;
  readonly productId?: string;
  readonly value?: number;
  readonly currency?: "VND";
}

export interface AnalyticsPort {
  track(event: FunnelEvent): void;
}
