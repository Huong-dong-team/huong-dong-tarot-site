import {
  CheckoutError,
  type CheckoutSession,
  type PaymentGateway,
} from "@/modules/checkout/domain/checkout";

export class DisabledPaymentGateway implements PaymentGateway {
  readonly provider = "disabled" as const;

  supports(): boolean {
    return false;
  }

  async createSession(): Promise<CheckoutSession> {
    throw new CheckoutError(
      "payment_provider_not_configured",
      "Cổng thanh toán thật đang khóa cho đến khi ADR được phê duyệt.",
    );
  }
}
