import {
  CheckoutError,
  type CheckoutQuote,
  type CheckoutSession,
  type PaymentGateway,
  type PaymentMethod,
} from "@/modules/checkout/domain/checkout";

export class CompositePaymentGateway implements PaymentGateway {
  readonly provider = "disabled" as const;

  constructor(private readonly gateways: readonly PaymentGateway[]) {}

  supports(method: PaymentMethod): boolean {
    return this.gateways.some((gateway) => gateway.supports(method));
  }

  async createSession(quote: CheckoutQuote): Promise<CheckoutSession> {
    const gateway = this.gateways.find((candidate) =>
      candidate.supports(quote.paymentMethod),
    );

    if (!gateway) {
      throw new CheckoutError(
        "payment_method_not_supported",
        "Không có cổng thanh toán nào hỗ trợ phương thức đã chọn.",
      );
    }

    return gateway.createSession(quote);
  }
}
