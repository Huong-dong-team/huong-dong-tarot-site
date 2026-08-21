import { getD1 } from "@/db";
import type { PaymentMethod } from "@/modules/checkout/domain/checkout";
import type {
  ReceiptRepository,
  SalesReceipt,
} from "@/modules/invoicing/domain/receipt";

interface ReceiptRow {
  readonly order_id: string;
  readonly issued_at: string;
  readonly product_name: string;
  readonly quantity: number;
  readonly unit_amount: number;
  readonly total_amount: number;
  readonly currency: "VND";
  readonly payment_method: PaymentMethod;
  readonly buyer_name: string | null;
  readonly buyer_email: string | null;
}

export class D1ReceiptRepository implements ReceiptRepository {
  constructor(private readonly database?: D1Database) {}

  async findPaidReceipt(
    orderId: string,
    accessTokenHash: string,
  ): Promise<SalesReceipt | null> {
    const database = this.database ?? await getD1();
    const row = await database
      .prepare(
        `SELECT
           o.id AS order_id,
           COALESCE(o.paid_at, o.updated_at) AS issued_at,
           i.product_name,
           i.quantity,
           i.unit_amount,
           o.total_amount,
           o.currency,
           o.payment_method,
           o.buyer_name,
           o.buyer_email
         FROM orders o
         JOIN order_items i ON i.order_id = o.id
         WHERE o.id = ?
           AND o.receipt_access_token_hash = ?
           AND o.status IN ('paid', 'confirmed', 'producing', 'ready_to_ship', 'shipped', 'delivered')
         LIMIT 1`,
      )
      .bind(orderId, accessTokenHash)
      .first<ReceiptRow>();

    if (!row) return null;

    return {
      orderId: row.order_id,
      issuedAt: row.issued_at,
      productName: row.product_name,
      quantity: row.quantity,
      unitAmount: row.unit_amount,
      totalAmount: row.total_amount,
      currency: row.currency,
      paymentMethod: row.payment_method,
      buyerName: row.buyer_name ?? undefined,
      buyerEmail: row.buyer_email ?? undefined,
    };
  }
}
