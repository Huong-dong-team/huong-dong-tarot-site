import { getD1 } from "@/db";
import type {
  PaymentSettlementRepository,
  PaymentSettlementResult,
  VerifiedPaymentEvent,
} from "@/modules/checkout/domain/checkout";
import { getPaymentTransition } from "@/modules/checkout/domain/payment-state";

export class D1PaymentSettlementRepository implements PaymentSettlementRepository {
  constructor(
    private readonly database?: D1Database,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async applyVerifiedEvent(
    event: VerifiedPaymentEvent,
  ): Promise<PaymentSettlementResult> {
    const database = this.database ?? await getD1();
    const receivedAt = this.now().toISOString();
    const transition = getPaymentTransition(event.type);
    const nextStatus = transition.next;
    const previousStatus = transition.previous;

    const statements = [
      database
        .prepare(
          `INSERT OR IGNORE INTO payment_events (
            id, provider, provider_event_id, provider_reference, order_id,
            event_type, amount, currency, payload_hash, occurred_at, received_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          `${event.provider}:${event.providerEventId}`,
          event.provider,
          event.providerEventId,
          event.providerReference,
          event.orderId,
          event.type,
          event.amount,
          event.currency,
          event.payloadHash,
          event.occurredAt,
          receivedAt,
        ),
      database
        .prepare(
          `UPDATE orders
           SET status = ?, updated_at = ?, paid_at = CASE WHEN ? = 'paid' THEN ? ELSE paid_at END
           WHERE id = ?
             AND status = ?
             AND total_amount = ?
             AND currency = ?
             AND payment_provider = ?
             AND provider_reference = ?
             AND EXISTS (
               SELECT 1 FROM payment_events
               WHERE provider = ? AND provider_event_id = ? AND processed_at IS NULL
             )`,
        )
        .bind(
          nextStatus,
          receivedAt,
          nextStatus,
          receivedAt,
          event.orderId,
          previousStatus,
          event.amount,
          event.currency,
          event.provider,
          event.providerReference,
          event.provider,
          event.providerEventId,
        ),
      database
        .prepare(
          `UPDATE payment_events
           SET processed_at = ?
           WHERE provider = ?
             AND provider_event_id = ?
             AND processed_at IS NULL
             AND (
               event_type NOT IN ('payment.succeeded', 'refund.succeeded')
               OR EXISTS (
                 SELECT 1 FROM orders
                 WHERE id = ? AND status = ? AND total_amount = ? AND currency = ?
               )
             )`,
        )
        .bind(
          receivedAt,
          event.provider,
          event.providerEventId,
          event.orderId,
          nextStatus,
          event.amount,
          event.currency,
        ),
    ];

    const [insertResult, orderResult] = await database.batch(statements);

    return {
      duplicate: insertResult.meta.changes === 0,
      orderStatusChanged: orderResult.meta.changes === 1,
    };
  }
}
