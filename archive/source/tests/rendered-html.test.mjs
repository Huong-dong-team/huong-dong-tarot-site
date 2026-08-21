import assert from "node:assert/strict";
import test from "node:test";

const developmentPreviewMeta = /<meta(?=[^>]*\bname=["']codex-preview["'])(?=[^>]*\bcontent=["']development["'])[^>]*>/i;

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  return { response, html: await response.text() };
}

test("renders development preview metadata", async () => {
  const { response, html } = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  assert.match(html, developmentPreviewMeta);
  assert.match(html, /Di sản Việt/);
  assert.match(html, /Nội dung nổi bật Hường Đông Tarot/);
  assert.match(html, /Xem slide tiếp theo/);
  assert.match(html, /\/images\/story-dawn\.webp/);
  assert.match(html, /\/images\/four-houses\.webp/);
  assert.match(html, /© 2026 NguyenHongKhang\. All rights reserved\./);
});

test("renders the featured Empress artwork from the shared visual registry", async () => {
  const { response, html } = await render("/bo-bai");
  assert.equal(response.status, 200);
  assert.match(html, /\/images\/empress-au-co\.webp/);
  assert.match(html, /Minh họa Âu Cơ/);
});

test("renders all primary product routes", async () => {
  const cases = [
    ["/bo-bai", /Học bằng liên tưởng/],
    ["/cau-chuyen", /bình minh Rồng Tiên/],
    ["/cua-hang", /Giá trị rõ ràng/],
    ["/dat-coc?tier=collector", /Chưa thu tiền/],
    ["/tarot-rws", /78 lá Tarot RWS/],
    ["/tarot-rws/the-empress", /Giải thích cho người mới/],
    ["/chiem-tinh", /bản đồ biểu tượng/],
    ["/hon-cot-nuoc-nam", /Hồn cốt nước Nam/],
    ["/ngoai-su", /Tám hồ sơ nguồn/],
  ];

  for (const [pathname, expected] of cases) {
    const { response, html } = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(html, expected, pathname);
  }
});

test("renders the home control and three completed Hồn cốt illustrations", async () => {
  const { response: homeResponse, html: homeHtml } = await render();
  assert.equal(homeResponse.status, 200);
  assert.match(homeHtml, /aria-label="Về trang chủ"/);

  const { response, html } = await render("/hon-cot-nuoc-nam");
  assert.equal(response.status, 200);
  assert.match(html, /\/images\/hon-cot\/lang-lieu\.webp/);
  assert.match(html, /\/images\/hon-cot\/an-duong-vuong\.webp/);
  assert.match(html, /\/images\/hon-cot\/hai-ba-trung\.webp/);
});

test("renders all 22 Major Arcana artworks and the corrected external-history labels", async () => {
  const { response: tarotResponse, html: tarotHtml } = await render("/tarot-rws");
  assert.equal(tarotResponse.status, 200);
  assert.match(tarotHtml, /\/images\/major-00-the-fool\.webp/);
  assert.match(tarotHtml, /\/images\/major-21-the-world\.webp/);
  assert.match(tarotHtml, /22 tranh đã hoàn thiện/);

  const { response: externalResponse, html: externalHtml } = await render("/ngoai-su");
  assert.equal(externalResponse.status, 200);
  assert.match(externalHtml, /92\.440 hộ, 746\.237 người/);
  assert.match(externalHtml, /Lịch Đạo Nguyên/);
  assert.match(externalHtml, /Độc sử phương dư kỷ yếu/);
  assert.match(externalHtml, /Hậu Hán Thư · Mã Viện liệt truyện/);
  assert.match(externalHtml, /Tân Đường Thư · Địa lý chí/);
});

test("returns a stable error instead of faking a payment session", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-checkout-api`);
  const { default: worker } = await import(workerUrl.href);
  const response = await worker.fetch(
    new Request("http://localhost/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId: "standard" }),
    }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    error: {
      code: "payment_provider_not_configured",
      message: "Cổng thanh toán thật đang khóa cho đến khi ADR và hợp đồng merchant được phê duyệt.",
    },
  });
});

test("keeps live payment disabled until a gateway is configured", async () => {
  const { html } = await render("/dat-coc");
  assert.match(html, /<button[^>]*disabled[^>]*>\s*Thanh toán thật · Chưa mở/s);
  assert.match(html, /Ví MoMo/);
  assert.match(html, /Chuyển khoản/);
  assert.match(html, /Visa/);
  assert.match(html, /Demo không gọi API, không tạo đơn và không đổi trạng thái paid/);
});
