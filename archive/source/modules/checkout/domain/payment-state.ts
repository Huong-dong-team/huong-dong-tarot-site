export type PaymentState =
  | "pending_payment"
  | "payment_failed"
  | "payment_canceled"
  | "payment_expired"
  | "paid"
  | "refund_pending"
  | "refunded";

export type ProviderPaymentEvent =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.canceled"
  | "payment.expired"
  | "refund.succeeded";

interface PaymentTransition {
  readonly previous: PaymentState;
  readonly next: PaymentState;
}

const transitions: Readonly<Record<ProviderPaymentEvent, PaymentTransition>> = {
  "payment.succeeded": { previous: "pending_payment", next: "paid" },
  "payment.failed": { previous: "pending_payment", next: "payment_failed" },
  "payment.canceled": { previous: "pending_payment", next: "payment_canceled" },
  "payment.expired": { previous: "pending_payment", next: "payment_expired" },
  "refund.succeeded": { previous: "refund_pending", next: "refunded" },
};

export function getPaymentTransition(event: ProviderPaymentEvent): PaymentTransition {
  return transitions[event];
}

export function applyPaymentTransition(
  current: PaymentState,
  event: ProviderPaymentEvent,
): PaymentState {
  const transition = getPaymentTransition(event);
  return current === transition.previous ? transition.next : current;
}
