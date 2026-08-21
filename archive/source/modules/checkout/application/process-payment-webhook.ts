import type {
  PaymentSettlementRepository,
  PaymentSettlementResult,
  PaymentWebhookEnvelope,
  PaymentWebhookVerifier,
} from "@/modules/checkout/domain/checkout";

export class ProcessPaymentWebhook {
  constructor(
    private readonly verifier: PaymentWebhookVerifier,
    private readonly settlements: PaymentSettlementRepository,
  ) {}

  async execute(envelope: PaymentWebhookEnvelope): Promise<PaymentSettlementResult> {
    const event = await this.verifier.verifyAndParse(envelope);
    return this.settlements.applyVerifiedEvent(event);
  }
}
