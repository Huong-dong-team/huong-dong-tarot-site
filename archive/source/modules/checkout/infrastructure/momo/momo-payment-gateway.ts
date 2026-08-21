import type {
  CheckoutQuote,
  CheckoutSession,
  PaymentGateway,
  PaymentMethod,
} from "@/modules/checkout/domain/checkout";

export interface MoMoHostedCheckoutClient {
  createPayment(input: {
    readonly merchantOrderId: string;
    readonly amount: number;
    readonly currency: "VND";
    readonly method: "momo-wallet" | "card" | "domestic-bank";
    readonly returnUrl: string;
  }): Promise<{
    readonly reference: string;
    readonly url: string;
    readonly expiresAt: string;
  }>;
}

/**
 * Verified boundary for a future MoMo merchant integration. The HTTP client
 * remains unimplemented until sandbox credentials and the exact contract are
 * approved; the visual demo never calls this adapter.
 */
export class MoMoPaymentGateway implements PaymentGateway {
  readonly provider = "momo" as const;

  constructor(private readonly client: MoMoHostedCheckoutClient) {}

  supports(method: PaymentMethod): boolean {
    return method === "momo-wallet" || method === "card" || method === "domestic-bank";
  }

  async createSession(quote: CheckoutQuote): Promise<CheckoutSession> {
    if (!this.supports(quote.paymentMethod) || quote.paymentMethod === "apple-pay" || quote.paymentMethod === "bank-transfer") {
      throw new Error("MoMo adapter received an unsupported payment method.");
    }

    const result = await this.client.createPayment({
      merchantOrderId: quote.orderId,
      amount: quote.totalAmount,
      currency: quote.currency,
      method: quote.paymentMethod,
      returnUrl: quote.returnUrl,
    });

    return {
      provider: this.provider,
      providerReference: result.reference,
      checkoutUrl: result.url,
      expiresAt: result.expiresAt,
    };
  }
}
