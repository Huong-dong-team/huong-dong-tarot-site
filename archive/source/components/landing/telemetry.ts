import type { LeadSource, TelemetryEventName } from "./types";

interface TelemetryPayload {
  name: TelemetryEventName;
  source: LeadSource | "landing";
  cardSlug?: string;
}

export function sendTelemetry(payload: TelemetryPayload): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  if (navigator.doNotTrack === "1" || navigator.doNotTrack === "yes") return;

  void fetch("/api/telemetry", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
