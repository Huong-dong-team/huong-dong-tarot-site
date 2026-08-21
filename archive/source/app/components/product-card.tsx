import type { Product } from "@/modules/catalog/domain/product";
import { formatVnd } from "@/lib/money";

export function ProductCard({ product }: { product: Product }) {
  const statusLabel = {
    preview: "Đang hoàn thiện",
    "interest-open": "Đang thử nghiệm nhu cầu",
    "deposit-open": "Đang nhận đặt cọc",
    preorder: "Đang mở pre-order",
    available: "Đang bán",
  }[product.status];

  return (
    <article className={`product-card accent-${product.accent}`}>
      <div className="product-card-top">
        <span className="product-badge">{product.badge}</span>
        <span className="product-status">{statusLabel}</span>
      </div>
      <h3>{product.shortName}</h3>
      <p>{product.description}</p>
      <p className="product-price">{formatVnd(product.price)}</p>
      <p className="deposit-price">Đặt cọc từ {formatVnd(product.depositAmount)}</p>
      <ul>
        {product.includes.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a className="text-link" href={`/dat-coc?tier=${product.slug}`}>
        Chọn phiên bản <span aria-hidden="true">→</span>
      </a>
    </article>
  );
}
