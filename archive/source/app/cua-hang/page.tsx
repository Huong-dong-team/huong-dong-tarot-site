import type { Metadata } from "next";
import { ProductCard } from "@/app/components/product-card";
import { GetProducts } from "@/modules/catalog/application/get-products";
import { StaticProductRepository } from "@/modules/catalog/infrastructure/static-product-repository";

export const metadata: Metadata = {
  title: "Cửa hàng",
  description: "So sánh Early Bird, Standard và Collector của Hường Đông Tarot.",
};

const getProducts = new GetProducts(new StaticProductRepository());

export default async function ShopPage() {
  const products = await getProducts.execute();
  return (
    <main id="noi-dung-chinh">
      <section className="page-hero">
        <div className="shell page-hero-inner">
          <p className="eyebrow">Cửa hàng theo giai đoạn</p>
          <h1>Giá trị rõ ràng.<br />Cam kết có điều kiện.</h1>
          <p>Ba phiên bản phục vụ ba nhu cầu khác nhau. Giá và cấu phần dưới đây là nền tảng thử nghiệm; chỉ khóa sau prototype, báo giá và paid proof.</p>
        </div>
      </section>
      <section className="section">
        <div className="shell product-grid">{products.map((product) => <ProductCard product={product} key={product.id} />)}</div>
      </section>
      <section className="section commerce-foundation-section">
        <div className="shell split-heading section-heading">
          <div><p className="eyebrow">Commerce foundation</p><h2>Một cửa hàng chuyên nghiệp cần nhiều hơn nút “Mua”.</h2></div>
          <p>Nền tảng đã dành chỗ cho vòng đời đơn hàng, thanh toán webhook, vận chuyển, hoàn tiền, khuyến mãi, review đã mua và gợi ý sản phẩm - mỗi phần là một adapter độc lập.</p>
        </div>
        <div className="shell capability-list">
          {["Catalog & biến thể", "Giỏ hàng & báo giá", "Đặt cọc / thanh toán đủ", "Webhook & đối soát", "Vận chuyển & tracking", "Hoàn tiền & khiếu nại", "Review đã xác thực", "CRM & bỏ giỏ"].map((item, index) => (
            <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item}</strong></div>
          ))}
        </div>
      </section>
    </main>
  );
}
