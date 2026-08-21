import type {
  CheckoutQuote,
  CheckoutSession,
  PaymentGateway,
  PaymentMethod,
} from "@/modules/checkout/domain/checkout";

export interface OnePayHostedCheckoutClient {
  createHostedCheckout(input: {
    readonly merchantOrderId: string;
    readonly amount: number;
    readonly currency: "VND";
    readonly method: Exclude<PaymentMethod, "bank-transfer">;
    readonly returnUrl: string;
    readonly description: string;
  }): Promise<{
    readonly reference: string;
    readonly url: string;
    readonly expiresAt: string;
  }>;
}

/**
 * Provider adapter only. The concrete signed HTTP client is intentionally not
 * implemented until OnePay supplies merchant-specific API/webhook documents.
 */
export class OnePayPaymentGateway implements PaymentGateway {
  readonly provider = "onepay" as const;
  private readonly methods = new Set<PaymentMethod>([
    "apple-pay",
    "card",
    "domestic-bank",
  ]);

  constructor(private readonly client: OnePayHostedCheckoutClient) {}

  supports(method: PaymentMethod): boolean {
    return this.methods.has(method);
  }

  async createSession(quote: CheckoutQuote): Promise<CheckoutSession> {
    const result = await this.client.createHostedCheckout({
      merchantOrderId: quote.orderId,
      amount: quote.totalAmount,
      currency: quote.currency,
      method: quote.paymentMethod as Exclude<PaymentMethod, "bank-transfer">,
      returnUrl: quote.returnUrl,
      description: `${quote.productName} × ${quote.quantity}`,
    });

    return {
      provider: this.provider,
      providerReference: result.reference,
      checkoutUrl: result.url,
      expiresAt: result.expiresAt,
    };
  }
}
