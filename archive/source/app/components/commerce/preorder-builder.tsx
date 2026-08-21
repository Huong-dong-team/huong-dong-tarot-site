"use client";

import { useMemo, useState } from "react";
import { formatVnd } from "@/lib/money";
import type { CustomerIntent, Product } from "@/modules/catalog/domain/product";
import { recommendProducts } from "@/modules/recommendations/application/recommend-products";
import { BrowserEventAnalytics } from "@/modules/analytics/infrastructure/browser-event-analytics";

type DemoPaymentMethod = "momo-wallet" | "bank-transfer" | "card";

const demoPaymentOptions: readonly {
  value: DemoPaymentMethod;
  label: string;
  description: string;
}[] = [
  { value: "momo-wallet", label: "Ví MoMo", description: "Mô phỏng chuyển sang ứng dụng ví" },
  { value: "bank-transfer", label: "Chuyển khoản", description: "Mô phỏng QR/chuyển khoản ngân hàng" },
  { value: "card", label: "Visa", description: "Mô phỏng trang thẻ quốc tế" },
];

function PaymentDemoIcon({ method }: { method: DemoPaymentMethod }) {
  if (method === "bank-transfer") {
    return <svg viewBox="0 0 64 44" aria-hidden="true"><path d="M6 18 32 5l26 13M10 19h44M14 22v14M26 22v14M38 22v14M50 22v14M8 39h48" /></svg>;
  }
  if (method === "card") {
    return <svg viewBox="0 0 64 44" aria-hidden="true"><rect x="4" y="7" width="56" height="34" rx="5" /><path d="M4 17h56M11 31h14" /><text x="42" y="33">VISA</text></svg>;
  }
  return <svg viewBox="0 0 64 44" aria-hidden="true"><rect x="11" y="5" width="42" height="34" rx="10" /><path d="M20 30V15l7 10 5-10 5 10 7-10v15" /></svg>;
}

const intentOptions: readonly { value: CustomerIntent; label: string }[] = [
  { value: "beginner", label: "Mới học Tarot" },
  { value: "reader", label: "Reader thực hành" },
  { value: "collector", label: "Người sưu tầm" },
  { value: "gift", label: "Mua làm quà" },
];

const analytics = new BrowserEventAnalytics();

interface PreorderBuilderProps {
  products: readonly Product[];
  initialTier?: string;
}

export function PreorderBuilder({ products, initialTier }: PreorderBuilderProps) {
  const initialProduct = products.find((product) => product.slug === initialTier) ?? products[1] ?? products[0];
  const [intent, setIntent] = useState<CustomerIntent>("beginner");
  const [productId, setProductId] = useState(initialProduct.id);
  const [mode, setMode] = useState<"deposit" | "full-payment">("deposit");
  const [quantity, setQuantity] = useState(1);
  const [acknowledged, setAcknowledged] = useState(false);
  const [demoPaymentMethod, setDemoPaymentMethod] = useState<DemoPaymentMethod>("momo-wallet");
  const [demoCompleted, setDemoCompleted] = useState(false);

  const recommendations = useMemo(() => recommendProducts(products, intent), [products, intent]);
  const selected = products.find((product) => product.id === productId) ?? products[0];
  const unitAmount = mode === "deposit" ? selected.depositAmount : selected.price;
  const total = unitAmount * quantity;
  const selectedDemoPayment = demoPaymentOptions.find((option) => option.value === demoPaymentMethod) ?? demoPaymentOptions[0];

  function chooseProduct(nextProductId: string) {
    setDemoCompleted(false);
    setProductId(nextProductId);
    const product = products.find((item) => item.id === nextProductId);
    if (product) {
      analytics.track({
        name: "deposit_start",
        occurredAt: new Date().toISOString(),
        source: "preorder_builder",
        productId: product.id,
        value: product.depositAmount,
        currency: "VND",
      });
    }
  }

  return (
    <div className="preorder-layout">
      <section className="builder-panel" aria-labelledby="builder-title">
        <div className="builder-step">
          <span className="step-index">1</span>
          <div>
            <h2 id="builder-title">Bạn mua để làm gì?</h2>
            <div className="choice-row" role="group" aria-label="Mục đích mua">
              {intentOptions.map((option) => (
                <button
                  className={intent === option.value ? "choice is-selected" : "choice"}
                  key={option.value}
                  type="button"
                  aria-pressed={intent === option.value}
                  onClick={() => setIntent(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="recommendation-note">
              Gợi ý: {recommendations.map((product) => product.shortName).join(" · ")}
            </p>
          </div>
        </div>

        <div className="builder-step">
          <span className="step-index">2</span>
          <div>
            <h2>Chọn phiên bản</h2>
            <div className="tier-choices">
              {products.map((product) => (
                <label className={productId === product.id ? "tier-choice is-selected" : "tier-choice"} key={product.id}>
                  <input
                    type="radio"
                    name="product"
                    value={product.id}
                    checked={productId === product.id}
                    onChange={() => chooseProduct(product.id)}
                  />
                  <span>
                    <strong>{product.shortName}</strong>
                    <small>{formatVnd(product.price)}</small>
                  </span>
                  <em>{product.badge}</em>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="builder-step">
          <span className="step-index">3</span>
          <div>
            <h2>Phương thức thanh toán</h2>
            <div className="payment-choice-grid">
              <button type="button" className={mode === "deposit" ? "payment-choice is-selected" : "payment-choice"} onClick={() => setMode("deposit")}>
                <strong>Đặt cọc giữ suất</strong>
                <span>{formatVnd(selected.depositAmount)} / bộ</span>
              </button>
              <button type="button" className={mode === "full-payment" ? "payment-choice is-selected" : "payment-choice"} onClick={() => setMode("full-payment")}>
                <strong>Thanh toán đủ</strong>
                <span>{formatVnd(selected.price)} / bộ</span>
              </button>
            </div>
            <label className="quantity-field">
              <span>Số lượng</span>
              <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}>
                {[1, 2, 3, 4].map((value) => <option value={value} key={value}>{value}</option>)}
              </select>
            </label>
            <div className="demo-payment-block">
              <div className="demo-payment-heading">
                <div><strong>Kênh thanh toán mô phỏng</strong><span>Chỉ thử UX, không chuyển tiền</span></div>
                <span className="demo-badge">DEMO</span>
              </div>
              <div className="demo-payment-grid" role="group" aria-label="Chọn kênh thanh toán mô phỏng">
                {demoPaymentOptions.map((option) => (
                  <button
                    type="button"
                    className={demoPaymentMethod === option.value ? `demo-payment-option demo-${option.value} is-selected` : `demo-payment-option demo-${option.value}`}
                    aria-pressed={demoPaymentMethod === option.value}
                    key={option.value}
                    onClick={() => { setDemoPaymentMethod(option.value); setDemoCompleted(false); }}
                  >
                    <PaymentDemoIcon method={option.value} />
                    <strong>{option.label}</strong>
                    <span>{option.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="order-summary" aria-label="Tóm tắt lựa chọn">
        <span className="status-chip">Chưa thu tiền</span>
        <h2>Tóm tắt đơn hàng</h2>
        <div className="summary-line"><span>Phiên bản</span><strong>{selected.shortName}</strong></div>
        <div className="summary-line"><span>Hình thức</span><strong>{mode === "deposit" ? "Đặt cọc" : "Thanh toán đủ"}</strong></div>
        <div className="summary-line"><span>Số lượng</span><strong>{quantity}</strong></div>
        <div className="summary-line"><span>Kênh demo</span><strong>{selectedDemoPayment.label}</strong></div>
        <div className="summary-total"><span>Tạm tính demo</span><strong>{formatVnd(total)}</strong></div>
        <p className="shipping-note">Phí vận chuyển và thời hạn giao chỉ xác nhận sau print gate và báo giá fulfillment.</p>
        <label className="policy-check">
          <input type="checkbox" checked={acknowledged} onChange={(event) => setAcknowledged(event.target.checked)} />
          <span>Tôi đã đọc nguyên tắc đặt cọc, hoàn tiền và điều kiện sản xuất.</span>
        </label>
        <button className="button button-primary summary-button" type="button" disabled={!acknowledged} onClick={() => setDemoCompleted(true)}>
          Chạy mô phỏng thanh toán
        </button>
        <button className="button button-secondary summary-button live-payment-button" type="button" disabled>
          Thanh toán thật · Chưa mở
        </button>
        <p className="integration-note" id="payment-note">
          Demo không gọi API, không tạo đơn và không đổi trạng thái paid. Thanh toán thật chỉ mở sau khi MoMo/PSP, webhook và hợp đồng merchant được cấu hình.
        </p>
        {!acknowledged && <p className="validation-note">Tích xác nhận chính sách trước khi bước thanh toán được kích hoạt.</p>}
        {demoCompleted && (
          <div className="demo-result" role="status" aria-live="polite">
            <div className={`demo-result-icon demo-${demoPaymentMethod}`}><PaymentDemoIcon method={demoPaymentMethod} /></div>
            <div>
              <span className="demo-badge">MÔ PHỎNG THÀNH CÔNG</span>
              <h3>Đã xem thử luồng {selectedDemoPayment.label}</h3>
              <p>Không có tiền được chuyển, không có đơn hàng được tạo và không có biên nhận thanh toán thật.</p>
              <strong>{formatVnd(total)} · DEMO-{selected.id.toUpperCase()}-{quantity}</strong>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
