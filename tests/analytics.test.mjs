import test from "node:test";
import assert from "node:assert/strict";
import { analyticsSnippet } from "../scripts/lib/seo.js";

test("không nạp GA4 khi chưa cấu hình", () => {
  assert.equal(analyticsSnippet({}), "");
  assert.equal(analyticsSnippet({ ga4Id: "" }), "");
  assert.equal(analyticsSnippet({ ga4Id: "   " }), "");
});

test("nạp GA4 khi ID đúng định dạng", () => {
  const html = analyticsSnippet({ ga4Id: "G-ABC1234567" });
  assert.match(html, /googletagmanager\.com\/gtag\/js\?id=G-ABC1234567/);
  assert.match(html, /gtag\('config','G-ABC1234567'\)/);
});

test("bỏ qua ID sai định dạng và không chèn được mã lạ", () => {
  // ga4Id do admin nhập rồi được nhúng vào thẻ <script>; giá trị không hợp lệ
  // phải bị loại hoàn toàn, không được lọt bất kỳ ký tự nào ra HTML.
  for (const bad of ["G-ab", "UA-12345-1", "</script><script>alert(1)</script>", "G-ABC' );alert(1);//", "javascript:alert(1)"]) {
    assert.equal(analyticsSnippet({ ga4Id: bad }), "", `phải từ chối: ${bad}`);
  }
});
