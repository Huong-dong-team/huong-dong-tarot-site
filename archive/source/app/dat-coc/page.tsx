import type { Metadata } from "next";
import { PreorderBuilder } from "@/app/components/commerce/preorder-builder";
import { GetProducts } from "@/modules/catalog/application/get-products";
import { StaticProductRepository } from "@/modules/catalog/infrastructure/static-product-repository";

export const metadata: Metadata = {
  title: "Đặt cọc",
  description: "Chọn phiên bản và xem chính sách đặt cọc Hường Đông Tarot.",
};

const getProducts = new GetProducts(new StaticProductRepository());

export default async function DepositPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const [products, query] = await Promise.all([getProducts.execute(), searchParams]);
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero deposit-page-hero">
        <div className="shell page-hero-inner">
          <p className="eyebrow">Checkout chuẩn bị tích hợp</p>
          <h1>Chọn đúng phiên bản,<br />hiểu rõ trước khi trả tiền.</h1>
          <p>Giao diện dưới đây mô hình hóa luồng đặt cọc thật nhưng cố ý chưa nhận tiền cho đến khi cổng thanh toán, webhook và chính sách hoàn tiền được khóa.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell"><PreorderBuilder products={products} initialTier={query.tier} /></div>
      </section>
      <section className="policy-section">
        <div className="shell content-grid">
          <article className="content-card"><p className="eyebrow">Proof gate</p><h2>30 đặt cọc</h2><p>Xác nhận có tín hiệu trả tiền từ khách ngoài quan hệ cá nhân; chưa phải điều kiện đặt in.</p></article>
          <article className="content-card"><p className="eyebrow">Print gate</p><h2>250 đơn trả đủ</h2><p>Chỉ sản xuất khi tiền thu che ít nhất 120% nghĩa vụ sản xuất và fulfillment theo báo giá thật.</p></article>
        </div>
      </section>
    </main>
  );
}
