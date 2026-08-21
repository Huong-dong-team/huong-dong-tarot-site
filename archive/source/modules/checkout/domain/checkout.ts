import type { Product } from "@/modules/catalog/domain/product";

export type CheckoutMode = "deposit" | "full-payment";

export type PaymentMethod =
  | "bank-transfer"
  | "momo-wallet"
  | "apple-pay"
  | "card"
  | "domestic-bank";

export type PaymentProvider = "onepay" | "momo" | "disabled";

export type OrderStatus =
  | "draft"
  | "pending_payment"
  | "payment_failed"
  | "payment_canceled"
  | "payment_expired"
  | "paid"
  | "confirmed"
  | "producing"
  | "ready_to_ship"
  | "shipped"
  | "delivered"
  | "refund_pending"
  | "refunded";

export type CheckoutErrorCode =
  | "invalid_quantity"
  | "invalid_return_url"
  | "product_not_found"
  | "product_not_for_sale"
  | "payment_method_not_supported"
  | "payment_provider_not_configured";

export class CheckoutError extends Error {
  constructor(
    readonly code: CheckoutErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "CheckoutError";
  }
}

/**
 * Input accepted by the application layer. Amount is intentionally absent:
 * prices are loaded from ProductRepository and recalculated server-side.
 */
export interface StartCheckoutCommand {
  readonly productId: string;
  readonly mode: CheckoutMode;
  readonly quantity: number;
  readonly paymentMethod: PaymentMethod;
  readonly returnUrl: string;
}

export interface CheckoutQuote {
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
  readonly mode: CheckoutMode;
  readonly quantity: number;
  readonly unitAmount: number;
  readonly totalAmount: number;
  readonly currency: "VND";
  readonly paymentMethod: PaymentMethod;
  readonly returnUrl: string;
}

export interface CheckoutSession {
  readonly provider: PaymentProvider;
  readonly providerReference: string;
  readonly checkoutUrl: string;
  readonly expiresAt: string;
}

export interface StartCheckoutResult extends CheckoutSession {
  readonly orderId: string;
  /** Delivered only through a trusted post-payment channel, never logged. */
  readonly receiptAccessToken: string;
}

export interface DraftOrder {
  readonly id: string;
  readonly status: "draft";
  readonly product: Product;
  readonly mode: CheckoutMode;
  readonly quantity: number;
  readonly unitAmount: number;
  readonly totalAmount: number;
  readonly currency: "VND";
  readonly paymentMethod: PaymentMethod;
  readonly receiptAccessTokenHash: string;
  readonly createdAt: string;
}

export interface CheckoutOrderRepository {
  createDraft(order: DraftOrder): Promise<void>;
  markPendingPayment(
    orderId: string,
    provider: PaymentProvider,
    providerReference: string,
  ): Promise<void>;
}

export interface PaymentGateway {
  readonly provider: PaymentProvider;
  supports(method: PaymentMethod): boolean;
  createSession(quote: CheckoutQuote): Promise<CheckoutSession>;
}

export type PaymentEventType =
  | "payment.succeeded"
  | "payment.failed"
  | "payment.canceled"
  | "payment.expired"
  | "refund.succeeded";

export interface VerifiedPaymentEvent {
  readonly provider: Exclude<PaymentProvider, "disabled">;
  readonly providerEventId: string;
  readonly providerReference: string;
  readonly orderId: string;
  readonly type: PaymentEventType;
  readonly amount: number;
  readonly currency: "VND";
  readonly occurredAt: string;
  readonly payloadHash: string;
}

export interface PaymentWebhookEnvelope {
  readonly rawBody: Uint8Array;
  readonly headers: Readonly<Record<string, string>>;
}

export interface PaymentWebhookVerifier {
  verifyAndParse(envelope: PaymentWebhookEnvelope): Promise<VerifiedPaymentEvent>;
}

export interface PaymentSettlementResult {
  readonly duplicate: boolean;
  readonly orderStatusChanged: boolean;
}

export interface PaymentSettlementRepository {
  applyVerifiedEvent(event: VerifiedPaymentEvent): Promise<PaymentSettlementResult>;
}
