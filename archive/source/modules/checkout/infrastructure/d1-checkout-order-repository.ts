import { getD1 } from "@/db";
import type {
  CheckoutOrderRepository,
  DraftOrder,
  PaymentProvider,
} from "@/modules/checkout/domain/checkout";

export class D1CheckoutOrderRepository implements CheckoutOrderRepository {
  constructor(private readonly database?: D1Database) {}

  async createDraft(order: DraftOrder): Promise<void> {
    const database = this.database ?? await getD1();
    const itemId = `${order.id}:1`;
    const itemTotal = order.unitAmount * order.quantity;

    await database.batch([
      database
        .prepare(
          `INSERT INTO orders (
            id, status, checkout_mode, payment_method, currency,
            subtotal_amount, total_amount, receipt_access_token_hash,
            created_at, updated_at
          ) VALUES (?, 'draft', ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          order.id,
          order.mode,
          order.paymentMethod,
          order.currency,
          itemTotal,
          order.totalAmount,
          order.receiptAccessTokenHash,
          order.createdAt,
          order.createdAt,
        ),
      database
        .prepare(
          `INSERT INTO order_items (
            id, order_id, product_id, product_name, quantity, unit_amount, total_amount
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        )
        .bind(
          itemId,
          order.id,
          order.product.id,
          order.product.name,
          order.quantity,
          order.unitAmount,
          itemTotal,
        ),
    ]);
  }

  async markPendingPayment(
    orderId: string,
    provider: PaymentProvider,
    providerReference: string,
  ): Promise<void> {
    const database = this.database ?? await getD1();
    const result = await database
      .prepare(
        `UPDATE orders
         SET status = 'pending_payment', payment_provider = ?, provider_reference = ?, updated_at = ?
         WHERE id = ? AND status = 'draft'`,
      )
      .bind(provider, providerReference, new Date().toISOString(), orderId)
      .run();

    if (result.meta.changes !== 1) {
      throw new Error("Không thể chuyển đơn hàng sang trạng thái chờ thanh toán.");
    }
  }
}
