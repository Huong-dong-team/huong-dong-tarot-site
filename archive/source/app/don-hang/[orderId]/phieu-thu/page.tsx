import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReceiptActions } from "@/app/components/commerce/receipt-actions";
import { formatVnd } from "@/lib/money";
import { GetSalesReceipt } from "@/modules/invoicing/application/get-sales-receipt";
import { D1ReceiptRepository } from "@/modules/invoicing/infrastructure/d1-receipt-repository";

export const metadata: Metadata = {
  title: "Phiếu thu đơn hàng",
  description: "Phiếu thu bán hàng Hường Đông Tarot.",
  robots: { index: false, follow: false },
};

const paymentLabels = {
  "bank-transfer": "Chuyển khoản ngân hàng",
  "momo-wallet": "Ví MoMo",
  "apple-pay": "Apple Pay",
  card: "Thẻ Visa/Mastercard",
  "domestic-bank": "ATM/QR ngân hàng nội địa",
} as const;

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const [{ orderId }, { token }] = await Promise.all([params, searchParams]);
  if (!token) notFound();

  const receipt = await new GetSalesReceipt(new D1ReceiptRepository()).execute(
    orderId,
    token,
  );
  if (!receipt) notFound();

  return (
    <main id="noi-dung-chinh" className="receipt-page">
      <article className="receipt-document" aria-labelledby="receipt-title">
        <header>
          <p className="wordmark">Hường Đông</p>
          <p>Phiếu thu bán hàng · không phải hóa đơn điện tử thuế</p>
          <h1 id="receipt-title">Phiếu thu #{receipt.orderId}</h1>
          <p>Ngày lập: {new Intl.DateTimeFormat("vi-VN", { dateStyle: "long", timeStyle: "short" }).format(new Date(receipt.issuedAt))}</p>
        </header>
        <dl className="receipt-lines">
          <div><dt>Sản phẩm</dt><dd>{receipt.productName}</dd></div>
          <div><dt>Số lượng</dt><dd>{receipt.quantity}</dd></div>
          <div><dt>Đơn giá</dt><dd>{formatVnd(receipt.unitAmount)}</dd></div>
          <div><dt>Phương thức</dt><dd>{paymentLabels[receipt.paymentMethod]}</dd></div>
          {receipt.buyerName && <div><dt>Người mua</dt><dd>{receipt.buyerName}</dd></div>}
          {receipt.buyerEmail && <div><dt>Email</dt><dd>{receipt.buyerEmail}</dd></div>}
          <div className="receipt-total"><dt>Tổng đã thanh toán</dt><dd>{formatVnd(receipt.totalAmount)}</dd></div>
        </dl>
        <footer>
          <p>Phiếu này dùng để đối chiếu đơn hàng. Hóa đơn điện tử hợp pháp, nếu có, sẽ do nhà cung cấp đã đăng ký với cơ quan thuế phát hành.</p>
          <ReceiptActions />
        </footer>
      </article>
    </main>
  );
}
