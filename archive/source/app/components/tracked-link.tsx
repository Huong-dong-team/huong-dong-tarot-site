"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import type { FunnelEventName } from "@/modules/analytics/domain/events";
import { BrowserEventAnalytics } from "@/modules/analytics/infrastructure/browser-event-analytics";

interface TrackedLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  eventName: FunnelEventName;
  source: string;
  productId?: string;
  value?: number;
}

const analytics = new BrowserEventAnalytics();

export function TrackedLink({
  eventName,
  source,
  productId,
  value,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    analytics.track({
      name: eventName,
      occurredAt: new Date().toISOString(),
      source,
      productId,
      value,
      currency: value === undefined ? undefined : "VND",
    });
    onClick?.(event);
  }

  return <a {...props} onClick={handleClick} />;
}
