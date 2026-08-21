import type { PaymentMethod } from "@/modules/checkout/domain/checkout";

export interface SalesReceipt {
  readonly orderId: string;
  readonly issuedAt: string;
  readonly productName: string;
  readonly quantity: number;
  readonly unitAmount: number;
  readonly totalAmount: number;
  readonly currency: "VND";
  readonly paymentMethod: PaymentMethod;
  readonly buyerName?: string;
  readonly buyerEmail?: string;
}

export interface ReceiptRepository {
  findPaidReceipt(
    orderId: string,
    accessTokenHash: string,
  ): Promise<SalesReceipt | null>;
}
