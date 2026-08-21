import { sha256Hex } from "@/lib/crypto";
import type {
  ReceiptRepository,
  SalesReceipt,
} from "@/modules/invoicing/domain/receipt";

export class GetSalesReceipt {
  constructor(private readonly receipts: ReceiptRepository) {}

  async execute(orderId: string, accessToken: string): Promise<SalesReceipt | null> {
    if (!orderId || accessToken.length < 32) return null;
    return this.receipts.findPaidReceipt(orderId, await sha256Hex(accessToken));
  }
}
